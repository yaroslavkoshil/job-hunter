import axios from 'axios';

/**
 * Sends notifications to Telegram bot
 */
export async function sendTelegramNotification(botToken, chatId, post) {
  if (!botToken || !chatId) {
    return false;
  }

  const message = `🎯 *Знайдено новий пост у Threads!*

👤 *Автор:* [${post.authorName || post.author}](${post.authorUrl})
🔍 *Ключові слова:* \`${post.matchedKeywords ? post.matchedKeywords.join(', ') : 'Хорошоп'}\`

📝 *Текст посту:*
"${escapeMarkdown(post.content)}"

🏷 *Теги:* ${post.tags && post.tags.length > 0 ? post.tags.map(t => `#${t.replace(/\s+/g, '_')}`).join(' ') : '#вакансія #хорошоп'}

🔗 [Відкрити пост у Threads](${post.url})`;

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: false
    });
    return true;
  } catch (err) {
    console.error('[Telegram] Помилка надсилання сповіщення:', err.response?.data || err.message);
    return false;
  }
}

export async function testTelegramConnection(botToken, chatId) {
  if (!botToken || !chatId) {
    throw new Error('Вкажіть Bot Token та Chat ID');
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const text = `🔔 *Тестове сповіщення від Threads Job Hunter!*

Ваш бот успішно підключений. Тепер усі нові знайдені вакансії та запити по Хорошопу будуть надходити сюди в режимі реального часу.`;

  const response = await axios.post(url, {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown'
  });

  return response.data;
}

function escapeMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

