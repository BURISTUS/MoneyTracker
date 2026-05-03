import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, CategoryType } from '@prisma/client';
import { AppException } from '../common/app-exception';

// Доступные иконки для категорий
const AVAILABLE_ICONS = [
  'wallet', 'cash', 'card', 'laptop', 'phone-portrait',
  'cart', 'basket', 'storefront', 'pricetag', 'gift',
  'home', 'car', 'bus', 'train', 'airplane', 'boat',
  'restaurant', 'cafe', 'wine', 'pizza', 'beer',
  'medical', 'fitness', 'eye', 'bandage', 'thermometer',
  'game-controller', 'musical-notes', 'film', 'book', 'school',
  'shirt', 'watch', 'glasses', 'diamond', 'flower',
  'pet', 'leaf', 'water', 'flash', 'power',
  'call', 'mail', 'globe', 'wifi', 'Bluetooth',
  'game-controller', 'tennisball', 'football', 'basketball', 'walk',
  'bed', 'cut', 'brush', 'happy', 'sad',
];

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  // При запуске - ничего не сидим, категории создаются при регистрации юзера
  async onModuleInit() {
    // seedSystemCategories убран — теперь персональные категории на юзера
  }

  // Получить все доступные иконки
  getAvailableIcons() {
    return AVAILABLE_ICONS.map(icon => ({ name: icon }));
  }

  // Получить все категории пользователя
  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  // Получить только персональные категории пользователя
  async findPersonal(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  // Получить только системные категории (публичный метод)
  async findSystemCategories() {
    return this.prisma.category.findMany({
      where: { userId: null },
      orderBy: [
        { type: 'asc' },
        { order: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findById(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        OR: [
          { userId: null }, // Системные
          { userId }, // Персональные
        ],
      },
    });
    if (!category) {
      throw new AppException('errors.categoryNotFound', 404);
    }
    return category;
  }

  // Создать персональную категорию
  async create(userId: string, data: { name: string; type: CategoryType; icon?: string; color?: string; isBaseNeed?: boolean; excludeFromTotal?: boolean; monthlyLimit?: bigint; images?: string[] }) {
    const existingSystem = await this.prisma.category.findFirst({
      where: { name: data.name, userId: null },
    });
    if (existingSystem) {
      throw new Error('Категория с таким названием уже существует в системных');
    }

    return this.prisma.category.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        icon: data.icon,
        color: data.color,
        isBaseNeed: data.isBaseNeed ?? false,
        excludeFromTotal: data.excludeFromTotal ?? false,
        monthlyLimit: data.monthlyLimit,
        images: data.images ?? [],
      },
    });
  }

  async update(id: string, userId: string, data: Prisma.CategoryUpdateInput) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId: { not: null } }, // Только персональные
    });
    if (!category) {
      throw new AppException('errors.categoryNotFound', 404);
    }
    return this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        images: data.images !== undefined ? data.images : undefined,
      },
    });
  }

  async delete(id: string, userId: string) {
    // Нельзя удалять системные категории
    const category = await this.prisma.category.findFirst({
      where: { id, userId: { not: null } }, // Только персональные
    });
    if (!category) {
      throw new AppException('errors.categoryNotFound', 404);
    }
    return this.prisma.category.delete({
      where: { id },
    });
  }

  // Создать пресет категорий для нового юзера
  async createDefaultsForUser(userId: string) {
    const defaultCategories = [
      { name: 'Зарплата', type: CategoryType.INCOME, icon: 'material:wallet', color: '#34C759', isBaseNeed: false, order: 1 },
      { name: 'Фриланс', type: CategoryType.INCOME, icon: 'material:laptop', color: '#007AFF', isBaseNeed: false, order: 2 },
      { name: 'Инвестиции', type: CategoryType.INCOME, icon: 'material:chart-line', color: '#5856D6', isBaseNeed: false, order: 3 },
      { name: 'Подарки', type: CategoryType.INCOME, icon: 'material:gift', color: '#FF2D55', isBaseNeed: false, order: 4 },
      { name: 'Другое', type: CategoryType.INCOME, icon: 'material:dots-horizontal', color: '#8E8E93', isBaseNeed: false, order: 5 },
      { name: 'Продукты', type: CategoryType.EXPENSE, icon: 'material:cart', color: '#34C759', isBaseNeed: true, order: 10 },
      { name: 'Транспорт', type: CategoryType.EXPENSE, icon: 'material:bus', color: '#007AFF', isBaseNeed: true, order: 11 },
      { name: 'Жильё', type: CategoryType.EXPENSE, icon: 'material:home', color: '#FF9500', isBaseNeed: true, order: 12 },
      { name: 'Коммунальные', type: CategoryType.EXPENSE, icon: 'material:flash', color: '#FFCC00', isBaseNeed: true, order: 13 },
      { name: 'Связь', type: CategoryType.EXPENSE, icon: 'material:phone', color: '#5856D6', isBaseNeed: true, order: 14 },
      { name: 'Здоровье', type: CategoryType.EXPENSE, icon: 'material:medical-bag', color: '#FF2D55', isBaseNeed: true, order: 15 },
      { name: 'Развлечения', type: CategoryType.EXPENSE, icon: 'material:gamepad-variant', color: '#AF52DE', isBaseNeed: false, order: 20 },
      { name: 'Одежда', type: CategoryType.EXPENSE, icon: 'material:tshirt-crew', color: '#5AC8FA', isBaseNeed: false, order: 21 },
      { name: 'Рестораны', type: CategoryType.EXPENSE, icon: 'material:food', color: '#FF3B30', isBaseNeed: false, order: 22 },
      { name: 'Подарки', type: CategoryType.EXPENSE, icon: 'material:gift', color: '#FF2D55', isBaseNeed: false, order: 23 },
      { name: 'Корректировка', type: CategoryType.EXPENSE, icon: 'material:swap-horizontal', color: '#8E8E93', isBaseNeed: false, order: 99 },
    ];

    const existing = await this.prisma.category.findMany({
      where: { userId },
      select: { name: true },
    });
    const existingNames = new Set(existing.map((c) => c.name));

    const created = [];
    for (const cat of defaultCategories) {
      if (existingNames.has(cat.name)) continue;
      const newCat = await this.prisma.category.create({
        data: {
          userId,
          ...cat,
        },
      });
      created.push(newCat);
    }
    return { created: created.length, skipped: defaultCategories.length - created.length };
  }
}
