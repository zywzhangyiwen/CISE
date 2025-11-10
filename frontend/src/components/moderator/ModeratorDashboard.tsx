import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../utils/api";
import styles from "./ModeratorDashboard.module.scss";
import { Article } from "../../models/Article"; // <--- 关键改动：导入共享类型

// 移除了本地的 Article 类型定义

interface ModeratorDashboardProps {
  articles: Article[];
}

const ModeratorDashboard: React.FC<ModeratorDashboardProps> = ({ articles }) => {
  const [articlesState, setArticlesState] = useState<Article[]>(articles);
  const [selected, setSelected] = useState<Article | null>(
    articles && articles.length > 0 ? articles[0] : null
  );
  const [checkA, setCheckA] = useState(false);
  const [checkB, setCheckB] = useState(false);
  const [checkC, setCheckC] = useState(false);

  useEffect(() => {
    // 当选择的文章变化时，重置多选框
    setCheckA(false);
    setCheckB(false);
    setCheckC(false);
  }, [selected]);

  useEffect(() => {
    // Client-side fallback: if SSR didn't supply articles (e.g. cookie not present during SSR),
    // try fetching pending articles from the browser using the cookie token.
    const fetchPendingIfEmpty = async () => {
      if (articlesState && articlesState.length > 0) return;
      try {
        const token = document.cookie
          .split(";")
          .map((s) => s.trim())
          .find((s) => s.startsWith("speed_token="))
          ?.split("=")[1];
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/articles/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.error("Failed to fetch pending articles client-side", res.status);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          const mappedData: Article[] = data.map((a: any) => ({
            _id: a.id,
            title: a.title,
            authors: Array.isArray(a.authors) ? a.authors : String(a.authors || "").split(',').map(s => s.trim()),
            journal: a.source,
            year: Number(a.pubyear),
            doi: a.doi,
            claim: a.claim,
            evidence: a.evidence,
            status: a.moderationStatus,
          }));
          setArticlesState(mappedData);
          if (mappedData.length > 0) setSelected(mappedData[0]);
        }
      } catch (err) {
        console.error("Error fetching pending articles client-side", err);
      }
    };

    fetchPendingIfEmpty();
  }, []); // run once on mount

  const handleApprove = async () => {
    if (!(checkA && checkB && checkC)) {
      alert('Please confirm all three moderation criteria before approving.');
      return;
    }
    try {
      const token = document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('speed_token='))?.split('=')[1];
      if (!token || !selected) return;
      await fetch(`${API_BASE_URL}/api/articles/${selected._id}/moderate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'approved' })
      });
      window.location.reload();
    } catch (err) {
      console.error("Failed to approve article", err);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Reject reason (optional):') || undefined;
    try {
      const token = document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('speed_token='))?.split('=')[1];
      if (!token || !selected) return;
      await fetch(`${API_BASE_URL}/api/articles/${selected._id}/moderate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'rejected', reason })
      });
      window.location.reload();
    } catch (err) {
      console.error("Failed to reject article", err);
    }
  };

  const isApproveDisabled = !(checkA && checkB && checkC);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2 className={styles.title}>
          Pending Articles ({articlesState.length})
        </h2>
        {articlesState.length > 0 ? (
          articlesState.map((a) => (
            <div
              key={a._id}
              onClick={() => setSelected(a)}
              className={`${styles.article} ${
                selected?._id === a._id ? styles.active : ""
              }`}
            >
              <p className={styles.articleTitle}>{a.title}</p>
              <p className={styles.articleAuthors}>Author(s): {a.authors.join(', ')}</p>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No pending articles.</p>
          </div>
        )}
      </div>

      {selected ? (
        <div className={styles.detail}>
          <h1 className={styles.detailTitle}>{selected.title}</h1>
          
          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Authors</span>
              <span className={styles.metaValue}>{selected.authors.join(', ')}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Source</span>
              <span className={styles.metaValue}>{selected.journal}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Publication Year</span>
              <span className={styles.metaValue}>{selected.year}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>DOI</span>
              <span className={styles.metaValue}>{selected.doi}</span>
            </div>
          </div>

          <div className={styles.contentSection}>
            <h3 className={styles.contentLabel}>Claim</h3>
            <p className={styles.contentValue}>{selected.claim}</p>
          </div>

          <div className={styles.contentSection}>
            <h3 className={styles.contentLabel}>Evidence</h3>
            <p className={styles.contentValue}>{selected.evidence}</p>
          </div>

          <div className={styles.criteria}>
            <h3 className={styles.criteriaTitle}>Moderation Criteria</h3>
            <div className={styles.criteriaList}>
              <label className={styles.criteriaItem}>
                <input type="checkbox" className={styles.checkbox} checked={checkA} onChange={(e)=>setCheckA(e.target.checked)} />
                <span>Not duplicate in SPEED</span>
              </label>
              <label className={styles.criteriaItem}>
                <input type="checkbox" className={styles.checkbox} checked={checkB} onChange={(e)=>setCheckB(e.target.checked)} />
                <span>Relevant (empirical evidence)</span>
              </label>
              <label className={styles.criteriaItem}>
                <input type="checkbox" className={styles.checkbox} checked={checkC} onChange={(e)=>setCheckC(e.target.checked)} />
                <span>Peer-reviewed source</span>
              </label>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.approveBtn} ${isApproveDisabled ? styles.disabled : ''}`}
              onClick={handleApprove}
              disabled={isApproveDisabled}
            >
              Approve
            </button>
            <button
              className={styles.rejectBtn}
              onClick={handleReject}
            >
              Reject
            </button>
          </div>
        </div>
      ) : (
        <div className={`${styles.detail} ${styles.emptyState}`}>
            <h2>No Article Selected</h2>
            <p>Select an article from the list to view details.</p>
        </div>
      )}
    </div>
  );
};

export default ModeratorDashboard;