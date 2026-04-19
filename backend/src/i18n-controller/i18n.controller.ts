import { Controller, Get, Param } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const I18N_DIR = path.join(__dirname, '..', 'i18n');

@Controller('i18n')
export class I18nController {
  @Get('translations/:lang')
  async getTranslations(@Param('lang') lang: string) {
    const supported = ['en', 'ru', 'es', 'pt', 'fr', 'de', 'ja', 'zh'];
    const resolved = supported.includes(lang) ? lang : 'en';

    const langDir = path.join(I18N_DIR, resolved);
    if (!fs.existsSync(langDir)) {
      return {};
    }

    const result: Record<string, any> = {};
    const files = fs.readdirSync(langDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      const group = file.replace('.json', '');
      const content = fs.readFileSync(path.join(langDir, file), 'utf-8');
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
    ];
  }
}
