import React from 'react';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

type IconFamily = 'ionicons' | 'material' | 'fontawesome';

export interface IconDef {
  name: string;
  family: IconFamily;
  label: string;
}

export interface IconGroup {
  label: string;
  icons: IconDef[];
}

export const ICON_BANK: IconGroup[] = [
  {
    label: 'Еда и напитки',
    icons: [
      { name: 'food', family: 'material', label: 'Еда' },
      { name: 'food-apple', family: 'material', label: 'Фрукты' },
      { name: 'coffee', family: 'material', label: 'Кофе' },
      { name: 'beer', family: 'material', label: 'Пиво' },
      { name: 'glass-cocktail', family: 'material', label: 'Коктейль' },
      { name: 'pizza', family: 'material', label: 'Пицца' },
      { name: 'hamburger', family: 'material', label: 'Бургер' },
      { name: 'cupcake', family: 'material', label: 'Десерт' },
      { name: 'fruit-cherries', family: 'material', label: 'Ягоды' },
      { name: 'bread-slice', family: 'material', label: 'Выпечка' },
      { name: 'fish', family: 'material', label: 'Рыба' },
      { name: 'egg-fried', family: 'material', label: 'Завтрак' },
      { name: 'noodles', family: 'material', label: 'Азиатская' },
      { name: 'ice-cream', family: 'material', label: 'Мороженое' },
      { name: 'tea', family: 'material', label: 'Чай' },
      { name: 'wine', family: 'material', label: 'Вино' },
      { name: 'bottle-soda', family: 'material', label: 'Напитки' },
      { name: 'popcorn', family: 'material', label: 'Снеки' },
    ],
  },
  {
    label: 'Транспорт',
    icons: [
      { name: 'car', family: 'material', label: 'Авто' },
      { name: 'car-sports', family: 'material', label: 'Спорткар' },
      { name: 'taxi', family: 'material', label: 'Такси' },
      { name: 'bus', family: 'material', label: 'Автобус' },
      { name: 'train', family: 'material', label: 'Поезд' },
      { name: 'subway-variant', family: 'material', label: 'Метро' },
      { name: 'airplane', family: 'material', label: 'Самолёт' },
      { name: 'bicycle', family: 'material', label: 'Велосипед' },
      { name: 'motorbike', family: 'material', label: 'Мотоцикл' },
      { name: 'ferry', family: 'material', label: 'Паром' },
      { name: 'gas-station', family: 'material', label: 'Бензин' },
      { name: 'car-wrench', family: 'material', label: 'Ремонт авто' },
      { name: 'parking', family: 'material', label: 'Парковка' },
      { name: 'car-side', family: 'material', label: 'Машина' },
    ],
  },
  {
    label: 'Дом и жильё',
    icons: [
      { name: 'home', family: 'material', label: 'Дом' },
      { name: 'home-city', family: 'material', label: 'Квартира' },
      { name: 'sofa', family: 'material', label: 'Мебель' },
      { name: 'bed', family: 'material', label: 'Спальня' },
      { name: 'stove', family: 'material', label: 'Кухня' },
      { name: 'fridge', family: 'material', label: 'Холодильник' },
      { name: 'washing-machine', family: 'material', label: 'Стирка' },
      { name: 'vacuum', family: 'material', label: 'Уборка' },
      { name: 'lightbulb', family: 'material', label: 'Электричество' },
      { name: 'water', family: 'material', label: 'Вода' },
      { name: 'thermometer', family: 'material', label: 'Отопление' },
      { name: 'key', family: 'material', label: 'Аренда' },
      { name: 'hammer-wrench', family: 'material', label: 'Ремонт' },
      { name: 'garden', family: 'material', label: 'Сад' },
    ],
  },
  {
    label: 'Покупки',
    icons: [
      { name: 'shopping', family: 'material', label: 'Шопинг' },
      { name: 'cart', family: 'material', label: 'Продукты' },
      { name: 'basket', family: 'material', label: 'Корзина' },
      { name: 'tshirt-crew', family: 'material', label: 'Одежда' },
      { name: 'shoe-sneaker', family: 'material', label: 'Обувь' },
      { name: 'bag-personal', family: 'material', label: 'Сумка' },
      { name: 'ring', family: 'material', label: 'Украшения' },
      { name: 'lipstick', family: 'material', label: 'Косметика' },
      { name: 'cellphone', family: 'material', label: 'Электроника' },
      { name: 'laptop', family: 'material', label: 'Ноутбук' },
      { name: 'headphones', family: 'material', label: 'Наушники' },
      { name: 'watch', family: 'material', label: 'Часы' },
      { name: 'gift', family: 'material', label: 'Подарки' },
      { name: 'store', family: 'material', label: 'Магазин' },
      { name: 'baby-carriage', family: 'material', label: 'Дети' },
      { name: 'dog', family: 'material', label: 'Питомцы' },
    ],
  },
  {
    label: 'Развлечения',
    icons: [
      { name: 'movie-open', family: 'material', label: 'Кино' },
      { name: 'gamepad-variant', family: 'material', label: 'Игры' },
      { name: 'music', family: 'material', label: 'Музыка' },
      { name: 'television', family: 'material', label: 'ТВ' },
      { name: 'palette', family: 'material', label: 'Искусство' },
      { name: 'book-open-variant', family: 'material', label: 'Книги' },
      { name: 'camera', family: 'material', label: 'Фото' },
      { name: 'party-popper', family: 'material', label: 'Вечеринка' },
      { name: 'ticket', family: 'material', label: 'Билеты' },
      { name: 'stadium', family: 'material', label: 'Стадион' },
      { name: 'dance-ballroom', family: 'material', label: 'Танцы' },
      { name: 'poker-chip', family: 'material', label: 'Азартные' },
      { name: 'theater', family: 'material', label: 'Театр' },
      { name: 'museum', family: 'material', label: 'Музей' },
    ],
  },
  {
    label: 'Здоровье',
    icons: [
      { name: 'medical-bag', family: 'material', label: 'Медицина' },
      { name: 'pharmacy', family: 'material', label: 'Аптека' },
      { name: 'tooth', family: 'material', label: 'Стоматолог' },
      { name: 'heart-pulse', family: 'material', label: 'Кардио' },
      { name: 'hospital-box', family: 'material', label: 'Больница' },
      { name: 'dumbbell', family: 'material', label: 'Фитнес' },
      { name: 'yoga', family: 'material', label: 'Йога' },
      { name: 'run', family: 'material', label: 'Бег' },
      { name: 'swim', family: 'material', label: 'Плавание' },
      { name: 'pill', family: 'material', label: 'Лекарства' },
      { name: 'stethoscope', family: 'material', label: 'Врач' },
      { name: 'eye', family: 'material', label: 'Офтальмолог' },
    ],
  },
  {
    label: 'Финансы',
    icons: [
      { name: 'cash', family: 'material', label: 'Наличные' },
      { name: 'credit-card', family: 'material', label: 'Карта' },
      { name: 'bank', family: 'material', label: 'Банк' },
      { name: 'piggy-bank', family: 'material', label: 'Копилка' },
      { name: 'chart-line', family: 'material', label: 'Инвестиции' },
      { name: 'bitcoin', family: 'material', label: 'Крипто' },
      { name: 'file-document', family: 'material', label: 'Налоги' },
      { name: 'shield-check', family: 'material', label: 'Страховка' },
      { name: 'account-cash', family: 'material', label: 'Зарплата' },
      { name: 'currency-usd', family: 'material', label: 'Валюта' },
      { name: 'safe', family: 'material', label: 'Сейф' },
      { name: 'wallet', family: 'material', label: 'Кошелёк' },
    ],
  },
  {
    label: 'Образование',
    icons: [
      { name: 'school', family: 'material', label: 'Учёба' },
      { name: 'book-education', family: 'material', label: 'Курсы' },
      { name: 'certificate', family: 'material', label: 'Сертификат' },
      { name: 'flask', family: 'material', label: 'Наука' },
      { name: 'ab-testing', family: 'material', label: 'Тесты' },
      { name: 'translate', family: 'material', label: 'Языки' },
      { name: 'pencil', family: 'material', label: 'Канцелярия' },
      { name: 'laptop-school', family: 'material', label: 'Онлайн' },
    ],
  },
  {
    label: 'Путешествия',
    icons: [
      { name: 'earth', family: 'material', label: 'Путешествие' },
      { name: 'beach', family: 'material', label: 'Пляж' },
      { name: 'mountain', family: 'material', label: 'Горы' },
      { name: 'tent', family: 'material', label: 'Кемпинг' },
      { name: 'passport', family: 'material', label: 'Паспорт' },
      { name: 'map-marker', family: 'material', label: 'Навигация' },
      { name: 'bag-suitcase', family: 'material', label: 'Багаж' },
      { name: 'hotel', family: 'material', label: 'Отель' },
      { name: 'sail-boat', family: 'material', label: 'Круиз' },
      { name: 'castle', family: 'material', label: 'Достопримечательности' },
    ],
  },
  {
    label: 'Работа',
    icons: [
      { name: 'briefcase', family: 'material', label: 'Работа' },
      { name: 'office-building', family: 'material', label: 'Офис' },
      { name: 'laptop', family: 'material', label: 'Компьютер' },
      { name: 'phone', family: 'material', label: 'Звонки' },
      { name: 'email', family: 'material', label: 'Почта' },
      { name: 'account-group', family: 'material', label: 'Команда' },
      { name: 'printer', family: 'material', label: 'Оргтехника' },
      { name: 'calendar', family: 'material', label: 'Встречи' },
    ],
  },
  {
    label: 'Красота',
    icons: [
      { name: 'spa', family: 'material', label: 'СПА' },
      { name: 'hair-dryer', family: 'material', label: 'Парикмахер' },
      { name: 'nail', family: 'material', label: 'Маникюр' },
      { name: 'face-woman-shimmer', family: 'material', label: 'Уход' },
      { name: 'perfume', family: 'material', label: 'Парфюм' },
      { name: 'mirror', family: 'material', label: 'Косметология' },
      { name: 'weight-lifter', family: 'material', label: 'Спортзал' },
      { name: 'pool', family: 'material', label: 'Бассейн' },
    ],
  },
  {
    label: 'Связь и подписки',
    icons: [
      { name: 'cellphone-wireless', family: 'material', label: 'Мобильная связь' },
      { name: 'wifi', family: 'material', label: 'Интернет' },
      { name: 'youtube', family: 'material', label: 'YouTube' },
      { name: 'spotify', family: 'material', label: 'Spotify' },
      { name: 'netflix', family: 'material', label: 'Netflix' },
      { name: 'cloud', family: 'material', label: 'Облако' },
      { name: 'server', family: 'material', label: 'Хостинг' },
      { name: 'apps', family: 'material', label: 'Приложения' },
    ],
  },
  {
    label: 'Разное',
    icons: [
      { name: 'star', family: 'material', label: 'Избранное' },
      { name: 'heart', family: 'material', label: 'Любовь' },
      { name: 'fire', family: 'material', label: 'Хот' },
      { name: 'lightning-bolt', family: 'material', label: 'Быстрые' },
      { name: 'charity', family: 'material', label: 'Благотворительность' },
      { name: 'hand-coin', family: 'material', label: 'Чаевые' },
      { name: 'clipboard-list', family: 'material', label: 'Разное' },
      { name: 'help-circle', family: 'material', label: 'Другое' },
    ],
  },
];

export const ALL_ICONS: IconDef[] = ICON_BANK.flatMap((g) => g.icons);

export function getIconDef(key: string): IconDef | undefined {
  return ALL_ICONS.find((i) => i.name === key);
}

export function serializeIcon(def: IconDef): string {
  return `${def.family}:${def.name}`;
}

export function deserializeIcon(raw: string): IconDef | undefined {
  if (!raw || !raw.includes(':')) return undefined;
  const [family, name] = raw.split(':');
  return { name, family: family as IconFamily, label: name };
}
