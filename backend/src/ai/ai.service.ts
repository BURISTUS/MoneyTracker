import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

export interface ParsedTransaction {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  categoryName: string;
  categoryType: 'INCOME' | 'EXPENSE';
  date?: string;
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

const VOICE_SYSTEM_PROMPT = `Ты — парсер финансовых транзакций. Твоя единственная задача — извлечь из текста пользователя данные о транзакции и вернуть их в формате JSON.

## Правила извлечения
1. **Сумма**: извлекай числовое значение в основных единицах валюты (рубли, а не копейки; доллары, а не центы). «Полторашка пива за 150» → amount: 150. «Тысяча двести рублей» → amount: 1200.
2. **Тип**: EXPENSE по умолчанию. INCOME только если явно указано: «зарплата», «доход», «получил», «перевод на счёт», «премия».
3. **Описание**: краткое, 2–5 слов. «Купил кофе в старбаксе» → «Кофе Starbucks». «Заправил машину на 3000» → «АЗС заправка».
4. **Категория**: сопоставляй с существующими категориями пользователя. Если подходящей нет — предложи новую, названием которой будет 1–2 слова.
5. **Дата**: если указана («вчера», «в прошлую пятницу», «27 мая») — преобразуй в ISO-8601. Если не указана — не добавляй поле date.
6. **Валюта**: не включай в ответ, валюта определяется профилем пользователя.

## Формат ответа
Верни ТОЛЬКО валидный JSON. Без markdown, без комментариев, без пояснений.

Успешный парсинг:
{"type":"EXPENSE","amount":150,"description":"Кофе Starbucks","categoryName":"Кафе","categoryType":"EXPENSE"}

Не удалось распознать:
{"error":"Не удалось распознать транзакцию","detail":"причина"}`;

const RECEIPT_SYSTEM_PROMPT = `Ты — сканер чеков. Проанализируй фото чека и извлеки данные о покупках.

## Правила
1. Определи **магазин** (название, адрес если есть).
2. Извлеки **каждую позицию** чека: название товара, цена, категория.
3. Сопоставляй товары с категориями пользователя. Если подходящей категории нет — предложи новую.
4. **totalAmount** — итоговая сумма чека.
5. **amount** — итого для главной записи (равно totalAmount).
6. Суммы — в основных единицах валюты (рубли, не копейки).
7. Дата чека — в ISO-8601, если распознана.
8. Если чек не удалось распознать (размытое фото, не чек) — верни ошибку.

## Формат ответа
Верни ТОЛЬКО валидный JSON. Без markdown, без комментариев.

Успешно:
{"type":"EXPENSE","amount":1250,"description":"Пятёрочка","categoryName":"Продукты","categoryType":"EXPENSE","date":"2025-01-15","store":"Пятёрочка, ул. Ленина 42","totalAmount":1250,"items":[{"name":"Молоко 3.2%","amount":89,"categoryName":"Продукты"},{"name":"Хлеб белый","amount":45,"categoryName":"Продукты"},{"name":"Шоколад Milka","amount":119,"categoryName":"Сладости"}]}

Ошибка:
{"error":"Не удалось распознать чек","detail":"Фото размыто или не содержит кассового чека"}`;

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

  private buildVoiceContext(categories: Array<{ name: string; type: string }>, language?: string): string {
    const incomeCats = categories.filter((c) => c.type === 'INCOME').map((c) => c.name);
    const expenseCats = categories.filter((c) => c.type === 'EXPENSE').map((c) => c.name);
    let prompt = VOICE_SYSTEM_PROMPT;
    prompt += `\n\n## Категории пользователя\nДоходы: ${incomeCats.join(', ') || '(нет)'}\nРасходы: ${expenseCats.join(', ') || '(нет)'}\nЯзык ответа: ${language || 'ru'}`;
    return prompt;
  }

  private buildReceiptContext(categories: Array<{ name: string; type: string }>, language?: string): string {
    const incomeCats = categories.filter((c) => c.type === 'INCOME').map((c) => c.name);
    const expenseCats = categories.filter((c) => c.type === 'EXPENSE').map((c) => c.name);
    let prompt = RECEIPT_SYSTEM_PROMPT;
    prompt += `\n\n## Категории пользователя\nДоходы: ${incomeCats.join(', ') || '(нет)'}\nРасходы: ${expenseCats.join(', ') || '(нет)'}\nЯзык ответа: ${language || 'ru'}`;
    return prompt;
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
    const systemPrompt = this.buildVoiceContext(categories, language);

    this.logger.log(`Voice parse for user ${userId}: "${text}"`);

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
    this.logger.debug(`DeepSeek voice response: ${content}`);

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
    const systemPrompt = this.buildReceiptContext(categories, language);
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    this.logger.log(`Receipt parse for user ${userId}, image size: ${imageBase64.length}`);

    const response = await this.openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataUrl } },
            { type: 'text', text: 'Проанализируй этот чек и извлеки данные о покупках.' },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '';
    this.logger.debug(`DeepSeek receipt response: ${content}`);

    return this.parseResponse<ParsedReceipt>(content);
  }

  /** Парсинг JSON из ответа DeepSeek */
  private parseResponse<T>(content: string): T {
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
        throw new Error(parsed.detail || parsed.error);
      }

      return parsed as T;
    } catch (e) {
      this.logger.error(`Failed to parse AI response: ${content}`, e);
      throw new Error(
        `Не удалось распознать ответ AI: ${e instanceof Error ? e.message : 'неизвестная ошибка'}`,
      );
    }
  }
}