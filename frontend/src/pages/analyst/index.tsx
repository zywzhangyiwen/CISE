import { GetServerSideProps, NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL, getAuthJson, putAuthJson } from '../../utils/api';
import { decodeToken, getTokenFromCookieStr } from '../../utils/auth';

type Article = {
  _id: string;
  title: string;
  authors: string[];
  source: string;
  pubyear: string;
  doi: string;
  claim?: string;
  sePractice?: string;
};

type Props = {
  token: string | null;
  pending: Article[];
};

const PRACTICES = ['TDD', 'Mob Programming'];
const CLAIMS: Record<string, string[]> = {
  'TDD': ['Improve code quality', 'Reduce deployment bugs', 'Increase test coverage'],
  'Mob Programming': ['Faster knowledge sharing', 'Improve team collaboration'],
};
const RESULTS = ['agree', 'disagree', 'mixed'];
const RESEARCH_TYPES = ['case study', 'experiment', 'survey'];
// Match backend enum: 'student' | 'practitioner' | 'mixed'
const PARTICIPANTS = ['student', 'practitioner', 'mixed'];

const AnalystPage: NextPage<Props> = ({ token, pending }) => {
  const payload = useMemo(() => decodeToken(token), [token]);
  const [list, setList] = useState<Article[]>(pending || []);
  const [form, setForm] = useState<{ [id: string]: {
    sePractice: string;
    claim: string;
    result: string;
    researchType: string;
    participantType: string;
  } }>({});

  // Initialize forms for all articles when list changes
  useEffect(() => {
    list.forEach(a => {
      setForm(prev => {
        // Only initialize if not already present
        if (prev[a._id]) {
          return prev;
        }
        const sePractice = a.sePractice || PRACTICES[0];
        const claim = a.claim || (CLAIMS[sePractice]?.[0] || '');
        return {
          ...prev,
          [a._id]: {
            sePractice,
            claim,
            result: RESULTS[0],
            researchType: RESEARCH_TYPES[0],
            participantType: PARTICIPANTS[1],
          }
        };
      });
    });
  }, [list]);

  const save = async (id: string) => {
    if (!token) {
      alert('请先登录');
      return;
    }
    const f = form[id];
    if (!f) return;
    try {
      await putAuthJson(`/api/articles/${id}/analyze`, token, f);
      alert('已保存');
      setList(prev => prev.filter(a => a._id !== id));
    } catch (e: any) {
      alert(e.message || '保存失败');
    }
  };

  return (
    <div className="container">
      <h1>Pending Analysis</h1>
      {!token && <p style={{ color: 'red' }}>Not logged in or no permission</p>}
      {list.length === 0 && <p>No items pending analysis</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {list.map(a => (
          <li key={a._id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>{a.title}</strong>
              <div style={{ color: '#666' }}>{Array.isArray(a.authors) ? a.authors.join(', ') : ''} · {a.source} · {a.pubyear}</div>
              <div style={{ color: '#666' }}>DOI: {a.doi}</div>
            </div>

            <div className="grid grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              <div>
                <label className="label">SE Practice</label>
                <select
                  className="select"
                  value={form[a._id]?.sePractice || ''}
                  onChange={(e) => {
                    const sp = e.target.value;
                    const firstClaim = (CLAIMS[sp] || [])[0] || '';
                    setForm(prev => ({ ...prev, [a._id]: { ...prev[a._id], sePractice: sp, claim: firstClaim } }));
                  }}
                >
                  {PRACTICES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Claim</label>
                <select
                  className="select"
                  value={form[a._id]?.claim || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, [a._id]: { ...prev[a._id], claim: e.target.value } }))}
                >
                  {(CLAIMS[form[a._id]?.sePractice] || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Evidence Result</label>
                <select
                  className="select"
                  value={form[a._id]?.result || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, [a._id]: { ...prev[a._id], result: e.target.value } }))}
                >
                  {RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Research Type</label>
                <select
                  className="select"
                  value={form[a._id]?.researchType || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, [a._id]: { ...prev[a._id], researchType: e.target.value } }))}
                >
                  {RESEARCH_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Participants</label>
                <select
                  className="select"
                  value={form[a._id]?.participantType || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, [a._id]: { ...prev[a._id], participantType: e.target.value } }))}
                >
                  {PARTICIPANTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <button className="btn btn-primary" onClick={() => save(a._id)}>Save Analysis</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const cookieStr = ctx.req.headers.cookie;
  const token = getTokenFromCookieStr(cookieStr);

  if (!token) {
    return { props: { token: null, pending: [] } };
  }

  try {
    const pending = await getAuthJson<Article[]>(`/api/articles/analysis/pending`, token);
    return { props: { token, pending } };
  } catch {
    return { props: { token, pending: [] } };
  }
};

export default AnalystPage;


