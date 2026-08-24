import React, { useState } from 'react';
import api from '../../api';

const C = {
  bg: '#0d0f1e',
  card: '#161830',
  border: '#2a2f5e',
  accent: '#6F78F0',
  text: '#F5F5FF',
  muted: '#7880b0',
  error: '#f43f5e',
};

interface AdminLoginPageProps {
  onLogin: (token: string, admin: any) => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email va parol kiriting"); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/admin/auth/login', { email, password });
      localStorage.setItem('admin_token', res.data.access_token);
      onLogin(res.data.access_token, res.data.admin);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, background: C.card, border: `1px solid ${C.border}`, borderRadius: 28, padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #6F78F0, #5a63c8)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(111,120,240,0.4)' }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 style={{ color: C.text, fontSize: '1.5rem', fontWeight: 900, marginBottom: 4 }}>FastUC Admin</h1>
          <p style={{ color: C.muted, fontSize: '0.85rem' }}>Boshqaruv paneli</p>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: C.muted, fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@fastuc.uz" style={{ width: '100%', background: '#0d0f1e', border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', color: C.text, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'Outfit, sans-serif' }} onFocus={e => (e.target.style.borderColor = C.accent)} onBlur={e => (e.target.style.borderColor = C.border)} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: C.muted, fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Parol</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', background: '#0d0f1e', border: `1.5px solid ${C.border}`, borderRadius: 14, padding: '14px 48px 14px 16px', color: C.text, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'Outfit, sans-serif' }} onFocus={e => (e.target.style.borderColor = C.accent)} onBlur={e => (e.target.style.borderColor = C.border)} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 0 }}>
                {showPass ? <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> : <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>}
              </button>
            </div>
          </div>
          {error && <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, color: C.error, fontSize: '0.82rem', fontWeight: 600 }}>⚠️ {error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? C.border : 'linear-gradient(135deg, #6F78F0, #5a63c8)', color: '#fff', fontWeight: 800, padding: '15px', borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>Kirilmoqda...</> : 'Kirish'}
          </button>
        </form>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default AdminLoginPage;
