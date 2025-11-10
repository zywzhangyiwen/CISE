import bibtexParse from 'bibtex-parse-js';

export interface BibEntry {
  type: string;      // 文献类型，如 article, inproceedings 等
  citationKey: string;
  entryTags: {
    title?: string;
    author?: string;
    journal?: string;
    year?: string;
    volume?: string;
    number?: string; // issue
    pages?: string;
    doi?: string;
    [key: string]: string | undefined;
  };
}

export function parseBibTeX(text: string): BibEntry[] {
  try {
    const entries = bibtexParse.toJSON(text);
    return entries;
  } catch (error) {
    console.error('Error parsing BibTeX:', error);
    throw new Error('Invalid BibTeX format');
  }
}

export function cleanBibField(value: string | undefined): string {
  if (!value) return '';
  // 移除 BibTeX 中的花括号和多余空格
  return value.replace(/[{}]/g, '').trim();
}

export function convertBibEntryToArticle(entry: BibEntry) {
  return {
    title: cleanBibField(entry.entryTags.title),
    authors: cleanBibField(entry.entryTags.author),
    journal: cleanBibField(entry.entryTags.journal),
    year: parseInt(cleanBibField(entry.entryTags.year)) || new Date().getFullYear(),
    volume: cleanBibField(entry.entryTags.volume),
    issue: cleanBibField(entry.entryTags.number),
    pages: cleanBibField(entry.entryTags.pages),
    doi: cleanBibField(entry.entryTags.doi),
  };
}