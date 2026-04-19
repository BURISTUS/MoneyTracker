import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const POPULAR_CODES = new Set([
  'USD', 'EUR', 'RUB', 'GBP', 'JPY', 'CNY', 'CHF', 'CAD', 'AUD',
  'TRY', 'KRW', 'INR', 'BRL', 'MXN', 'KZT', 'AED',
]);

const KNOWN_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', RUB: '₽', GBP: '£', JPY: '¥', CNY: '¥',
  CHF: 'CHF', CAD: 'C$', AUD: 'A$', TRY: '₺', KRW: '₩', INR: '₹',
  BRL: 'R$', MXN: 'MX$', KZT: '₸', AED: 'د.إ', UAH: '₴', PLN: 'zł',
  CZK: 'Kč', SEK: 'kr', NOK: 'kr', DKK: 'kr', SGD: 'S$', THB: '฿',
  VND: '₫', GEL: '₾', UZS: 'сўм', ZAR: 'R', HKD: 'HK$', MYR: 'RM',
  PHP: '₱', IDR: 'Rp', ARS: '$', BGN: 'лв', HUF: 'Ft', ILS: '₪',
  NGN: '₦', NZD: 'NZ$', PEN: 'S/', PKR: '₨', RON: 'lei', SAR: '﷼',
  TWD: 'NT$', EGP: '£', CLP: '$', COP: '$', BTC: '₿', ETH: 'Ξ',
  BNB: 'BNB', XRP: 'XRP', ADA: 'ADA', DOGE: 'Ð', SOL: 'SOL',
  DOT: 'DOT', LTC: 'Ł', AVAX: 'AVAX', LINK: 'LINK', UNI: 'UNI',
  ATOM: 'ATOM', XMR: 'XMR', USDT: '₮', USDC: 'USDC', TRX: 'TRX',
  SHIB: 'SHIB', TON: 'TON', XAU: 'Au', XAG: 'Ag', XPT: 'Pt', XPD: 'Pd',
};

const FIAT_CODES = new Set([
  'AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT',
  'BGN','BHD','BIF','BMD','BND','BOB','BRL','BSD','BTN','BWP','BYN','BZD','CAD',
  'CDF','CHF','CLP','CNH','CNY','COP','CRC','CUP','CVE','CZK','DJF','DKK','DOP',
  'DZD','EGP','ERN','ETB','EUR','FJD','FKP','GBP','GEL','GHS','GIP','GMD','GNF',
  'GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS','INR','IQD','IRR','ISK',
  'JMD','JOD','JPY','KES','KGS','KHR','KMF','KPW','KRW','KWD','KYD','KZT','LAK',
  'LBP','LKR','LRD','LSL','LYD','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRU',
  'MUR','MVR','MWK','MXN','MYR','MZN','NAD','NGN','NIO','NOK','NPR','NZD','OMR',
  'PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR',
  'SBD','SCR','SDG','SEK','SGD','SHP','SLE','SOS','SRD','STN','SVC','SYP','SZL',
  'THB','TJS','TMT','TND','TOP','TRY','TTD','TWD','TZS','UAH','UGX','USD','UYU',
  'UZS','VES','VND','VUV','WST','XAF','XCD','XOF','XPF','YER','ZAR','ZMW','ZWL',
  'AMD','ANG','AWG','BAM','BBD','BMD','BSD','BWP','BYN','BZD','CUP','DJF','ERN',
  'FJD','FKP','GIP','GTQ','GYD','HTG','KHR','KMF','KYD','LRD','MGA','MZN','NAD',
  'SCR','SHP','SLE','SOS','SRD','STN','SVC','SZL','TJS','TOP','TTD','VUV','WST',
  'XAF','XCD','XOF','XPF',
]);

const CRYPTO_CODES = new Set([
  'BTC','ETH','BNB','XRP','ADA','DOGE','SOL','DOT','MATIC','LTC','AVAX','LINK',
  'UNI','ATOM','XMR','USDT','USDC','TRX','SHIB','TON','1INCH','AAVE','AGIX','AKT',
  'ALGO','AMP','APE','APT','AR','ARB','AXS','BAKE','BAT','BCH','BSV','BSW','BTG',
  'BTT','BUSD','CAKE','CELO','CFX','CHZ','COMP','CRO','CRV','CSPR','CVX','DAI',
  'DASH','DCR','DFI','DYDX','EGLD','ENJ','EOS','ETC','FET','FIL','FEI','FLOW',
  'FLR','FRAX','FTT','GALA','GMX','GNO','GRT','GT','GUSD','HBAR','HNT','HOT',
  'HT','ICP','IMX','INJ','KAS','KAVA','KCS','KDA','KNC','KSM','LDO','LEO','LRC',
  'LUNA','LUNC','MANA','MBX','MINA','MKR','NEXO','NEAR','NEO','NFT','OKB','ONE',
  'OP','ORDI','PEPE','POL','QNT','QTUM','RNDR','RPL','RUNE','RVN','SAND','SNX',
  'STX','SUI','THETA','TWT','WAVES','WEMIX','WOO','XCH','XDC','XEC','XEM','XLM',
  'XTZ','YFI','ZEC','ZIL',
]);

const METAL_CODES = new Set(['XAU', 'XAG', 'XPT', 'XPD']);

const CACHE_KEY = 'currency:rates';
const CACHE_TTL = 86400;

const PRIMARY_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';
const FALLBACK_URL = 'https://latest.currency-api.pages.dev/v1/currencies/usd.json';

function classifyCurrency(code: string): 'FIAT' | 'CRYPTO' | 'METAL' {
  if (METAL_CODES.has(code)) return 'METAL';
  if (CRYPTO_CODES.has(code)) return 'CRYPTO';
  return 'FIAT';
}

@Injectable()
export class CurrencyService implements OnModuleInit {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async onModuleInit() {
    await this.seedPopular();
    await this.refreshRates();
  }

  private async seedPopular() {
    for (const code of POPULAR_CODES) {
      await this.prisma.exchangeRate.upsert({
        where: { code },
        update: { popular: true, name: `${code}`, symbol: KNOWN_SYMBOLS[code] || code, type: classifyCurrency(code) },
        create: {
          code,
          name: `${code}`,
          symbol: KNOWN_SYMBOLS[code] || code,
          type: classifyCurrency(code),
          popular: true,
          rate: code === 'USD' ? 1 : 0,
          date: '2025-01-01',
        },
      });
    }
    await this.redis.del(CACHE_KEY);
    this.logger.log(`Seeded ${POPULAR_CODES.size} popular currencies`);
  }

  @Cron('0 6 * * *')
  async scheduledRefresh() {
    this.logger.log('Scheduled exchange rate refresh...');
    const updated = await this.refreshRates();
    this.logger.log(`Updated ${updated} exchange rates`);
  }

  async refreshRates(): Promise<number> {
    const result = await this.fetchFromExchangeApi();
    if (!result) {
      this.logger.warn('All exchange API sources failed, keeping existing rates');
      return 0;
    }

    const { rates, date } = result;
    const dateStr = date || new Date().toISOString().slice(0, 10);
    let upserted = 0;

    const BATCH_SIZE = 50;
    const entries = Object.entries(rates);

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(([code, rate]) => {
          const upperCode = code.toUpperCase();
          if (upperCode.length > 10) return Promise.resolve();
          return this.prisma.exchangeRate
            .upsert({
              where: { code: upperCode },
              update: {
                rate,
                source: 'exchange-api',
                date: dateStr,
                fetchedAt: new Date(),
              },
              create: {
                code: upperCode,
                name: upperCode,
                symbol: KNOWN_SYMBOLS[upperCode] || upperCode,
                type: classifyCurrency(upperCode),
                popular: POPULAR_CODES.has(upperCode),
                rate,
                source: 'exchange-api',
                date: dateStr,
              },
            })
            .then(() => {
              upserted++;
            })
            .catch(() => {});
        }),
      );
    }

    await this.prisma.exchangeRate.upsert({
      where: { code: 'USD' },
      update: { rate: 1, source: 'exchange-api', date: dateStr, fetchedAt: new Date() },
      create: {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        type: 'FIAT',
        popular: true,
        rate: 1,
        source: 'exchange-api',
        date: dateStr,
      },
    });

    await this.redis.del(CACHE_KEY);

    this.logger.log(`Exchange-API: upserted ${upserted + 1} rates (total ${entries.length}), date: ${date}`);
    return upserted + 1;
  }

  private async fetchFromExchangeApi(): Promise<{ rates: Record<string, number>; date?: string } | null> {
    for (const url of [PRIMARY_URL, FALLBACK_URL]) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!response.ok) continue;

        const data = (await response.json()) as Record<string, unknown>;
        const usdRates = data?.usd;
        if (usdRates && typeof usdRates === 'object') {
          const { date, ...rates } = usdRates as Record<string, unknown>;
          const filteredRates: Record<string, number> = {};
          for (const [k, v] of Object.entries(rates)) {
            if (typeof v === 'number') {
              filteredRates[k] = v;
            }
          }
          return { rates: filteredRates, date: date as string | undefined };
        }
      } catch (error) {
        this.logger.warn(`Failed to fetch from ${url}: ${error}`);
      }
    }
    return null;
  }

  async getAllRates(type?: string, popular?: boolean) {
    const cacheKey = type ? `${CACHE_KEY}:${type}:${popular}` : CACHE_KEY;
    const cached = await this.redis.getCache<unknown[]>(cacheKey);
    if (cached) return cached;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (popular !== undefined) where.popular = popular;

    const rates = await this.prisma.exchangeRate.findMany({
      where,
      orderBy: [{ popular: 'desc' }, { code: 'asc' }],
    });

    await this.redis.setCache(cacheKey, rates, CACHE_TTL);
    return rates;
  }

  async getCurrencyList(params: { search?: string; type?: string; popular?: boolean; page?: number; limit?: number }) {
    const { search, type, popular, page = 1, limit = 50 } = params;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (popular !== undefined) where.popular = popular;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.exchangeRate.findMany({
        where,
        orderBy: [{ popular: 'desc' }, { code: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.exchangeRate.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPopular() {
    return this.prisma.exchangeRate.findMany({
      where: { popular: true },
      orderBy: { code: 'asc' },
    });
  }

  async getByType(type: string) {
    return this.prisma.exchangeRate.findMany({
      where: { type: type as 'FIAT' | 'CRYPTO' | 'METAL' },
      orderBy: { code: 'asc' },
    });
  }

  async getRate(code: string) {
    return this.prisma.exchangeRate.findUnique({ where: { code } });
  }

  async convert(amount: number, fromCode: string, toCode: string): Promise<number> {
    if (fromCode === toCode) return amount;

    const rates = await this.getAllRates();
    const from = (rates as Array<{ code: string; rate: number }>).find((r) => r.code === fromCode);
    const to = (rates as Array<{ code: string; rate: number }>).find((r) => r.code === toCode);

    if (!from || !to) throw new Error(`Currency not found: ${fromCode} or ${toCode}`);

    return (amount / from.rate) * to.rate;
  }

  async updateRate(code: string, rate: number, source: string) {
    const result = await this.prisma.exchangeRate.update({
      where: { code },
      data: { rate, source, fetchedAt: new Date() },
    });
    await this.redis.del(CACHE_KEY);
    return result;
  }

  async fetchFromExternal(): Promise<number> {
    return this.refreshRates();
  }
}
