declare module 'bibtex-parse-js' {
  interface BibEntry {
    type: string;
    citationKey: string;
    entryTags: {
      title?: string;
      author?: string;
      journal?: string;
      year?: string;
      volume?: string;
      number?: string;
      pages?: string;
      doi?: string;
      [key: string]: string | undefined;
    };
  }

  function toJSON(input: string): BibEntry[];
  
  export = {
    toJSON
  };
}