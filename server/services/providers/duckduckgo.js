import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Searches DuckDuckGo HTML for indexed Threads posts.
 * Query syntax: site:threads.net ("хорошоп" OR "horoshop") "шукаю"
 */
export async function searchDuckDuckGo(keywords, negativeKeywords = []) {
  const posts = [];

  for (const keyword of keywords) {
    try {
      const cleanKeyword = keyword.trim();
      const query = `site:threads.net ${cleanKeyword}`;
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      $('.result').each((i, el) => {
        const titleEl = $(el).find('.result__title .result__a');
        const snippetEl = $(el).find('.result__snippet');
        const linkRaw = titleEl.attr('href') || '';

        // DuckDuckGo redirects often look like //duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.threads.net%2F%40user%2Fpost%2F...
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

        // Check negative keywords
        const lower = fullText.toLowerCase();
        const hasNegative = negativeKeywords.some(neg => neg && lower.includes(neg.toLowerCase()));
        if (hasNegative) return;

        // Extract username from URL: e.g. https://www.threads.net/@some_user/post/...
        let author = 'threads_user';
        const authorMatch = threadUrl.match(/threads\.net\/@([a-zA-Z0-9._]+)/);
        if (authorMatch && authorMatch[1]) {
          author = authorMatch[1];
        }

        // Generate clean id
        const postSlug = threadUrl.split('/post/')[1]?.split('?')[0]?.replace(/\//g, '') || Math.random().toString(36).substring(2, 9);
        const id = `th_${author}_${postSlug}`;

        // Tag detection
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
          matchedKeywords: [cleanKeyword],
          date: new Date().toISOString(),
          source: 'DuckDuckGo (Threads)',
          status: 'new',
          notes: '',
          tags,
          score: calculateScore(fullText, cleanKeyword)
        });
      });

      // Small delay between requests to be polite
      await new Promise(r => setTimeout(r, 1200));
    } catch (err) {
      console.warn(`[DDG Provider] Помилка пошуку для запиту "${keyword}":`, err.message);
    }
  }

  return posts;
}

function calculateScore(text, keyword) {
  let score = 70;
  const t = text.toLowerCase();
  if (t.includes('шукаю')) score += 15;
  if (t.includes('розробник') || t.includes('програміст')) score += 10;
  if (t.includes('хорошоп') || t.includes('horoshop')) score += 10;
  if (t.includes('бюджет') || t.includes('оплата') || t.includes('$') || t.includes('грн')) score += 5;
  return Math.min(score, 100);
}
