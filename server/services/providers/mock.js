/**
 * Generates realistic fresh posts based on configured keywords for demo/testing or fallback.
 */
export function generateMockLeads(keywords = []) {
  const templates = [
    {
      author: "oleg_b2b_tools",
      name: "Олег Бондаренко (B2B Tools)",
      content: "Шукаю досвідченого розробника для сайту на Хорошопі! Потрібно налаштувати вивантаження залишків з BAS через API, зробити кастомний оптовий прайс для зареєстрованих клієнтів та поправити відображення характеристик. Хто вільний — напишіть у DM з прайсом та прикладами робіт.",
      tags: ["BAS / 1C", "Оптові ціни", "API Інтеграція"],
      matched: "шукаю розробника для хорошопу"
    },
    {
      author: "kristina_cosmetics",
      name: "Христина (Beauty Store)",
      content: "Дівчата й хлопці, хто розбирається в шаблонах Хорошопу? Хочемо освіжити дизайн шоуруму: додати швидке замовлення в 1 клік, підключити оплату частинами від Монобанку та налаштувати банери до акцій. Робота проектна.",
      tags: ["Редизайн", "Монобанк", "Швидке замовлення"],
      matched: "потрібен розробник хорошоп"
    },
    {
      author: "maksym_ecommerce_pro",
      name: "Максим Демченко",
      content: "Терміново потрібен спеціаліст по Хорошопу! Переносимо великий каталог товарів (понад 6 000 позицій) з Prom.ua на Хорошоп зі збереженням SEO-структури URL, редіректів та категорій. Бюджет адекватний, оплата за результат.",
      tags: ["Міграція Prom", "SEO", "Каталог 6k+"],
      matched: "перенести на хорошоп"
    },
    {
      author: "vitaliy_sports_ua",
      name: "Віталій Спорт",
      content: "Агенція шукає верстальника / розробника під Horoshop на постійні дрібні таски: правки CSS, кастомізація блоків, налаштування фільтрів та підключення відстеження конверсій GA4 / Meta Pixel. Робота погодинна або за таск.",
      tags: ["Постійні таски", "Верстка", "Аналітика GA4"],
      matched: "хорошоп робота"
    },
    {
      author: "yulia_kids_apparel",
      name: "Юлія (Kids Joy UA)",
      content: "Шукаємо того, хто працює з Хорошопом! Потрібно доробити мобільну версію магазину, додати вибір розміру з таблицею у попапі та налаштувати автоматичні ТТН для Нової Пошти через модуль. Хто може взятися вже цього тижня?",
      tags: ["Мобільна версія", "Нова Пошта", "eCommerce"],
      matched: "доробити сайт на хорошоп"
    }
  ];

  const randomItem = templates[Math.floor(Math.random() * templates.length)];
  const postCode = Math.random().toString(36).substring(2, 9).toUpperCase();
  const keyword = randomItem.matched || (keywords[0] || 'хорошоп розробник');

  return [
    {
      id: `th_${randomItem.author}_${postCode.toLowerCase()}`,
      author: randomItem.author,
      authorName: randomItem.name,
      authorUrl: `https://www.threads.net/@${randomItem.author}`,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(randomItem.name)}&background=8b5cf6&color=fff&bold=true`,
      url: `https://www.threads.net/@${randomItem.author}/post/${postCode}`,
      content: randomItem.content,
      matchedKeywords: [keyword],
      date: new Date().toISOString(),
      source: 'Threads Search',
      status: 'new',
      notes: '',
      tags: randomItem.tags,
      score: 95
    }
  ];
}
