import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Searches web for indexed Threads posts with smart query optimization.
 */
export async function searchDuckDuckGo(keywords, negativeKeywords = []) {
  const posts = [];

  // Generate smart query combinations instead of rigid full phrases
  const searchQueries = [
    'site:threads.net "хорошоп" "розробник"',
    'site:threads.net "хорошоп" "шукаю"',
    'site:threads.net "хорошоп" "робота"',
    'site:threads.net "horoshop" developer'
  ];

  // Also include user custom keywords
  for (const kw of keywords) {
    const trimmed = kw.trim();
    if (trimmed && !searchQueries.includes(trimmed)) {
      searchQueries.push(`site:threads.net ${trimmed}`);
    }
  }

  for (const query of searchQueries.slice(0, 4)) {
    try {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://duckduckgo.com/'
        },
        timeout: 8000
      });

      const $ = cheerio.load(response.data);

      $('.result').each((i, el) => {
        const titleEl = $(el).find('.result__title .result__a');
        const snippetEl = $(el).find('.result__snippet');
        const linkRaw = titleEl.attr('href') || '';

        let threadUrl = '';
        if (linkRaw.includes('uddg=')) {
          const matched = linkRaw.match(/uddg=([^&]+)/);
          if (matched && matched[1]) {
            threadUrl = decodeURIComponent(matched[1]);
          }
        } else if (linkRaw.includes('threads.net')) {
          threadUrl = linkRaw;
        }

        if (!threadUrl || !threadUrl.includes('threads.net')) return;

        const snippet = snippetEl.text().trim();
        const title = titleEl.text().trim();
        const fullText = `${title} ${snippet}`;

        const lower = fullText.toLowerCase();
        if (negativeKeywords.some(neg => neg && lower.includes(neg.toLowerCase()))) {
          return;
        }

        let author = 'threads_user';
        const authorMatch = threadUrl.match(/threads\.net\/@([a-zA-Z0-9._]+)/);
        if (authorMatch && authorMatch[1]) {
          author = authorMatch[1];
        }

        const postSlug = threadUrl.split('/post/')[1]?.split('?')[0]?.replace(/\//g, '') || Math.random().toString(36).substring(2, 9);
        const id = `th_${author}_${postSlug}`;

        const tags = [];
        if (lower.includes('терміново')) tags.push('Терміново');
        if (lower.includes('prom') || lower.includes('пром')) tags.push('Міграція Prom');
        if (lower.includes('1с') || lower.includes('bas')) tags.push('1C / BAS');
        if (lower.includes('оплата') || lower.includes('моно')) tags.push('Платежі');
        if (lower.includes('редизайн') || lower.includes('дизайн')) tags.push('Дизайн');

        posts.push({
          id,
          author,
          authorName: `@${author}`,
          authorUrl: `https://www.threads.net/@${author}`,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=7c3aed&color=fff&bold=true`,
          url: threadUrl,
          content: fullText,
          matchedKeywords: [query.replace('site:threads.net', '').trim()],
          date: new Date().toISOString(),
          source: 'Web Search (Threads)',
          status: 'new',
          notes: '',
          tags,
          score: 85
        });
      });
    } catch (err) {
      console.warn(`[Web Search] Помилка пошуку "${query}":`, err.message);
    }
  }

  return posts;
}
