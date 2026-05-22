import { Controller, Get, Param } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

const I18N_DIR = path.join(__dirname, '..', 'i18n');

const SUPPORTED_LANGUAGES = [
  'en', 'ru', 'es', 'pt', 'fr', 'de', 'ja', 'zh',
  'ar', 'hi', 'ko', 'it', 'tr', 'vi', 'id', 'th',
  'pl', 'uk', 'nl', 'bn',
];

@Controller('i18n')
export class I18nController {
  @Get('translations/:lang')
  async getTranslations(@Param('lang') lang: string) {
    const resolved = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';

    const langDir = path.join(I18N_DIR, resolved);
    try {
      await fs.access(langDir);
    } catch {
      return {};
    }

    const result: Record<string, unknown> = {};
    const files = await fs.readdir(langDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    for (const file of jsonFiles) {
      const group = file.replace('.json', '');
      const content = await fs.readFile(path.join(langDir, file), 'utf-8');
      result[group] = JSON.parse(content);
    }

    return result;
  }

  @Get('languages')
  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
      { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
      { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
      { code: 'th', name: 'Thai', nativeName: 'ไทย' },
      { code: 'pl', name: 'Polish', nativeName: 'Polski' },
      { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
      { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    ];
  }
}
