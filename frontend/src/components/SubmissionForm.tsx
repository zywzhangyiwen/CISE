// src/components/SubmissionForm.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { parseBibTeX, convertBibEntryToArticle } from "../utils/bibtex";
import styles from "../styles/Form.module.scss";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  authors: z.string().min(1, "Authors are required"),
  journal: z.string().min(1, "Journal name is required"),
  year: z.number()
    .min(1900, "Year must be after 1900")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  volume: z.string().min(1, "Volume is required"),
  issue: z.string().min(1, "Issue is required"),
  pages: z.string().regex(/^\d+(-\d+)?$/, "Pages must be in format: 1-23 or 123"),
  doi: z.string().regex(/^10\.\d{4,}\/[-._;()\/:A-Z0-9]+$/i, "Invalid DOI format"),
  practice: z.enum(["TDD", "Mob Programming"]),
});

export default function SubmissionForm() {
  const [showBibtexInput, setShowBibtexInput] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
  });

  const onSubmit = async (data: z.infer<typeof articleSchema>) => {
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit article');
      }

      // Show success message
      alert('Article submitted successfully! You will be notified once it is reviewed.');
    } catch (error) {
      console.error('Error submitting article:', error);
      alert('Failed to submit article. Please try again.');
    }
  };

  const handleBibtexUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const entries = parseBibTeX(text);
        if (entries.length > 0) {
          const article = convertBibEntryToArticle(entries[0]);
          
          // 设置表单值
          setValue('title', article.title);
          setValue('authors', article.authors);
          setValue('journal', article.journal);
          setValue('year', article.year);
          setValue('volume', article.volume);
          setValue('issue', article.issue);
          setValue('pages', article.pages);
          setValue('doi', article.doi);
          
          // 隐藏 BibTeX 输入框，显示填充后的表单
          setShowBibtexInput(false);
        }
      } catch (error) {
        console.error('Error parsing BibTeX:', error);
        alert('Failed to parse BibTeX file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.inputToggle}>
        <button
          type="button"
          onClick={() => setShowBibtexInput(false)}
          className={!showBibtexInput ? styles.active : ''}
        >
          Manual Entry
        </button>
        <button
          type="button"
          onClick={() => setShowBibtexInput(true)}
          className={showBibtexInput ? styles.active : ''}
        >
          BibTeX Upload
        </button>
      </div>

      {showBibtexInput ? (
        <div className={styles.bibtexUpload}>
          <p>Upload a BibTeX file to automatically fill the form</p>
          <input
            type="file"
            accept=".bib"
            onChange={handleBibtexUpload}
            className={styles.fileInput}
          />
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Title*</label>
          <input {...register('title')} />
          {errors.title && <span className={styles.error}>{errors.title.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Authors*</label>
          <input {...register('authors')} placeholder="e.g. John Doe, Jane Smith" />
          {errors.authors && <span className={styles.error}>{errors.authors.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Journal*</label>
          <input {...register('journal')} />
          {errors.journal && <span className={styles.error}>{errors.journal.message}</span>}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Year*</label>
            <input
              type="number"
              {...register('year', { valueAsNumber: true })}
              min={1900}
              max={new Date().getFullYear()}
            />
            {errors.year && <span className={styles.error}>{errors.year.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Volume*</label>
            <input {...register('volume')} />
            {errors.volume && <span className={styles.error}>{errors.volume.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Issue*</label>
            <input {...register('issue')} />
            {errors.issue && <span className={styles.error}>{errors.issue.message}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Pages*</label>
          <input {...register('pages')} placeholder="e.g. 1-23" />
          {errors.pages && <span className={styles.error}>{errors.pages.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>DOI*</label>
          <input {...register('doi')} placeholder="10.xxxx/xxxxx" />
          {errors.doi && <span className={styles.error}>{errors.doi.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>SE Practice*</label>
          <select {...register('practice')}>
            <option value="">Select SE practice...</option>
            <option value="TDD">TDD</option>
            <option value="Mob Programming">Mob Programming</option>
          </select>
          {errors.practice && <span className={styles.error}>{errors.practice.message}</span>}
        </div>

        <div className={styles.submitContainer}>
          <button type="submit" className={styles.submitButton}>
            Submit Article
          </button>
        </div>
      </form>
    </div>
  );
}