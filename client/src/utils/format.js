export function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) {
    return 'тільки що';
  } else if (diffMin < 60) {
    return `${diffMin} хв тому`;
  } else if (diffHours < 24) {
    return `${diffHours} год тому`;
  } else if (diffDays === 1) {
    return 'вчора';
  } else if (diffDays < 7) {
    return `${diffDays} дн. тому`;
  } else {
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export function highlightKeywords(text, keywords = []) {
  if (!text) return '';
  // Combine custom keywords with default highlighted terms
  const searchTerms = [
    'хорошоп', 'хорошопу', 'хорошопом', 'horoshop',
    'шукаю', 'шукаємо', 'потрібен', 'потрібна', 'потрібні',
    'розробник', 'розробника', 'програміст', 'верстальник', 'спеціаліст',
    ...keywords
  ].filter(Boolean);

  const escaped = searchTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${escaped})`, 'gi');

  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (regex.test(part)) {
      return { text: part, isMatch: true };
    }
    return { text: part, isMatch: false };
  });
}

