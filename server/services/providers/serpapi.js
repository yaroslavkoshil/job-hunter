import axios from 'axios';

/**
 * Searches Google via SerpApi (engine=google)
 */
export async function searchSerpApi(keywords, negativeKeywords = [], apiKey) {
  if (!apiKey) {
    throw new Error('SerpApi Key не вказано.');
  }

  const posts = [];

  for (const keyword of keywords) {
    try {
      const query = `site:threads.net ${keyword.trim()}`;
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${apiKey}&hl=uk&gl=ua`;

      const response = await axios.get(url, { timeout: 12000 });
      const organic = response.data?.organic_results || [];

      for (const item of organic) {
        const link = item.link || '';
        if (!link.includes('threads.net')) continue;

        const fullText = `${item.title || ''} ${item.snippet || ''}`;
        const lower = fullText.toLowerCase();

        if (negativeKeywords.some(neg => neg && lower.includes(neg.toLowerCase()))) {
          continue;
        }

        let author = 'threads_user';
        const authorMatch = link.match(/threads\.net\/@([a-zA-Z0-9._]+)/);
        if (authorMatch && authorMatch[1]) {
          author = authorMatch[1];
        }

        const postSlug = link.split('/post/')[1]?.split('?')[0]?.replace(/\//g, '') || Math.random().toString(36).substring(2, 9);

        posts.push({
          id: `th_${author}_${postSlug}`,
          author,
          authorName: `@${author}`,
          authorUrl: `https://www.threads.net/@${author}`,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=059669&color=fff&bold=true`,
          url: link,
          content: fullText,
          matchedKeywords: [keyword],
          date: new Date().toISOString(),
          source: 'SerpAPI (Google)',
          status: 'new',
          notes: '',
          tags: ['SerpAPI'],
          score: 88
        });
      }
    } catch (err) {
      console.warn(`[SerpApi Provider] Помилка пошуку "${keyword}":`, err.message);
    }
  }

  return posts;
}
