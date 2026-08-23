import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
export default function AdminRoute({ children }) { const { user, profile, loading } = useAuth(); if (loading) return <p style={{ padding: 32 }}>กำลังตรวจสอบสิทธิ์...</p>; return user && profile?.role === 'admin' ? children : <Navigate to="/admin/login" replace />; }
