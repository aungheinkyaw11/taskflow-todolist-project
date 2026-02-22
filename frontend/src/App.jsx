// =====================================================
//  frontend/src/App.jsx  (updated header with auth)
//
//  Only the HEADER section changed from before.
//  It now shows:
//  - The logged-in user's name
//  - A logout button
//
//  Replace just the header section in your App.jsx
//  OR replace the whole file with this one.
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { getTasks, getStats, createTask, updateTask, deleteTask } from './api.js';


// ── Badge component ───────────────────────────────────
const BADGE_STYLES = {
  high:        { background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' },
  medium:      { background: '#fffbeb', color: '#f59e0b', border: '1px solid #fde68a' },
  low:         { background: '#f0fdf4', color: '#22c55e', border: '1px solid #bbf7d0' },
  todo:        { background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' },
  in_progress: { background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' },
  done:        { background: '#f0fdf4', color: '#22c55e', border: '1px solid #bbf7d0' },
};
const BADGE_LABELS = {
  high: 'High', medium: 'Medium', low: 'Low',
  todo: 'To Do', in_progress: 'In Progress', done: 'Done',
};
function Badge({ value }) {
  return (
    <span style={{ ...styles.badge, ...(BADGE_STYLES[value] || {}) }}>
      {BADGE_LABELS[value] || value}
    </span>
  );
}


// ── StatsBar ──────────────────────────────────────────
function StatsBar({ stats }) {
  const cards = [
    { label: 'Total Tasks',   value: stats.total,         color: '#6366f1' },
    { label: 'To Do',         value: stats.todo,          color: '#6b7280' },
    { label: 'In Progress',   value: stats.in_progress,   color: '#3b82f6' },
    { label: 'Done',          value: stats.done,          color: '#22c55e' },
    { label: 'High Priority', value: stats.high_priority, color: '#ef4444' },
  ];
  return (
    <div style={styles.statsRow}>
      {cards.map((c) => (
        <div key={c.label} style={{ ...styles.statCard, borderTop: `3px solid ${c.color}` }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: c.color }}>{c.value ?? '—'}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}


// ── TaskCard ──────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const isOverdue = task.due_date && task.status !== 'done' &&
    new Date(new Date(task.due_date).toDateString()) < today;

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 15,
            color: task.status === 'done' ? '#94a3b8' : '#1e293b',
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{task.title}</div>
          {task.description && (
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 5, lineHeight: 1.45 }}>
              {task.description.slice(0, 90)}{task.description.length > 90 && '…'}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={() => onEdit(task)}      style={styles.iconBtn} title="Edit">✏️</button>
          <button onClick={() => onDelete(task.id)} style={styles.iconBtn} title="Delete">🗑️</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, alignItems: 'center' }}>
        <Badge value={task.priority} />
        <select value={task.status} onChange={(e) => onStatusChange(task.id, e.target.value)} style={styles.statusSelect}>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        {task.due_date && (
          <span style={{ fontSize: 12, color: isOverdue ? '#ef4444' : '#94a3b8', fontWeight: isOverdue ? 700 : 400, marginLeft: 'auto' }}>
            {isOverdue ? '⚠ Overdue · ' : '📅 '}
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}


// ── TaskModal ─────────────────────────────────────────
function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({
    title: task?.title || '', description: task?.description || '',
    status: task?.status || 'todo', priority: task?.priority || 'medium',
    due_date: task?.due_date?.slice(0, 10) || '',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try {
      const saved = task ? await updateTask(task.id, form) : await createTask(form);
      onSave(saved, !!task);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div style={styles.errorBox}>{error}</div>}
          <label style={styles.label}>Title *</label>
          <input style={styles.input} value={form.title} onChange={set('title')} placeholder="What needs to be done?" />
          <label style={styles.label}>Description</label>
          <textarea style={{ ...styles.input, height: 80, resize: 'vertical' }} value={form.description} onChange={set('description')} placeholder="Optional details…" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={styles.label}>Status</label>
              <select style={styles.input} value={form.status} onChange={set('status')}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Priority</label>
              <select style={styles.input} value={form.priority} onChange={set('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <label style={styles.label}>Due Date</label>
          <input type="date" style={styles.input} value={form.due_date} onChange={set('due_date')} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}>
            <button type="button" onClick={onClose} style={styles.btnSecondary}>Cancel</button>
            <button type="submit" disabled={saving} style={styles.btnPrimary}>{saving ? 'Saving…' : task ? 'Update Task' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ── Main App ──────────────────────────────────────────
export default function App() {
  const { user, logout } = useAuth(); // ← get logged-in user + logout function

  const [tasks,    setTasks]    = useState([]);
  const [stats,    setStats]    = useState({});
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [fStatus,  setFStatus]  = useState('');
  const [fPriority,setFPriority]= useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [taskList, statsData] = await Promise.all([
        getTasks({ status: fStatus, priority: fPriority }),
        getStats(),
      ]);
      setTasks(taskList);
      setStats(statsData);
    } catch (err) {
      setError('Could not load tasks. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [fStatus, fPriority]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = (saved, isUpdate) => {
    setTasks((prev) => isUpdate ? prev.map((t) => t.id === saved.id ? saved : t) : [saved, ...prev]);
    setModal(null);
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    fetchAll();
  };

  const handleStatusChange = async (id, status) => {
    const updated = await updateTask(id, { status });
    setTasks((prev) => prev.map((t) => t.id === id ? updated : t));
    fetchAll();
  };

  const displayed = tasks.filter((t) =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>

      {/* ── Header with user info + logout ── */}
      <header style={styles.header}>
        <div>
          <div style={styles.logoText}>⚡ TaskFlow</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Full-Stack Task Manager</div>
        </div>

        {/* Right side: user name + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>👤 {user?.name}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{user?.email}</div>
          </div>
          <button onClick={logout} style={styles.btnSecondary}>Logout</button>
          <button onClick={() => setModal('new')} style={styles.btnPrimary}>+ New Task</button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div style={styles.container}>
        {error && <div style={styles.errorBox}>⚠ {error}</div>}
        <StatsBar stats={stats} />

        <div style={styles.filtersRow}>
          <input style={{ ...styles.input, flex: 1, minWidth: 180 }} placeholder="🔍 Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select style={styles.input} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select style={styles.input} value={fPriority} onChange={(e) => setFPriority(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading tasks…</div>
        ) : displayed.length === 0 ? (
          <div style={styles.emptyState}>
            No tasks yet.{' '}
            <span style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 700 }} onClick={() => setModal('new')}>Create one!</span>
          </div>
        ) : (
          <div style={styles.grid}>
            {displayed.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={setModal} onDelete={handleDelete} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <TaskModal task={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────
const styles = {
  header: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 4px rgba(0,0,0,.05)' },
  logoText: { fontSize: 22, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.5px' },
  container: { maxWidth: 1140, margin: '0 auto', padding: '28px 20px 60px' },
  statsRow: { display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' },
  statCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 22px', flex: '1 1 110px', minWidth: 100 },
  filtersRow: { display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.05)' },
  badge: { borderRadius: 6, padding: '3px 10px', fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' },
  statusSelect: { border: '1px solid #e2e8f0', borderRadius: 7, padding: '4px 8px', fontSize: 12, background: '#f8fafc', color: '#374151', outline: 'none', cursor: 'pointer' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '4px 6px', borderRadius: 6 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 },
  modal: { background: '#fff', borderRadius: 16, padding: 30, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  closeBtn: { background: 'none', border: 'none', fontSize: 20, color: '#94a3b8', cursor: 'pointer' },
  label: { display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5, marginTop: 14, textTransform: 'uppercase', letterSpacing: '.4px' },
  input: { width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0', borderRadius: 9, padding: '10px 14px', fontSize: 14, outline: 'none', color: '#1e293b', background: '#fff' },
  btnPrimary: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  btnSecondary: { background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 9, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 16 },
  emptyState: { textAlign: 'center', padding: '70px 0', color: '#94a3b8', fontSize: 15 },
};