// NPOS Search Index - Česká verze

interface SearchResult {
  path: string;
  title: string;
  snippet: string;
  score: number;
}

interface SearchIndex {
  docs: any[];
  terms: Map<string, Set<number>>;
}

/**
 * Tokenizace textu do hledatelných termínů
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\sčřžýáíéóúůďťňťř]/g, '')
    .replace(/[cč]/g, 'c')
    .replace(/[rř]/g, 'r')
    .replace(/[zž]/g, 'z')
    .replace(/[yý]/g, 'y')
    .replace(/[aá]/g, 'a')
    .replace(/[ií]/g, 'i')
    .replace(/[eé]/g, 'e')
    .replace(/[oó]/g, 'o')
    .replace(/[uúů]/g, 'u')
    .replace(/[dď]/g, 'd')
    .replace(/[tť]/g, 't')
    .replace(/[nň]/g, 'n')
    .split(/\s+/)
    .filter(t => t.length > 2)
    .filter((t, i, a) => a.indexOf(t) === i);
}

/**
 * Vytvoření vyhledávacího indexu
 */
export function buildSearchIndex(directoryFiles: any[]): SearchIndex {
  const index: SearchIndex = {
    docs: [],
    terms: new Map()
  };

  directoryFiles.forEach((doc, idx) => {
    const docId = index.docs.length;
    index.docs.push({
      id: docId,
      path: doc.path,
      title: doc.title,
      content: doc.content,
      tags: doc.tags || []
    });

    const terms = tokenize(doc.title + ' ' + (doc.content || ''));
    terms.forEach(term => {
      if (!index.terms.has(term)) {
        index.terms.set(term, new Set());
      }
      index.terms.get(term)?.add(docId);
    });
  });

  return index;
}

/**
 * Hledání v indexu
 */
export function search(index: SearchIndex, query: string): SearchResult[] {
  const terms = tokenize(query);
  const results = new Map<number, SearchResult>();

  terms.forEach(term => {
    const docIds = index.terms.get(term);
    if (docIds) {
      docIds.forEach(docId => {
        const doc = index.docs[docId];
        if (doc) {
          if (!results.has(docId)) {
            results.set(docId, {
              path: doc.path,
              title: doc.title,
              snippet: doc.content?.substring(0, 200) + '...' || '',
              score: 0
            });
          }
          results.get(docId)!.score += 1;
        }
      });
    }
  });

  return Array.from(results.values())
    .sort((a, b) => b.score - a.score);
}

/**
 * Hledání v různých složkách
 */
export function multiSearch(
  directories: { name: string; path: string; files: any[] }[],
  query: string
): SearchResult[] {
  let allResults: SearchResult[] = [];

  directories.forEach(dir => {
    const index = buildSearchIndex(dir.files);
    const results = search(index, query);
    allResults = [...allResults, ...results];
  });

  return allResults;
}

/**
 * Překlady pro uživatelské rozhraní
 */
export const translations = {
  searchPlaceholder: 'Hledat v NPOS...',
  searchResults: 'Výsledky hledání',
  noResults: 'Žádné výsledky',
  framework: 'Framework',
  knowledge: 'Znalosti',
  presets: 'Předlohy',
  tools: 'Nástroje',
  dashboard: 'Hlavní stránka',
  currentTrack: 'Aktuální track',
  todayGoal: 'Dnešní cíl',
  quickLinks: 'Rychlé odkazy',
  recentKnowledge: 'Nové znalosti'
};
