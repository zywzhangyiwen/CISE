import { FormEvent, useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { API_BASE_URL } from "../../utils/api";
import { getTokenFromCookieStr, decodeToken } from "../../utils/auth";
import formStyles from "../../styles/Form.module.scss";
import { useRouter } from 'next/router';
import bibtexParse from 'bibtex-parse-js';

const NewDiscussion = () => {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState<string[]>([]);
  const [source, setSource] = useState("");
  const [pubYear, setPubYear] = useState<number>(0);
  const [doi, setDoi] = useState("");
  const [claim, setClaim] = useState("");
  const [evidence, setEvidence] = useState("");
  const [submitter, setSubmitter] = useState("");
  const [bibtexError, setBibtexError] = useState("");
  const router = useRouter();

  // Try to auto-fill submitter from token if available
  useEffect(() => {
    try {
      const token = typeof document !== 'undefined'
        ? document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith('speed_token='))?.split('=')[1]
        : null;
      const payload = decodeToken(token || null);
      if (payload?.email) setSubmitter(payload.email);
    } catch (e) {
      // ignore
    }
  }, []);

  const submitNewArticle = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // simple client-side validation
    if (!title || !authors.length || !source || !pubYear || pubYear < 1000 || pubYear > 9999 || !doi || !claim || !evidence || !submitter) {
      alert('Please complete all fields and ensure Publication Year is a 4-digit number.');
      return;
    }

    const payload = {
      title,
      authors,
      source,
      pubyear: String(pubYear || ""),
      doi,
      claim,
      evidence,
      submitter,
    };
    const res = await fetch(`${API_BASE_URL}/api/articles/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      // After submitting, redirect submitter to their moderation view so the
      // new article shows immediately in the pending queue.
      router.replace('/my-moderation');
      return;
    } else {
      const text = await res.text();
      alert(`Submit failed: ${text}`);
    }
  };

  // Some helper methods for the authors array
  const addAuthor = () => {
    setAuthors(authors.concat([""]));
  };

  const removeAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const changeAuthor = (index: number, value: string) => {
    setAuthors(
      authors.map((oldValue, i) => {
        return index === i ? value : oldValue;
      })
    );
  };

  const handleBibtexUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBibtexError("");
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const entries = bibtexParse.toJSON(content);
        if (!entries.length) {
          setBibtexError("No valid Bibtex entry found.");
          return;
        }
        // 只取第一个条目
        const entry = entries[0].entryTags;
        setTitle(entry.title || "");
        setAuthors(entry.author ? entry.author.split(" and ").map(a => a.trim()) : []);
        setSource(entry.journal || entry.booktitle || "");
        setPubYear(entry.year ? parseInt(entry.year) : 0);
        setDoi(entry.doi || "");
        // 卷号、期号、页码可后续补充
        // setVolume(entry.volume || "");
        // setIssue(entry.number || "");
        // setPages(entry.pages || "");
      } catch (err) {
        setBibtexError("Failed to parse Bibtex file.");
      }
    };
    reader.readAsText(file);
  };

  // Return the full form
  return (
    <div className="container">
      <h1>New Article</h1>
      <form className={formStyles.form} onSubmit={submitNewArticle}>
        {/* Bibtex 文件上传 */}
        <label htmlFor="bibtex">Upload Bibtex File:</label>
        <input
          type="file"
          accept=".bib"
          id="bibtex"
          name="bibtex"
          onChange={handleBibtexUpload}
          className={formStyles.formItem}
        />
        {bibtexError && <div style={{color: 'red'}}>{bibtexError}</div>}

        <label htmlFor="title">Title:</label>
        <input
          className={formStyles.formItem}
          type="text"
          name="title"
          id="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />

        <label htmlFor="author">Authors:</label>
        {authors.map((author, index) => {
          return (
            <div key={`author ${index}`} className={formStyles.arrayItem}>
              <input
                type="text"
                name="author"
                value={author}
                onChange={(event) => changeAuthor(index, event.target.value)}
                className={formStyles.formItem}
              />
              <button
                onClick={() => removeAuthor(index)}
                className={formStyles.buttonItem}
                style={{ marginLeft: "3rem" }}
                type="button"
              >
                -
              </button>
            </div>
          );
        })}
        <button
          onClick={() => addAuthor()}
          className={formStyles.buttonItem}
          style={{ marginLeft: "auto" }}
          type="button"
        >
          +
        </button>

        <label htmlFor="source">Source:</label>
        <input
          className={formStyles.formItem}
          type="text"
          name="source"
          id="source"
          value={source}
          onChange={(event) => {
            setSource(event.target.value);
          }}
        />

        <label htmlFor="pubYear">Publication Year:</label>
        <input
          className={formStyles.formItem}
          type="number"
          name="pubYear"
          id="pubYear"
          value={pubYear}
          min={1000}
          max={9999}
          step={1}
          onChange={(event) => {
            const val = event.target.value;
            if (val === "") {
              setPubYear(0);
            } else {
              setPubYear(parseInt(val));
            }
          }}
        />

        <label htmlFor="doi">DOI:</label>
        <input
          className={formStyles.formItem}
          type="text"
          name="doi"
          id="doi"
          value={doi}
          onChange={(event) => {
            setDoi(event.target.value);
          }}
        />

        

        <label htmlFor="claim">Claim:</label>
        <input
          className={formStyles.formItem}
          type="text"
          name="claim"
          id="claim"
          value={claim}
          onChange={(event) => setClaim(event.target.value)}
        />

        <label htmlFor="evidence">Evidence:</label>
        <input
          className={formStyles.formItem}
          type="text"
          name="evidence"
          id="evidence"
          value={evidence}
          onChange={(event) => setEvidence(event.target.value)}
        />

        <label htmlFor="submitter">Submitter Email:</label>
        <input
          className={formStyles.formItem}
          type="email"
          name="submitter"
          id="submitter"
          value={submitter}
          onChange={(event) => setSubmitter(event.target.value)}
        />

        <button className={formStyles.formItem} type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default NewDiscussion;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const token = getTokenFromCookieStr(ctx.req.headers.cookie);
  if (!token) {
    return { redirect: { destination: '/auth/login', permanent: false } };
  }
  const payload = decodeToken(token);
  if (!payload || payload.role !== 'submitter') {
    return { redirect: { destination: '/auth/login', permanent: false } };
  }
  return { props: {} as any };
};