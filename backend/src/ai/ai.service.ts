import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/app-exception';
import { ConfigService } from '@nestjs/config';
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

const VOICE_SYSTEM_PROMPT = `You are a financial transaction parser. Your only task is to extract transaction data from the user's text and return it in JSON format.

## Extraction rules
1. **Amount**: extract the numeric value in main currency units (rubles, not kopecks; dollars, not cents). "A beer for 150" → amount: 150. "One thousand two hundred rubles" → amount: 1200.
2. **Type**: EXPENSE by default. INCOME only if explicitly stated: "salary", "income", "received", "transfer to account", "bonus".
3. **Description**: brief, 2–5 words. "Bought coffee at Starbucks" → "Coffee Starbucks". "Filled up the car for 3000" → "Gas station".
4. **Category**: match with existing user categories. If none fits — suggest a new one with a 1–2 word name.
5. **Date**: if specified ("yesterday", "last Friday", "May 27") — convert to ISO-8601. If not specified — do not include the date field.
6. **Currency**: do not include in the response, currency is determined by the user's profile.

## Response format
Return ONLY valid JSON. No markdown, no comments, no explanations.

Successful parse:
{"type":"EXPENSE","amount":150,"description":"Coffee Starbucks","categoryName":"Cafe","categoryType":"EXPENSE"}

Failed to parse:
{"error":"Failed to recognize transaction","detail":"reason"}`;

const RECEIPT_SYSTEM_PROMPT = `You are a receipt scanner. Analyze the receipt photo and extract purchase data.

## Rules
1. Identify the **store** (name, address if available).
2. Extract **each line item**: product name, price, category.
3. Match products with user categories. If no suitable category exists — suggest a new one.
4. **totalAmount** — total receipt amount.
5. **amount** — total for the main record (equals totalAmount).
6. Amounts — in main currency units (rubles, not kopecks).
7. Receipt date — in ISO-8601, if recognized.
8. If the receipt cannot be recognized (blurry photo, not a receipt) — return an error.

## Response format
Return ONLY valid JSON. No markdown, no comments.

Success:
{"type":"EXPENSE","amount":1250,"description":"Grocery Store","categoryName":"Groceries","categoryType":"EXPENSE","date":"2025-01-15","store":"Grocery Store, Main St 42","totalAmount":1250,"items":[{"name":"Milk 3.2%","amount":89,"categoryName":"Groceries"},{"name":"White bread","amount":45,"categoryName":"Groceries"},{"name":"Chocolate Milka","amount":119,"categoryName":"Sweets"}]}

Error:
{"error":"Failed to recognize receipt","detail":"Photo is blurry or does not contain a receipt"}`;

const RECEIPT_USER_TEXT: Record<string, string> = {
  en: 'Analyze this receipt and extract purchase data.',
  ru: 'Проанализируй этот чек и извлеки данные о покупках.',
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.initClient();
  }

  private initClient() {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    if (!apiKey) {
      this.logger.warn('DEEPSEEK_API_KEY not set — AI features disabled');
      return;
    }
    const apiUrl =
      this.configService.get<string>('DEEPSEEK_API_URL') ||
      'https://api.deepseek.com';
    this.openai = new OpenAI({ baseURL: apiUrl, apiKey });
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

  private buildVoiceContext(
    categories: Array<{ name: string; type: string }>,
    language?: string,
  ): string {
    const incomeCats = categories
      .filter((c) => c.type === 'INCOME')
      .map((c) => c.name);
    const expenseCats = categories
      .filter((c) => c.type === 'EXPENSE')
      .map((c) => c.name);
    let prompt = VOICE_SYSTEM_PROMPT;
    prompt += `\n\n## User categories\nIncome: ${incomeCats.join(', ') || '(none)'}\nExpenses: ${expenseCats.join(', ') || '(none)'}\nResponse language: ${language || 'en'}`;
    return prompt;
  }

  private buildReceiptContext(
    categories: Array<{ name: string; type: string }>,
    language?: string,
  ): string {
    const incomeCats = categories
      .filter((c) => c.type === 'INCOME')
      .map((c) => c.name);
    const expenseCats = categories
      .filter((c) => c.type === 'EXPENSE')
      .map((c) => c.name);
    let prompt = RECEIPT_SYSTEM_PROMPT;
    prompt += `\n\n## User categories\nIncome: ${incomeCats.join(', ') || '(none)'}\nExpenses: ${expenseCats.join(', ') || '(none)'}\nResponse language: ${language || 'en'}`;
    return prompt;
  }

  async parseVoiceTransaction(
    userId: string,
    text: string,
    language?: string,
  ): Promise<ParsedTransaction> {
    if (!this.openai) {
      throw new AppException('errors.aiNotConfigured', 503);
    }

    const categories = await this.getUserCategories(userId);
    const systemPrompt = this.buildVoiceContext(categories, language);

    this.logger.log(`Voice parse for user ${userId}: "${text}"`);

    try {
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
    } catch (error) {
      if (error instanceof AppException) throw error;
      this.logger.error(
        `Voice parse error for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new AppException('errors.aiResponseError', 502);
    }
  }

  async parseReceiptTransaction(
    userId: string,
    imageBase64: string,
    mimeType: string,
    language?: string,
  ): Promise<ParsedReceipt> {
    if (!this.openai) {
      throw new AppException('errors.aiNotConfigured', 503);
    }

    const categories = await this.getUserCategories(userId);
    const systemPrompt = this.buildReceiptContext(categories, language);
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    this.logger.log(
      `Receipt parse for user ${userId}, image size: ${imageBase64.length}`,
    );

    try {
      const response = await this.openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: dataUrl } },
              {
                type: 'text',
                text: RECEIPT_USER_TEXT[language || 'en'] || RECEIPT_USER_TEXT['en'],
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content || '';
      this.logger.debug(`DeepSeek receipt response: ${content}`);

      return this.parseResponse<ParsedReceipt>(content);
    } catch (error) {
      if (error instanceof AppException) throw error;
      this.logger.error(
        `Receipt parse error for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new AppException('errors.aiResponseError', 502);
    }
  }

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
        throw new AppException('errors.aiParseError', 400, {
          detail: parsed.detail || parsed.error,
        });
      }

      return parsed as T;
    } catch (e) {
      if (e instanceof AppException) throw e;
      this.logger.error(`Failed to parse AI response: ${content}`, e);
      throw new AppException('errors.aiParseError', 422, {
        detail: e instanceof Error ? e.message : 'unknown',
      });
    }
  }
}
