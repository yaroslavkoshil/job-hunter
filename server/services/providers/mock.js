/**
 * Generates realistic fresh posts based on configured keywords for demo/testing.
 */
export function generateMockLeads(keywords = []) {
  const templates = [
    {
      author: "serhii_coffee_roast",
      name: "Сергій Мельник (Coffee Point)",
      content: "Шукаю розробника для хорошопу! Робимо інтернет-магазин свіжообсмаженої кави. Шаблон вже куплений, треба налаштувати кастомні підписки на щомісячну доставку та підключити Нову Пошту з вибором поштоматів. Хто готовий взятися — напишіть у DM з рейтом.",
      tags: ["Кастомний функціонал", "Нова Пошта", "eCommerce"]
    },
    {
      author: "yulia_kids_ua",
      name: "Юлія (MiniMe Дитячий одяг)",
      content: "Потрібен розробник Хорошоп. Треба оптимізувати швидкість завантаження мобільної версії та додати кастомний фільтр по росту дитини. Також є задача доробити синхронізацію залишків через API. Пишіть у тредс або в телеграм.",
      tags: ["Оптимізація швидкості", "Фільтри", "API"]
    },
    {
      author: "andriy_auto_parts",
      name: "Андрій AutoParts",
      content: "Шукаємо людину, яка добре знає Хорошоп. Треба залити базу з 15 000 автозапчастин через CSV/XLSX, налаштувати модифікації та зробити вивантаження у Google Shopping / Merchant Center. Робота термінова!",
      tags: ["Терміново", "Google Shopping", "10k+ товарів"]
    },
    {
      author: "nastia_beauty_lab",
      name: "Анастасія Б'юті",
      content: "Хто робить сайти на Horoshop? Шукаю спеціаліста на постійну підтримку магазину косметики: дрібні правки по верстці, підключення банерів до акцій, базова SEO-оптимізація тегів. Робота по годинах або фікс.",
      tags: ["Підтримка", "SEO", "Верстка"]
    }
  ];

  const randomItem = templates[Math.floor(Math.random() * templates.length)];
  const postCode = Math.random().toString(36).substring(2, 9);
  const keyword = keywords[Math.floor(Math.random() * keywords.length)] || 'шукаю розробника для хорошопу';

  return [
    {
      id: `th_${randomItem.author}_${postCode}`,
      author: randomItem.author,
      authorName: randomItem.name,
      authorUrl: `https://www.threads.net/@${randomItem.author}`,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(randomItem.name)}&background=8b5cf6&color=fff&bold=true`,
      url: `https://www.threads.net/@${randomItem.author}/post/${postCode.toUpperCase()}`,
      content: randomItem.content,
      matchedKeywords: [keyword],
      date: new Date().toISOString(),
      source: 'Threads Live Search',
      status: 'new',
      notes: '',
      tags: randomItem.tags,
      score: 96
    }
  ];
}
