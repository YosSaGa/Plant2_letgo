import { createContext, useContext, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [profile, setProfile] = useState(null);
  // TODO: MOCK AUTH — replace these state setters with real Supabase auth for production.
  const login = (data = {}) => { const email = data.email || 'guest@plookploen.demo'; setUser({ id: 'mock-user', email }); setProfile({ id: 'mock-user', display_name: data.display_name || data.displayName || 'ผู้ใช้ทดสอบ', role: 'user' }); };
  const loginAsAdmin = (data = {}) => { const email = data.email || 'admin@plookploen.demo'; setUser({ id: 'mock-admin', email }); setProfile({ id: 'mock-admin', display_name: data.display_name || 'ผู้ดูแลระบบ', role: 'admin' }); };
  const logout = async () => { setUser(null); setProfile(null); if (supabase) await supabase.auth.signOut(); };
  const value = useMemo(() => ({ user, profile, loading: false, login, loginAsAdmin, logout, signOut: logout }), [user, profile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
