import { useState } from "react";
import { API_BASE_URL } from "../../utils/api";
import { setTokenCookie, decodeToken } from "../../utils/auth";
import { useRouter } from "next/router";
import styles from '../../styles/Auth.module.scss';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Login failed');
      if (json?.token) {
        setTokenCookie(json.token);
        const payload = decodeToken(json.token);
        if (payload?.role === 'admin') {
          router.replace('/admin');
        } else if (payload?.role === 'moderator') {
          router.replace('/moderator');
        } else if (payload?.role === 'analyst') {
          router.replace('/analyst');
        } else {
          // 提交者登录后查看自己的提交与审核通知页面
          router.replace('/my-moderation');
        }
      } else {
        throw new Error('No token received');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.formItem}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div className={styles.formItem}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.buttonContainer}>
            <button className={`${styles.button} ${styles.primary}`} type="submit">Login</button>
            <button className={`${styles.button} ${styles.secondary}`} type="button" onClick={() => router.push('/auth/register')}>Register</button>
          </div>
        </form>
      </div>
    </div>
  );
}