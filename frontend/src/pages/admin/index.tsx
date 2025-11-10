import { GetServerSideProps, NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { getAuthJson } from '../../utils/api';
import { decodeToken, getTokenFromCookieStr } from '../../utils/auth';

type Config = {
  practices: Record<string, string[]>;
  defaultColumns: string[];
  notifications: { notifyOnSubmission?: boolean; notifyOnModerationApproved?: boolean };
};

type Props = { token: string | null; initialConfig: Config | null };

const AdminPage: NextPage<Props> = ({ token, initialConfig }) => {
  const payload = useMemo(() => decodeToken(token), [token]);
  const [cfg, setCfg] = useState<Config>(initialConfig || { practices: {}, defaultColumns: [], notifications: {} });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { setMessage(''); }, [cfg]);

  const addPractice = () => {
    const name = prompt('Practice name');
    if (!name) return;
    setCfg(prev => ({ ...prev, practices: { ...prev.practices, [name]: prev.practices[name] || [] } }));
  };

  const addClaim = (p: string) => {
    const c = prompt(`Add claim for ${p}`);
    if (!c) return;
    setCfg(prev => ({ ...prev, practices: { ...prev.practices, [p]: [...(prev.practices[p]||[]), c] } }));
  };

  const removeClaim = (p: string, idx: number) => {
    setCfg(prev => ({ ...prev, practices: { ...prev.practices, [p]: (prev.practices[p]||[]).filter((_,i)=>i!==idx) } }));
  };

  const toggleColumn = (col: string) => {
    setCfg(prev => ({ ...prev, defaultColumns: prev.defaultColumns.includes(col) ? prev.defaultColumns.filter(c=>c!==col) : [...prev.defaultColumns, col] }));
  };

  const toggleNotify = (k: 'notifyOnSubmission'|'notifyOnModerationApproved') => {
    setCfg(prev => ({ ...prev, notifications: { ...prev.notifications, [k]: !prev.notifications?.[k] } }));
  };

  const save = async () => {
    if (!token) { alert('Not logged in'); return; }
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(cfg)
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage('Saved');
    } catch (e: any) {
      setMessage(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const patchArticle = async () => {
    if (!token) { alert('Not logged in'); return; }
    const idOrDoi = prompt('Article _id or DOI to edit');
    if (!idOrDoi) return;
    const field = prompt('Field to change (e.g., title, source, pubyear, claim, evidence)');
    if (!field) return;
    const value = prompt('New value');
    const body: any = { [field]: value };
    const res = await fetch(`/api/admin/articles/${encodeURIComponent(idOrDoi)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    if (!res.ok) alert(await res.text()); else alert('Updated');
  };

  const removeRating = async () => {
    if (!token) { alert('Not logged in'); return; }
    const id = prompt('Article _id');
    const userId = prompt('Rating userId to remove');
    if (!id || !userId) return;
    const res = await fetch(`/api/admin/articles/${id}/ratings`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) alert(await res.text()); else alert('Rating removed');
  };

  const ALL_COLUMNS = ['title','authors','pubyear','source','sePractice','claim','result','researchType','participantType','rating'];

  return (
    <div className="container">
      <h1>Admin</h1>
      {!payload || payload.role !== 'admin' ? (
        <p style={{ color: 'red' }}>You must be admin to access this page.</p>
      ) : (
        <>
          <section className="card">
            <h2>Practices & Claims</h2>
            <button className="btn btn-primary" onClick={addPractice}>Add Practice</button>
            <div className="space-y" style={{ marginTop: 8 }}>
              {Object.keys(cfg.practices || {}).length === 0 && <p>No practices configured</p>}
              {Object.entries(cfg.practices || {}).map(([p, claims]) => (
                <div key={p} className="card">
                  <strong>{p}</strong>
                  <button className="btn" style={{ marginLeft: 8 }} onClick={() => addClaim(p)}>Add claim</button>
                  <ul>
                    {(claims||[]).map((c, i) => (
                      <li key={i}>
                        {c} <button className="btn" onClick={() => removeClaim(p, i)}>Delete</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="card" style={{ marginTop: 12 }}>
            <h2>Default Columns</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {ALL_COLUMNS.map(col => (
                <label key={col}>
                  <input type="checkbox" checked={cfg.defaultColumns?.includes(col)} onChange={() => toggleColumn(col)} /> {col}
                </label>
              ))}
            </div>
          </section>

          <section className="card" style={{ marginTop: 12 }}>
            <h2>Notifications</h2>
            <label>
              <input type="checkbox" checked={!!cfg.notifications?.notifyOnSubmission} onChange={() => toggleNotify('notifyOnSubmission')} /> Notify on submission
            </label>
            <br />
            <label>
              <input type="checkbox" checked={!!cfg.notifications?.notifyOnModerationApproved} onChange={() => toggleNotify('notifyOnModerationApproved')} /> Notify when moderation approved
            </label>
          </section>

          <section className="card" style={{ marginTop: 12 }}>
            <h2>Data Tools</h2>
            <button className="btn" onClick={patchArticle}>Quick edit article</button>
            <button className="btn" style={{ marginLeft: 8 }} onClick={removeRating}>Remove a rating</button>
          </section>

          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Save All'}</button>
            {message && <span style={{ marginLeft: 8 }}>{message}</span>}
          </div>
        </>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const token = getTokenFromCookieStr(ctx.req.headers.cookie);
  if (!token) return { props: { token: null, initialConfig: null } };
  try {
    const cfg = await getAuthJson<Config>(`/api/admin/config`, token);
    return { props: { token, initialConfig: cfg } };
  } catch {
    return { props: { token, initialConfig: null } };
  }
};

export default AdminPage;


