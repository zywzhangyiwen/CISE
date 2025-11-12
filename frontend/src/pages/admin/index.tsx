import { GetServerSideProps, NextPage } from 'next';
import { useEffect, useState } from 'react';
import { getAuthJson, putAuthJson } from '../../utils/api';
import { getTokenFromCookieStr, decodeToken } from '../../utils/auth';
import styles from '../../styles/Admin.module.scss';

type User = {
  _id: string;
  email: string;
  name: string;
  role: 'submitter' | 'moderator' | 'analyst' | 'admin';
};

type Config = {
  practices?: Record<string, any>;
  defaultColumns?: string[];
  notifications?: Record<string, any>;
};

const AdminPage: NextPage<{ token: string }> = ({ token }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'config' | 'articles'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [config, setConfig] = useState<Config>({});
  const [message, setMessage] = useState('');

  // --- User Management ---
  const fetchUsers = async () => {
    try {
      const data = await getAuthJson<User[]>('/api/admin/users', token);
      setUsers(data);
    } catch (e: any) {
      alert('Failed to fetch users: ' + e.message);
    }
  };

  const updateUserRole = async (userId: string, newRole: User['role']) => {
    try {
      await putAuthJson(`/api/admin/users/${userId}`, token, { role: newRole });
      setMessage('User role updated');
      fetchUsers(); // Refresh the list
    } catch (e: any) {
      alert('Failed to update user: ' + e.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  // --- System Configuration ---
  const fetchConfig = async () => {
    try {
      const data = await getAuthJson<Config>('/api/admin/config', token);
      setConfig(data);
    } catch (e: any) {
      alert('Failed to fetch config: ' + e.message);
    }
  };

  const saveConfig = async () => {
    try {
      await putAuthJson('/api/admin/config', token, config);
      setMessage('Configuration saved');
    } catch (e: any) {
      alert('Failed to save config: ' + e.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'config') fetchConfig();
  }, [activeTab]);

  const handleConfigChange = (section: keyof Config, value: any) => {
    setConfig(prev => ({ ...prev, [section]: value }));
  };

  // --- Article Management ---
  const [articleIdOrDoi, setArticleIdOrDoi] = useState('');
  const [articleUpdate, setArticleUpdate] = useState('');

  const patchArticle = async () => {
    if (!articleIdOrDoi || !articleUpdate) return alert('Please provide article ID/DOI and update JSON');
    try {
      const update = JSON.parse(articleUpdate);
      const res = await fetch(`/api/admin/articles/${encodeURIComponent(articleIdOrDoi)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage('Article updated');
    } catch (e: any) {
      alert('Failed to update article: ' + e.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.tabs}>
        <button className={activeTab === 'users' ? styles.active : ''} onClick={() => setActiveTab('users')}>User Management</button>
        <button className={activeTab === 'config' ? styles.active : ''} onClick={() => setActiveTab('config')}>System Config</button>
        <button className={activeTab === 'articles' ? styles.active : ''} onClick={() => setActiveTab('articles')}>Article Management</button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'users' && (
          <div className={styles.section}>
            <h2 className={styles.sectionHeader}>User Management</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.email}</td>
                    <td>{user.name}</td>
                    <td>{user.role}</td>
                    <td>
                      <select value={user.role} onChange={(e) => updateUserRole(user._id, e.target.value as User['role'])}>
                        <option value="submitter">submitter</option>
                        <option value="moderator">moderator</option>
                        <option value="analyst">analyst</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'config' && (
          <div className={styles.section}>
            <h2 className={styles.sectionHeader}>System Configuration</h2>
            <div className={styles.formGroup}>
              <label>SE Practices (JSON)</label>
              <textarea rows={8} value={JSON.stringify(config.practices || {}, null, 2)} onChange={e => handleConfigChange('practices', JSON.parse(e.target.value))} />
            </div>
            <div className={styles.formGroup}>
              <label>Default Columns (JSON Array)</label>
              <textarea rows={4} value={JSON.stringify(config.defaultColumns || [], null, 2)} onChange={e => handleConfigChange('defaultColumns', JSON.parse(e.target.value))} />
            </div>
            <div className={styles.formGroup}>
              <label>Notifications (JSON)</label>
              <textarea rows={6} value={JSON.stringify(config.notifications || {}, null, 2)} onChange={e => handleConfigChange('notifications', JSON.parse(e.target.value))} />
            </div>
            <button className={styles.primaryButton} onClick={saveConfig}>Save Configuration</button>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className={styles.section}>
            <h2 className={styles.sectionHeader}>Article Management</h2>
            <div className={styles.formGroup}>
              <label>Article _id or DOI</label>
              <input type="text" value={articleIdOrDoi} onChange={e => setArticleIdOrDoi(e.target.value)} placeholder="e.g. 507f1f77bcf86cd799439011 or 10.1000/182" />
            </div>
            <div className={styles.formGroup}>
              <label>Update JSON</label>
              <textarea rows={6} value={articleUpdate} onChange={e => setArticleUpdate(e.target.value)} placeholder='{"title":"New Title","claim":"Updated Claim"}' />
            </div>
            <button className={styles.primaryButton} onClick={patchArticle}>Update Article</button>
          </div>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = getTokenFromCookieStr(req.headers.cookie || '');
  const payload = token ? decodeToken(token) : null;
  if (!payload || payload.role !== 'admin') {
    return { redirect: { destination: '/auth/login', permanent: false } };
  }
  return { props: { token } };
};

export default AdminPage;