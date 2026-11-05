import axios from 'axios';

/**
 * Searches Google Custom Search JSON API
 * https://developers.google.com/custom-search/v1/overview
 */
export async function searchGoogleCSE(keywords, negativeKeywords = [], apiKey, cseId) {
  if (!apiKey || !cseId) {
    throw new Error('Google API Key або Custom Search Engine ID (cx) не налаштовано.');
  }

  const posts = [];

  for (const keyword of keywords) {
    try {
      const query = `site:threads.net ${keyword.trim()}`;
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}`;

      const response = await axios.get(url, { timeout: 10000 });
      const items = response.data?.items || [];

      for (const item of items) {
        const link = item.link || '';
        if (!link.includes('threads.net')) continue;

        const fullText = `${item.title || ''} ${item.snippet || ''}`;
        const lower = fullText.toLowerCase();

        // Check negative keywords
        if (negativeKeywords.some(neg => neg && lower.includes(neg.toLowerCase()))) {
          continue;
        }

        let author = 'threads_user';
        const authorMatch = link.match(/threads\.net\/@([a-zA-Z0-9._]+)/);
        if (authorMatch && authorMatch[1]) {
          author = authorMatch[1];
        }

        const postSlug = link.split('/post/')[1]?.split('?')[0]?.replace(/\//g, '') || Math.random().toString(36).substring(2, 9);
        const id = `th_${author}_${postSlug}`;

        posts.push({
          id,
          author,
          authorName: `@${author}`,
          authorUrl: `https://www.threads.net/@${author}`,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=2563eb&color=fff&bold=true`,
          url: link,
          content: fullText,
          matchedKeywords: [keyword],
          date: new Date().toISOString(),
          source: 'Google Search API',
          status: 'new',
          notes: '',
          tags: ['Google Indexed'],
          score: 85
        });
      }
    } catch (err) {
      console.warn(`[Google Provider] Помилка пошуку "${keyword}":`, err.message);
    }
  }

  return posts;
}

