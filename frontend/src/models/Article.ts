// frontend/src/models/Article.ts
export interface Article {
  _id?: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  claim?: string;
  evidence?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface BibEntry {
  citeKey: string;
  entryType: string;
  fields: Record<string, string>;
}