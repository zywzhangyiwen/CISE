import { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import { getJson, postAuthJson } from "../../utils/api";
import { decodeToken, getTokenFromCookieStr } from "../../utils/auth";

type ArticleRow = {
  _id: string;
  title: string;
  authors: string[];
  source: string;
  pubyear: string;
  doi: string;
  sePractice?: string;
  claim?: string;
  result?: string;
  researchType?: string;
  participantType?: string;
  averageRating?: number;
};

type SearchResponse = {
  articles: ArticleRow[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

const FIXED_PRACTICES: Record<string, string[]> = {
  TDD: ["Improve code quality", "Reduce deployment bugs", "Increase test coverage"],
  "Mob Programming": ["Faster knowledge sharing", "Improve team collaboration"],
};

const LOCAL_PRESET_KEY = "submitter_search_preset";

const ArticlesPage: NextPage = () => {
  const [sePractice, setSePractice] = useState<string>("TDD");
  const [claim, setClaim] = useState<string>("");
  const [minYear, setMinYear] = useState<string>("");
  const [maxYear, setMaxYear] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("pubyear");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [rows, setRows] = useState<ArticleRow[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const availableClaims = useMemo(() => FIXED_PRACTICES[sePractice] || [], [sePractice]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(LOCAL_PRESET_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        setSePractice(p.sePractice ?? sePractice);
        setClaim(p.claim ?? "");
        setMinYear(p.minYear ?? "");
        setMaxYear(p.maxYear ?? "");
        setSortBy(p.sortBy ?? "pubyear");
        setSortOrder(p.sortOrder ?? "desc");
      }
    } catch {}
  }, []);

  const fetchData = async (goToPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (sePractice) params.set("sePractice", sePractice);
      if (claim) params.set("claim", claim);
      if (minYear) params.set("minYear", minYear);
      if (maxYear) params.set("maxYear", maxYear);
      params.set("page", String(goToPage));
      params.set("limit", String(limit));
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const res = await getJson<SearchResponse>(`/api/articles/search?${params.toString()}`);
      setRows(res.articles || []);
      setTotal(res.pagination?.total || 0);
      setPage(res.pagination?.page || goToPage);
    } catch (e: any) {
      setError(e.message || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savePreset = () => {
    if (typeof window === 'undefined') return;
    const preset = { sePractice, claim, minYear, maxYear, sortBy, sortOrder };
    localStorage.setItem(LOCAL_PRESET_KEY, JSON.stringify(preset));
    alert("查询条件已保存");
  };

  const handleHeaderSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    fetchData(page);
  };

  const token = useMemo(() => {
    if (typeof document === 'undefined') return null;
    return getTokenFromCookieStr(document.cookie);
  }, []);
  const payload = useMemo(() => decodeToken(token), [token]);

  const rate = async (articleId: string, rating: number) => {
    if (!token || !payload?.userId) {
      alert('请先登录后再评分');
      return;
    }
    try {
      const res = await postAuthJson<{ averageRating: number }>(
        `/api/articles/${articleId}/rate`,
        token,
        { userId: payload.userId, rating }
      );
      setRows((prev) => prev.map(r => r._id === articleId ? { ...r, averageRating: res.averageRating } : r));
    } catch (e: any) {
      alert(e.message || '评分失败');
    }
  };

  return (
    <div className="container">
      <h1>Article Search & Ratings</h1>

      <div className="card" style={{ marginTop: 8 }}>
        <div className="grid grid-6" style={{ alignItems: 'end' }}>
          <div>
            <label className="label">SE Practice</label>
            <select className="select" value={sePractice} onChange={(e) => { setSePractice(e.target.value); setClaim(""); }}>
            {Object.keys(FIXED_PRACTICES).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
            </select>
          </div>
          <div>
            <label className="label">Claim</label>
            <select className="select" value={claim} onChange={(e) => setClaim(e.target.value)}>
            <option value="">All</option>
            {(FIXED_PRACTICES[sePractice] || []).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            </select>
          </div>
          <div>
            <label className="label">Min Year</label>
            <input className="input" type="number" value={minYear} onChange={(e) => setMinYear(e.target.value)} placeholder="e.g. 2005" />
          </div>
          <div>
            <label className="label">Max Year</label>
            <input className="input" type="number" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} placeholder="e.g. 2025" />
          </div>
          <div>
            <button className="btn btn-primary" onClick={() => fetchData(1)}>Apply Filters</button>
          </div>
          <div>
            <button className="btn" onClick={savePreset}>Save Current Query</button>
          </div>
        </div>
      </div>

      <div className="space-y" style={{ marginTop: '12px' }}>
        {loading && <p>Loading...</p>}
        {error && <p className="muted" style={{ color: 'red' }}>{error}</p>}
        {!loading && rows.length === 0 && <p>No results</p>}

        {rows.length > 0 && (
          <table className="table card">
            <thead>
              <tr>
                {[
                  { key: 'title', label: 'Title' },
                  { key: 'authors', label: 'Authors' },
                  { key: 'pubyear', label: 'Year' },
                  { key: 'source', label: 'Source' },
                  { key: 'sePractice', label: 'SE Practice' },
                  { key: 'claim', label: 'Claim' },
                  { key: 'result', label: 'Evidence Result' },
                  { key: 'researchType', label: 'Research Type' },
                  { key: 'participantType', label: 'Participants' },
                  { key: 'rating', label: 'Rating' },
                ].map((h) => (
                  <th
                    key={h.key}
                    style={{ cursor: ['authors','pubyear','claim','result'].includes(h.key) ? 'pointer' : 'default' }}
                    onClick={() => ['authors','pubyear','claim','result'].includes(h.key) ? handleHeaderSort(h.key) : undefined}
                    title={['authors','pubyear','claim','result'].includes(h.key) ? 'Click to sort' : ''}
                  >
                    {h.label}
                    {sortBy === h.key && <span> {sortOrder === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r._id}>
                  <td>{r.title}</td>
                  <td>{Array.isArray(r.authors) ? r.authors.join(', ') : ''}</td>
                  <td>{r.pubyear}</td>
                  <td>{r.source}</td>
                  <td>{r.sePractice || ''}</td>
                  <td>{r.claim || ''}</td>
                  <td>{r.result || ''}</td>
                  <td>{r.researchType || ''}</td>
                  <td>{r.participantType || ''}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ marginRight: 8 }}>{typeof r.averageRating === 'number' ? r.averageRating.toFixed(1) : '—'}</span>
                    <span className="stars">
                      {[1,2,3,4,5].map(n => (
                        <button
                          key={n}
                          onClick={() => rate(r._id, n)}
                          aria-label={`rate-${n}`}
                          className={((r.averageRating || 0) >= n) ? 'active' : ''}
                        >
                          ★
                        </button>
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {rows.length > 0 && (
          <div style={{ marginTop: '8px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn" onClick={() => { const p = Math.max(1, page - 1); fetchData(p); }}>Prev</button>
            <span>Page {page} / {Math.ceil(total / limit) || 1} (Total {total})</span>
            <button className="btn" onClick={() => { const p = page + 1; if ((page * limit) < total) fetchData(p); }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesPage;
