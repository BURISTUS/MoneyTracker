import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

export interface ParsedTransaction {
  type: 'INCOME' | 'EXPENSE';
  amount: number; // в основных единицах валюты (рубли, а не копейки)
  description: string;
  categoryName: string;
  categoryType: 'INCOME' | 'EXPENSE';
  date?: string; // ISO string
}

export interface ParsedReceipt extends ParsedTransaction {
  store?: string;
  totalAmount?: number;
  items?: Array<{
    name: string;
    amount: number;
    categoryName: string;
  }>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;

  constructor(private readonly prisma: PrismaService) {
    this.initClient();
  }

  private initClient() {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      this.logger.warn('DEEPSEEK_API_KEY not set — AI features disabled');
      return;
    }
    this.openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey,
    });
  }

  /** Получить категории пользователя для контекста промпта */
  private async getUserCategories(userId: string) {
    const categories = await this.prisma.category.findMany({
      where: { userId },
      select: { name: true, type: true, icon: true },
      orderBy: { name: 'asc' },
    });
    return categories.map((c) => ({
      name: c.name,
      type: c.type,
      icon: c.icon,
    }));
  }

  /** Системный промпт для парсинга транзакции */
  private buildSystemPrompt(categories: Array<{ name: string; type: string }>, language?: string): string {
    const incomeCats = categories.filter((c) => c.type === 'INCOME').map((c) => c.name);
    const expenseCats = categories.filter((c) => c.type === 'EXPENSE').map((c) => c.name);

    return `Ты — парсер финансовых транзакций. Твоя задача — извлечь из текста пользователя данные о транзакции и вернуть их в виде JSON.

Категории доходов пользователя: ${incomeCats.join(', ') || '(нет)'}
Категории расходов пользователя: ${expenseCats.join(', ') || '(нет)'}

Правила:
1. Сопоставляй название категории из текста с существующими категориями пользователя. Если близкое совпадение — используй существующую категорию.
2. Если подходящей категории нет — предложи новую (categoryName будет новым названием).
3. Сумма указывается в основных единицах валюты (рубли, а не копейки).
4. Если дата не указана — не добавляй поле date.
5. Тип транзакции по умолчанию — EXPENSE (расход), если явно не указано "доход", "зарплата", "получил" и т.д.
6. Язык ответа: ${language || 'ru'}

Верни ТОЛЬКО валидный JSON без markdown и пояснений:
{
  "type": "INCOME" или "EXPENSE",
  "amount": число,
  "description": "описание покупки/операции",
  "categoryName": "название категории",
  "categoryType": "INCOME" или "EXPENSE",
  "date": "ISO дата" (опционально)
}`;
  }

  /** Системный промпт для сканирования чека */
  private buildReceiptPrompt(categories: Array<{ name: string; type: string }>, language?: string): string {
    const incomeCats = categories.filter((c) => c.type === 'INCOME').map((c) => c.name);
    const expenseCats = categories.filter((c) => c.type === 'EXPENSE').map((c) => c.name);

    return `Ты — сканер чеков. Проанализируй фото чека и извлеки данные о покупках.

Категории расходов пользователя: ${expenseCats.join(', ') || '(нет)'}
Категории доходов пользователя: ${incomeCats.join(', ') || '(нет)'}

Правила:
1. Сопоставляй товары с категориями пользователя. Если нет подходящей — предложи новую.
2. Суммы указывай в основных единицах валюты (рубли, а не копейки).
3. Если на чеке есть дата — добавь поле date.
4. Определи магазин в поле store.
5. Общая сумма чека — в totalAmount.
6. Каждый товар — в items с amount и categoryName.
7. Общая категория чека — categoryName (наиболее подходящая).
8. Язык: ${language || 'ru'}

Верни ТОЛЬКО валидный JSON без markdown и пояснений:
{
  "type": "EXPENSE",
  "amount": общая_сумма_число,
  "description": "название_магазина",
  "categoryName": "основная_категория",
  "categoryType": "EXPENSE",
  "date": "ISO дата" (опционально),
  "store": "название магазина",
  "totalAmount": общая_сумма,
  "items": [
    { "name": "товар", "amount": цена, "categoryName": "категория" }
  ]
}

Если чек не удалось распознать — верни:
{ "error": "Не удалось распознать чек" }`;
  }

  /** Парсинг текстовой транзакции (голос/текст) */
  async parseVoiceTransaction(
    userId: string,
    text: string,
    language?: string,
  ): Promise<ParsedTransaction> {
    if (!this.openai) {
      throw new Error('DeepSeek API не настроен. Укажите DEEPSEEK_API_KEY в .env');
    }

    const categories = await this.getUserCategories(userId);
    const systemPrompt = this.buildSystemPrompt(categories, language);

    this.logger.log(`🎙️ Voice parse for user ${userId}: "${text}"`);

    const response = await this.openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '';
    this.logger.log(`🤖 DeepSeek response: ${content}`);

    return this.parseResponse<ParsedTransaction>(content);
  }

  /** Парсинг чека по фото */
  async parseReceiptTransaction(
    userId: string,
    imageBase64: string,
    mimeType: string,
    language?: string,
  ): Promise<ParsedReceipt> {
    if (!this.openai) {
      throw new Error('DeepSeek API не настроен. Укажите DEEPSEEK_API_KEY в .env');
    }

    const categories = await this.getUserCategories(userId);
    const systemPrompt = this.buildReceiptPrompt(categories, language);

    // Формируем data URL для DeepSeek Vision
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    this.logger.log(`📷 Receipt parse for user ${userId}, image size: ${imageBase64.length}`);

    const response = await this.openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
            {
              type: 'text',
              text: 'Проанализируй этот чек и извлеки данные о покупках.',
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '';
    this.logger.log(`🤖 DeepSeek receipt response: ${content}`);

    return this.parseResponse<ParsedReceipt>(content);
  }

  /** Парсинг JSON из ответа DeepSeek */
  private parseResponse<T>(content: string): T {
    // Убираем markdown-обёртки если есть
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    try {
      const parsed = JSON.parse(cleaned);

      if (parsed.error) {
        throw new Error(parsed.error);
      }

      return parsed as T;
    } catch (e) {
      this.logger.error(`Failed to parse AI response: ${content}`, e);
      throw new Error(`Не удалось распознать ответ AI: ${e instanceof Error ? e.message : 'неизвестная ошибка'}`);
    }
  }
}