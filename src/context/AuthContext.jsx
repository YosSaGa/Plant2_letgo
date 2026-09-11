import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import LogoutConfirmModal from '../component/auth/LogoutConfirmModal';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pendingLogoutAction, setPendingLogoutAction] = useState(null);

  const loadProfile = async (userId, userEmail) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) {
        setProfile(data);
      } else {
        setProfile({
          id: userId,
          email: userEmail,
          display_name: userEmail?.split('@')[0] || 'ผู้ใช้งาน',
          role: 'user',
          province: 'สุราษฎร์ธานี',
        });
      }
    } catch (e) {
      console.warn('loadProfile error:', e);
    }
  };

  // ดึง session เมื่อเปิดแอป
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  // ฟังก์ชันเข้าสู่ระบบ
  // ฟังก์ชันเข้าสู่ระบบผู้ใช้งานทั่วไป (Real Supabase Auth)
  const login = async (data = {}) => {
    const email = data.email?.trim();
    const password = data.password;

    if (!email || !password) {
      throw new Error('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
    }

    if (!supabase) {
      throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูล Supabase ได้');
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
      }
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }

    if (authData?.user) {
      setUser(authData.user);
      const prof = await loadProfile(authData.user.id, email);
      return { success: true, user: authData.user, profile: prof };
    }

    throw new Error('ไม่พบข้อมูลผู้ใช้งาน');
  };

  // ฟังก์ชันสมัครสมาชิก (บันทึกข้อมูลเข้า Supabase Auth & profiles จริง)
  const register = async (data = {}) => {
    const email = data.email?.trim();
    const password = data.password;
    const displayName = data.displayName || data.display_name || email?.split('@')[0] || 'ผู้ใช้งาน';
    const province = data.province || 'สุราษฎร์ธานี';
    const district = data.district || 'เมือง';

    if (!email || !password) {
      throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
    }

    if (!supabase) {
      throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูล Supabase ได้');
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          province,
          district,
          role: 'user',
        },
      },
    });

    if (error) {
      if (error.message?.includes('already registered')) {
        throw new Error('อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบ');
      }
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    }

    if (authData?.user) {
      setUser(authData.user);
      const prof = await loadProfile(authData.user.id, email);
      return { success: true, user: authData.user, profile: prof };
    }

    return { success: true };
  };

  // ฟังก์ชันเข้าสู่ระบบผู้ดูแล (Real Supabase Auth + ตรวจสอบสิทธิ์ Admin)
  const loginAsAdmin = async (data = {}) => {
    const email = data.email?.trim();
    const password = data.password;

    if (!email || !password) {
      throw new Error('กรุณากรอกอีเมลและรหัสผ่านผู้ดูแล');
    }

    if (!supabase) {
      throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูล Supabase ได้');
    }

    // 1. ตรวจสอบรหัสผ่านกับ Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message?.includes('Invalid login credentials')) {
        throw new Error('อีเมลหรือรหัสผ่านผู้ดูแลไม่ถูกต้อง');
      }
      throw new Error(authError.message || 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์');
    }

    if (!authData?.user) {
      throw new Error('ไม่สามารถยืนยันตัวตนผู้ดูแลระบบได้');
    }

    // 2. ดึงโปรไฟล์และตรวจสอบบทบาท role === 'admin'
    const { data: prof, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profError || !prof || prof.role !== 'admin') {
      // หากไม่ใช่แอดมิน ให้ sign out ทันทีเพื่อความปลอดภัย
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      throw new Error('บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ (สำหรับผู้ดูแลระบบที่มีสิทธิ์เท่านั้น)');
    }

    // 3. กำหนด Session และ Profile แอดมินจริง
    setUser(authData.user);
    setProfile(prof);
    return { success: true, user: authData.user, profile: prof };
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
    try {
      localStorage.removeItem('plookploen_test_user');
      sessionStorage.removeItem('plookploen_test_user');
      sessionStorage.removeItem('plookploen_autorun');
      localStorage.removeItem('plookploen_livetest_active');
    } catch (_) {}
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
  };

  const requestLogout = (onComplete) => {
    setPendingLogoutAction(() => (typeof onComplete === 'function' ? onComplete : null));
    setIsLogoutConfirmOpen(true);
  };

  const cancelLogout = () => {
    if (isLoggingOut) return;
    setIsLogoutConfirmOpen(false);
    setPendingLogoutAction(null);
  };

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      if (typeof pendingLogoutAction === 'function') {
        try {
          await pendingLogoutAction();
        } catch (_) {}
      }
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
      setPendingLogoutAction(null);
    }
  };

  const updateProfile = async (changes) => {
    setProfile((current) => ({ ...current, ...changes }));
    if (changes.email) setUser((current) => ({ ...current, email: changes.email }));

    if (supabase && user?.id && user.id !== 'mock-user') {
      try {
        await supabase.from('profiles').update(changes).eq('id', user.id);
      } catch (e) {
        console.warn('updateProfile Supabase error:', e);
      }
    }
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      login,
      register,
      loginAsAdmin,
      logout,
      signOut: logout,
      requestLogout,
      cancelLogout,
      confirmLogout,
      isLogoutConfirmOpen,
      updateProfile
    }),
    [user, profile, loading, isLogoutConfirmOpen, isLoggingOut, pendingLogoutAction]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
