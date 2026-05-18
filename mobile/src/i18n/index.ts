import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { Platform } from 'react-native';
import { safeAsyncStorage } from '../utils/safeAsyncStorage';
import en from './locales/en.json';
import ru from './locales/ru.json';

const LANGUAGE_KEY = 'app_language';

const SUPPORTED_LANGUAGES = ['en', 'ru', 'es', 'pt', 'fr', 'de', 'ja', 'zh', 'ar', 'hi', 'ko', 'it', 'tr', 'vi', 'id', 'th', 'pl', 'uk', 'nl', 'bn'];

const LOCALE_RESOURCES: Record<string, any> = { en, ru };

const FALLBACK_TRANSLATIONS: Record<string, any> = {
  en: {
    common: {
      cancel: 'Cancel', save: 'Save', delete: 'Delete', edit: 'Edit',
      close: 'Close', loading: 'Loading...', error: 'Error', success: 'Success',
      all: 'All', back: 'Back', done: 'Done',
      daysAgo: '{{count}} days ago', weeksAgo: '{{count}} weeks ago', monthsAgo: '{{count}} months ago', yearsAgo: '{{count}} years ago',
    },
    home: {
      lifeSpent: 'Life spent', saved: 'Saved', refusals: 'refusals',
      decideNow: 'Decide now', cooling: 'Cooling down', today: 'Today',
      daysLeft: '{{count}} days', notNeeded: 'Not needed', buy: 'Buy',
      addIncome: 'Income', addExpense: 'Expense', freezeWish: 'Freeze desire',
      hoursOfLife: 'hours of life', ratePerHour: '{{rate}}/h',
      whatDoYouWant: 'What do you want?', howMuch: 'How much?',
      why: 'Why do you need this? *', freezeFor7Days: 'Freeze for 7 days',
      freezeExplanation: "In 7 days you'll decide — do you really need this",
    },
    transactions: {
      title: 'Transactions', expenses: 'Expenses', income: 'Income',
      day: 'Day', week: 'Week', month: 'Month', year: 'Year',
    },
    categories: {
      title: 'Categories', create: 'Create category', expense: 'Expense',
      incomeCategory: 'Income',
    },
    wishlist: { title: 'Wish incubator' },
    profile: { title: 'Profile', finances: 'Finances', settings: 'Settings', refusals: 'Refusals', saved: 'Saved', accounts: 'Accounts', categories: 'Categories', goals: 'Goals', analytics: 'Analytics', lifeCost: 'Life Cost', language: 'Language', currency: 'Currency', logout: 'Log out' },
    tabs: { home: 'Home', transactions: 'Transactions', chat: 'Chat', wishlist: 'Wishes', profile: 'Profile' },
    currencyPicker: { searchPlaceholder: 'Search by code or name...', notFound: 'Currency not found', tab_POPULAR: 'Popular', tab_ALL: 'All', tab_FIAT: 'Fiat', tab_CRYPTO: 'Crypto', tab_METAL: 'Metals' },
    time: { minutes: '{{count}} min', hours: '{{count}}h', days: '{{count}}d' },
  },
  ru: {
    common: {
      cancel: 'Отмена', save: 'Сохранить', delete: 'Удалить', edit: 'Редактировать',
      close: 'Закрыть', loading: 'Загрузка...', error: 'Ошибка', success: 'Успешно',
      all: 'Все', back: 'Назад', done: 'Готово',
      daysAgo: '{{count}} дней назад', weeksAgo: '{{count}} недель назад', monthsAgo: '{{count}} месяцев назад', yearsAgo: '{{count}} лет назад',
    },
    home: {
      lifeSpent: 'Потрачено жизни', saved: 'Сохранено', refusals: 'отказов',
      decideNow: 'Решите сейчас', cooling: 'Остывает', today: 'Сегодня',
      daysLeft: '{{count}} дн.', notNeeded: 'Не нужно', buy: 'Купить',
      addIncome: 'Доход', addExpense: 'Трата', freezeWish: 'Заморозить желание',
      hoursOfLife: 'часов жизни', ratePerHour: '{{rate}}/ч',
      whatDoYouWant: 'Что хотите?', howMuch: 'Сколько стоит?',
      why: 'Зачем вам это? *', freezeFor7Days: 'Заморозить на 7 дней',
      freezeExplanation: 'Через 7 дней вы решите — нужно ли это вам',
    },
    transactions: {
      title: 'Транзакции', expenses: 'Расходы', income: 'Доходы',
      day: 'День', week: 'Неделя', month: 'Месяц', year: 'Год',
    },
    categories: {
      title: 'Категории', create: 'Создать категорию', expense: 'Расход',
      incomeCategory: 'Доход',
    },
    wishlist: { title: 'Инкубатор желаний' },
    profile: { title: 'Профиль', finances: 'Финансы', settings: 'Настройки', refusals: 'Отказы', saved: 'Сохранено', accounts: 'Счета', categories: 'Категории', goals: 'Цели', analytics: 'Аналитика', lifeCost: 'Life Cost', language: 'Язык', currency: 'Валюта', logout: 'Выйти' },
    tabs: { home: 'Главная', transactions: 'Операции', chat: 'Чат', wishlist: 'Желания', profile: 'Профиль' },
    currencyPicker: { searchPlaceholder: 'Поиск по коду или названию...', notFound: 'Валюта не найдена', tab_POPULAR: 'Популярные', tab_ALL: 'Все', tab_FIAT: 'Фиат', tab_CRYPTO: 'Крипто', tab_METAL: 'Металлы' },
    time: { minutes: '{{count}} мин', hours: '{{count}} ч', days: '{{count}} дн' },
  },
};

function detectLanguage(): string {
  const deviceLang = getLocales()[0]?.languageCode || 'en';
  const code = deviceLang.split('-')[0].toLowerCase();
  return SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
}

async function getPersistedLanguage(): Promise<string> {
  try {
    const saved = await safeAsyncStorage.getItem(LANGUAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved;
  } catch {}
  return detectLanguage();
}

// Synchronous init with device language for fast first render
i18n.use(initReactI18next).init({
  resources: Object.fromEntries(
    SUPPORTED_LANGUAGES.map((l) => [
      l,
      { translation: LOCALE_RESOURCES[l] || FALLBACK_TRANSLATIONS[l] || FALLBACK_TRANSLATIONS.en },
    ]),
  ),
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

// After sync init, switch to persisted language
if (Platform.OS !== 'web') {
  getPersistedLanguage().then((saved) => {
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  }).catch(() => {});
}

export async function loadTranslationsFromServer(
  apiGet: (url: string) => Promise<any>,
) {
  try {
    const lang = i18n.language || 'en';
    const data = await apiGet(`/i18n/translations/${lang}`);
    if (data && typeof data === 'object') {
      const flat: Record<string, any> = {};
      for (const group of Object.values(data)) {
        if (group && typeof group === 'object') {
          Object.assign(flat, group);
        }
      }
      i18n.addResourceBundle(lang, 'translation', flat, true, true);
    }
  } catch (error) {
    console.warn('Failed to load translations from server, using fallback');
  }
}

let _apiGet: ((url: string) => Promise<any>) | null = null;

export function setApiGet(fn: (url: string) => Promise<any>) {
  _apiGet = fn;
}

export async function changeLanguage(lang: string) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) return;
  await i18n.changeLanguage(lang);
  if (_apiGet) {
    await loadTranslationsFromServer(_apiGet);
  }
  try {
    if (Platform.OS !== 'web') {
      await safeAsyncStorage.setItem(LANGUAGE_KEY, lang);
    }
  } catch {
    // AsyncStorage may not be available
  }
}

export { SUPPORTED_LANGUAGES };
export default i18n;
