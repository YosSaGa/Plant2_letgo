import { supabase } from './supabaseClient';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '242839622382-f32vp6tc623tqb92og0cc22hllvse98f.apps.googleusercontent.com';

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const STORAGE_KEY = 'plookploen_synced_calendar_reminders';

let tokenClient = null;
let currentAccessToken = null;
let tokenExpiresAt = 0;

export function getSavedReminders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Failed to parse saved calendar reminders:', e);
    return {};
  }
}

export function saveReminderStatus(uniqueKey, details) {
  try {
    const current = getSavedReminders();
    current[uniqueKey] = {
      syncedAt: new Date().toISOString(),
      ...details,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save reminder status:', e);
  }
}

export function removeReminderStatus(uniqueKey) {
  try {
    const current = getSavedReminders();
    delete current[uniqueKey];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to remove reminder status:', e);
  }
}

function waitForGoogleGIS(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google.accounts.oauth2);
      return;
    }
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve(window.google.accounts.oauth2);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(interval);
        reject(new Error('Google Identity Services script failed to load.'));
      }
    }, 100);
  });
}

export async function requestGoogleAccessToken() {
  if (currentAccessToken && Date.now() < tokenExpiresAt - 60000) {
    return currentAccessToken;
  }

  const oauth2 = await waitForGoogleGIS();

  return new Promise((resolve, reject) => {
    try {
      tokenClient = oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: CALENDAR_SCOPE,
        callback: (resp) => {
          if (resp.error) {
            console.error('Google OAuth error:', resp);
            reject(new Error(resp.error_description || resp.error));
            return;
          }
          currentAccessToken = resp.access_token;
          const expiresIn = Number(resp.expires_in) || 3600;
          tokenExpiresAt = Date.now() + expiresIn * 1000;
          resolve(resp.access_token);
        },
      });

      tokenClient.requestAccessToken({ prompt: '' });
    } catch (err) {
      reject(err);
    }
  });
}

export function formatIsoDate(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export async function createGoogleCalendarEvent({
  title,
  description,
  year,
  month,
  day,
  hour = 8,
  minute = 0,
  durationMinutes = 30,
}) {
  const token = await requestGoogleAccessToken();

  const startDate = new Date(year, month, day, hour, minute, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const eventPayload = {
    summary: title,
    description,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: 'Asia/Bangkok',
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'Asia/Bangkok',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'popup', minutes: 10 },
      ],
    },
    colorId: '10',
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Google Calendar API error (${response.status})`);
  }

  const result = await response.json();
  return {
    id: result.id,
    htmlLink: result.htmlLink,
  };
}

export async function batchCreateCalendarEvents(eventsList, onProgress) {
  if (!eventsList || eventsList.length === 0) {
    return { createdEvents: [], errors: [] };
  }

  const token = await requestGoogleAccessToken();
  const createdEvents = [];
  const errors = [];

  for (let i = 0; i < eventsList.length; i++) {
    const item = eventsList[i];
    try {
      const startDate = new Date(item.year, item.month, item.day, item.hour || 8, item.minute || 0, 0);
      const endDate = new Date(startDate.getTime() + (item.durationMinutes || 30) * 60000);

      const eventPayload = {
        summary: item.title,
        description: item.description,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'Asia/Bangkok',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Asia/Bangkok',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'popup', minutes: 10 },
          ],
        },
        colorId: item.colorId || '10',
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      });

      if (response.ok) {
        const result = await response.json();
        createdEvents.push(result);

        await syncActivityToSupabase({
          userPlantId: item.userPlantId,
          activityType: item.activityType || item.title,
          dueDate: formatIsoDate(item.year, item.month, item.day),
          syncedToGoogle: true,
        });

        if (item.uniqueKey) {
          saveReminderStatus(item.uniqueKey, {
            eventId: result.id,
            htmlLink: result.htmlLink,
            title: item.title,
            date: formatIsoDate(item.year, item.month, item.day),
          });
        }
      } else {
        const errJson = await response.json().catch(() => ({}));
        errors.push({ item, error: errJson?.error?.message || response.statusText });
      }
    } catch (e) {
      errors.push({ item, error: e.message });
    }

    if (onProgress) {
      onProgress(i + 1, eventsList.length);
    }
  }

  return { createdEvents, errors };
}

export function downloadIcsFile(eventsList, filename = 'plookploen-calendar.ics') {
  if (!eventsList || eventsList.length === 0) return;

  const pad = (n) => String(n).padStart(2, '0');
  const formatIcsDate = (d) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PlookPloen//Plant Care Schedule//TH',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:ตารางดูแลพืช - ปลูกเพลิน',
    'X-WR-TIMEZONE:Asia/Bangkok',
  ];

  eventsList.forEach((ev, idx) => {
    const start = new Date(ev.year, ev.month, ev.day, ev.hour || 8, ev.minute || 0);
    const end = new Date(start.getTime() + (ev.durationMinutes || 30) * 60000);
    const now = new Date();

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:plookploen-${Date.now()}-${idx}@plookploen.app`,
      `DTSTAMP:${formatIcsDate(now)}Z`,
      `DTSTART;TZID=Asia/Bangkok:${formatIcsDate(start)}`,
      `DTEND;TZID=Asia/Bangkok:${formatIcsDate(end)}`,
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:${(ev.description || '').replace(/\n/g, '\\n')}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      'DESCRIPTION:แจ้งเตือนดูแลพืช',
      'END:VALARM',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getGoogleCalendarWebIntentUrl({
  title,
  description,
  year,
  month,
  day,
  hour = 8,
  minute = 0,
  durationMinutes = 30,
}) {
  const startDate = new Date(year, month, day, hour, minute, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const pad = (n) => String(n).padStart(2, '0');
  const formatUtcCompact = (d) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  const datesParam = `${formatUtcCompact(startDate)}/${formatUtcCompact(endDate)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: datesParam,
    details: description,
    location: 'แปลงปลูก / กระถางพืช',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export async function syncActivityToSupabase({
  userPlantId = null,
  activityType,
  dueDate,
  isDone = false,
  syncedToGoogle = true,
}) {
  if (!supabase) return null;
  try {
    const payload = {
      activity_type: activityType,
      due_date: dueDate,
      is_done: isDone,
      synced_to_google: syncedToGoogle,
    };
    if (userPlantId) {
      payload.user_plant_id = userPlantId;
    }

    const { data, error } = await supabase.from('calendar_activities').insert([payload]).select();
    if (error) {
      console.warn('Supabase calendar_activities sync notice:', error.message);
      return null;
    }
    return data?.[0] || null;
  } catch (err) {
    console.warn('syncActivityToSupabase exception:', err);
    return null;
  }
}
