// =====================================================
//  frontend/src/pages/Register.jsx
//  Registration form — name + email + password
// =====================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(form.name, form.email, form.password);
      login(data.user, data.token); // auto-login after register
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}>⚡ TaskFlow</div>
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.subtitle}>Start managing your tasks today</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={set('name')}
            required
          />

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={set('password')}
            required
          />

          <label style={styles.label}>Confirm Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Repeat your password"
            value={form.confirm}
            onChange={set('confirm')}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', background: '#f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  card: {
    background: '#fff', borderRadius: 16, padding: '40px 36px',
    width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,.1)',
  },
  logo:     { fontSize: 24, fontWeight: 900, color: '#6366f1', marginBottom: 8 },
  title:    { fontSize: 22, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' },
  subtitle: { fontSize: 14, color: '#94a3b8', margin: '0 0 24px' },
  error: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
    borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16,
  },
  label: {
    display: 'block', fontSize: 12, fontWeight: 700, color: '#475569',
    marginBottom: 5, marginTop: 14, textTransform: 'uppercase', letterSpacing: '.4px',
  },
  input: {
    width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0',
    borderRadius: 9, padding: '10px 14px', fontSize: 14, outline: 'none', color: '#1e293b',
  },
  btn: {
    width: '100%', background: '#6366f1', color: '#fff', border: 'none',
    borderRadius: 9, padding: '12px', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', marginTop: 20,
  },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' },
  link:   { color: '#6366f1', fontWeight: 700, textDecoration: 'none' },
};