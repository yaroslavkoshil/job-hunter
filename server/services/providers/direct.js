import axios from 'axios';

/**
 * Searches Threads directly using user's session cookie or token
 */
export async function searchThreadsDirect(keywords, negativeKeywords = [], sessionCookie = '') {
  if (!sessionCookie) {
    return [];
  }

  const posts = [];

  for (const keyword of keywords) {
    try {
      const cleanKeyword = keyword.trim();
      const url = `https://www.threads.net/api/v1/fbsearch/top_serp/?query=${encodeURIComponent(cleanKeyword)}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8',
          'X-IG-App-ID': '238260118697367',
          'Cookie': sessionCookie
        },
        timeout: 10000
      });

      const items = response.data?.items || response.data?.data?.items || [];

      for (const item of items) {
        const threadItem = item.thread?.thread_items?.[0] || item;
        const post = threadItem.post;
        if (!post) continue;

        const caption = post.caption?.text || '';
        const author = post.user?.username || 'threads_user';
        const authorName = post.user?.full_name || `@${author}`;
        const avatarUrl = post.user?.profile_pic_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=7c3aed&color=fff`;
        const code = post.code;
        const threadUrl = `https://www.threads.net/@${author}/post/${code}`;

        const lower = caption.toLowerCase();
        if (negativeKeywords.some(neg => neg && lower.includes(neg.toLowerCase()))) {
          continue;
        }

        posts.push({
          id: `th_${author}_${code}`,
          author,
          authorName,
          authorUrl: `https://www.threads.net/@${author}`,
          avatarUrl,
          url: threadUrl,
          content: caption,
          matchedKeywords: [cleanKeyword],
          date: post.taken_at ? new Date(post.taken_at * 1000).toISOString() : new Date().toISOString(),
          source: 'Threads API (Прямий пошук)',
          status: 'new',
          notes: '',
          tags: detectTags(caption),
          score: 95
        });
      }
    } catch (err) {
      console.warn(`[Threads Direct] Помилка пошуку "${keyword}":`, err.response?.data?.message || err.message);
    }
  }

  return posts;
}

function detectTags(text) {
  const t = text.toLowerCase();
  const tags = [];
  if (t.includes('терміново')) tags.push('Терміново');
  if (t.includes('prom') || t.includes('пром')) tags.push('Міграція Prom');
  if (t.includes('1с') || t.includes('bas')) tags.push('1C / BAS');
  if (t.includes('моно') || t.includes('оплат')) tags.push('Оплата / Монобанк');
  if (t.includes('дизайн') || t.includes('шаблон')) tags.push('Дизайн');
  return tags;
}
