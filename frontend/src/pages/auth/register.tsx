import { useState } from "react";
import { API_BASE_URL } from "../../utils/api";
import { setTokenCookie } from "../../utils/auth";
import { useRouter } from "next/router";
import styles from '../../styles/Auth.module.scss';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Register failed');
      if (json?.token) setTokenCookie(json.token);
      router.replace('/auth/login');
    } catch (err: any) {
      setError(err.message || 'Register failed');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Register</h1>
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.formItem}>
            <label className={styles.label}>Name</label>
            <input className={styles.input} type="text" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
          </div>
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
            <button className={`${styles.button} ${styles.primary}`} type="submit">Register</button>
            <button className={`${styles.button} ${styles.secondary}`} type="button" onClick={() => router.push('/auth/login')}>Back to Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}