import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/app-exception';

interface ArticleTranslationInput {
  language: string;
  title: string;
  content: string;
  readTime: string;
}

const SEED_ARTICLES = [
  {
    slug: 'price-of-life',
    tag: 'Life-Cost',
    translations: [
      { language: 'en', title: 'What is the price of your life', content: 'Every time you spend money, you are spending time. Time you could have spent with family, learning something new, or simply living.\n\nThink about it: that new smartphone costs not 100,000 rubles, but 150 hours of your life. One hundred and fifty hours in an office, under fluorescent lights, solving someone else\'s problems.\n\n**The math is simple.**\nYour salary ÷ working hours = your real hourly rate. When you know this number, every price tag tells a different story. A coffee for 300₽? That\'s 15 minutes. A jacket for 10,000₽? That\'s 8 hours — a full working day.\n\n**Why it matters.**\nWe are programmed to think of money as abstract numbers on a screen. But when you convert those numbers into hours of your finite life, impulse spending becomes much harder. You start asking yourself: "Is this thing worth 3 days of my life?"\n\n**How to use it.**\n1. Calculate your real hourly rate\n2. Before any purchase, divide the price by your rate\n3. Ask: would I work X hours for this?\n\nThis simple mental shift has helped thousands of people cut unnecessary spending by 30-40% without feeling deprived. They simply started valuing their time more than things.', readTime: '5 min read' },
      { language: 'ru', title: 'Сколько стоит твоя жизнь', content: 'Каждый раз, когда ты тратишь деньги, ты тратишь время. Время, которое мог бы провести с семьёй, изучая новое или просто живя.\n\nЗадумайся: новый смартфон стоит не 100 000 рублей, а 150 часов твоей жизни. Сто пятьдесят часов в офисе, под лампами дневного света, решая чужие проблемы.\n\n**Математика проста.**\nТвоя зарплата ÷ рабочие часы = твоя реальная часовая ставка. Когда ты знаешь эту цифру, каждый ценник рассказывает другую историю. Кофе за 300₽? Это 15 минут. Куртка за 10 000₽? Это 8 часов — полный рабочий день.\n\n**Почему это важно.**\nНас запрограммировали думать о деньгах как об абстрактных цифрах на экране. Но когда ты переводишь эти цифры в часы своей конечной жизни, импульсивные траты становятся гораздо сложнее. Ты начинаешь спрашивать себя: "Эта вещь стоит трёх дней моей жизни?"\n\n**Как использовать.**\n1. Рассчитай свою реальную часовую ставку\n2. Перед любой покупкой раздели цену на свою ставку\n3. Спроси: стал бы я работать X часов ради этого?\n\nЭтот простой ментальный сдвиг помог тысячам людей сократить ненужные траты на 30-40% без чувства лишений. Они просто начали ценить своё время больше, чем вещи.', readTime: '5 мин чтения' },
      { language: 'es', title: 'El precio de tu vida', content: 'Cada vez que gastas dinero, estás gastando tiempo. Tiempo que podrías haber pasado con tu familia, aprendiendo algo nuevo o simplemente viviendo.\n\nPiénsalo: ese nuevo smartphone no cuesta 100.000 rublos, sino 150 horas de tu vida. Ciento cincuenta horas en una oficina, bajo luces fluorescentes, resolviendo problemas de otros.\n\n**La matemática es simple.**\nTu salario ÷ horas de trabajo = tu tarifa por hora real. Cuando conoces este número, cada etiqueta de precio cuenta una historia diferente. ¿Un café por 300₽? Son 15 minutos. ¿Una chaqueta por 10.000₽? Son 8 horas — un día completo de trabajo.\n\nEste simple cambio mental ha ayudado a miles de personas a reducir gastos innecesarios en un 30-40% sin sentirse privados. Simplemente comenzaron a valorar su tiempo más que las cosas.', readTime: '4 min lectura' },
      { language: 'de', title: 'Was kostet dein Leben', content: 'Jedes Mal, wenn du Geld ausgibst, gibst du Zeit aus. Zeit, die du mit deiner Familie hättest verbringen können, um Neues zu lernen oder einfach zu leben.\n\nDenk darüber nach: Dieses neue Smartphone kostet nicht 100.000 Rubel, sondern 150 Stunden deines Lebens. Einhundertfünfzig Stunden in einem Büro, unter Neonlicht, um die Probleme anderer zu lösen.\n\n**Die Mathematik ist einfach.**\nDein Gehalt ÷ Arbeitsstunden = dein echter Stundensatz. Wenn du diese Zahl kennst, erzählt jedes Preisschild eine andere Geschichte.\n\nDieser einfache mentale Wandel hat Tausenden geholfen, unnötige Ausgaben um 30-40% zu senken, ohne sich beraubt zu fühlen.', readTime: '4 Min. Lesezeit' },
      { language: 'pt', title: 'Qual é o preço da sua vida', content: 'Cada vez que você gasta dinheiro, está gastando tempo. Tempo que poderia ter passado com a família, aprendendo algo novo ou simplesmente vivendo.\n\nPense nisso: esse novo smartphone não custa 100.000 rublos, mas 150 horas da sua vida. Cento e cinquenta horas em um escritório, sob luzes fluorescentes, resolvendo os problemas dos outros.\n\n**A matemática é simples.**\nSeu salário ÷ horas de trabalho = sua taxa horária real. Quando você conhece esse número, cada etiqueta de preço conta uma história diferente.\n\nEsta simples mudança mental ajudou milhares de pessoas a reduzir gastos desnecessários em 30-40% sem se sentirem privadas.', readTime: '4 min de leitura' },
    ],
  },
  {
    slug: '7-day-rule',
    tag: 'Psychology',
    translations: [
      { language: 'en', title: 'The 7-day rule: how to stop impulse buying', content: 'You see it, you want it, you buy it. Three seconds and your money is gone. But here\'s the thing: your brain is wired for instant gratification, and marketers know exactly how to exploit that.\n\n**The dopamine trap.**\nWhen you want something, your brain releases dopamine — the anticipation chemical. The moment you buy it, dopamine drops. The pleasure was in the wanting, not the having. This is why new purchases feel empty within days.\n\n**Enter the 7-day rule.**\nInstead of buying immediately, add the item to your "Incubator" and wait 7 days. During this time:\n• The initial dopamine surge fades\n• You evaluate whether you really need it\n• You calculate how many hours of work it costs\n\n**Why 7 days?**\nResearch shows that impulse urges typically last 20 minutes to 3 hours. After 24 hours, desire drops by 50%. After 7 days, 80% of impulse purchases are no longer wanted.\n\n**Real results.**\nOur users report that after adopting the 7-day rule:\n• 65% of wishlist items are rejected after cooling down\n• Average monthly savings: 15,000-30,000₽\n• Reduced buyer\'s remorse by 90%\n\nThe 7-day rule doesn\'t mean you never buy anything. It means every purchase is a conscious choice, not a chemical hijack.', readTime: '6 min read' },
      { language: 'ru', title: 'Правило 7 дней: как перестать покупать импульсивно', content: 'Ты видишь, ты хочешь, ты покупаешь. Три секунды — и деньги ушли. Но вот в чём дело: твой мозг запрограммирован на мгновенное вознаграждение, и маркетологи точно знают, как этим пользоваться.\n\n**Дофаминовая ловушка.**\nКогда ты чего-то хочешь, мозг выделяет дофамин — химическое вещество предвкушения. В момент покупки дофамин падает. Удовольствие было в желании, а не в обладании. Поэтому новые покупки кажутся пустыми уже через несколько дней.\n\n**Входит правило 7 дней.**\nВместо мгновенной покупки добавь вещь в «Инкубатор» и подожди 7 дней. За это время:\n• Первоначальный дофаминовый всплеск угасает\n• Ты оцениваешь, действительно ли тебе это нужно\n• Ты считаешь, сколько часов работы это стоит\n\n**Почему 7 дней?**\nИсследования показывают, что импульсные позывы обычно длятся от 20 минут до 3 часов. Через 24 часа желание падает на 50%. Через 7 дней 80% импульсных покупок уже не нужны.\n\n**Реальные результаты.**\nНаши пользователи сообщают, что после принятия правила 7 дней:\n• 65% желаний отвергаются после остывания\n• Средняя ежемесячная экономия: 15 000-30 000₽\n• Сожаления о покупках снизились на 90%\n\nПравило 7 дней не означает, что ты никогда ничего не покупаешь. Оно означает, что каждая покупка — осознанный выбор, а не химический захват.', readTime: '6 мин чтения' },
      { language: 'es', title: 'La regla de los 7 días: cómo dejar las compras impulsivas', content: 'Lo ves, lo quieres, lo compras. Tres segundos y tu dinero se ha ido. Pero aquí está la cuestión: tu cerebro está programado para la gratificación instantánea, y los vendedores saben exactamente cómo explotarlo.\n\n**La trampa de la dopamina.**\nCuando quieres algo, tu cerebro libera dopamina — la sustancia química de la anticipación. En el momento en que lo compras, la dopamina cae. El placer estaba en el deseo, no en la posesión. Por eso las nuevas compras se sienten vacías en días.\n\n**Entra la regla de los 7 días.**\nEn lugar de comprar inmediatamente, añade el artículo a tu "Incubadora" y espera 7 días. Durante este tiempo evalúas si realmente lo necesitas y calculas cuántas horas de trabajo cuesta.\n\nDespués de 7 días, el 80% de las compras impulsivas ya no se desean.', readTime: '5 min lectura' },
      { language: 'de', title: 'Die 7-Tage-Regel: Impulskäufe stoppen', content: 'Du siehst es, du willst es, du kaufst es. Drei Sekunden und dein Geld ist weg. Aber hier ist der Punkt: Dein Gehirn ist auf sofortige Belohnung programmiert, und Vermarkter wissen genau, wie sie das ausnutzen.\n\n**Die Dopamin-Falle.**\nWenn du etwas willst, setzt dein Gehirn Dopamin frei. Sobald du es kaufst, sinkt das Dopamin. Das Vergnügen lag im Wollen, nicht im Haben. Deshalb fühlen sich neue Käufe innerhalb weniger Tage leer an.\n\nNach 7 Tagen werden 80% der Impulskäufe nicht mehr gewünscht.', readTime: '5 Min. Lesezeit' },
      { language: 'pt', title: 'A regra dos 7 dias: como parar de comprar por impulso', content: 'Você vê, você quer, você compra. Três segundos e seu dinheiro se foi. Mas é o seguinte: seu cérebro é programado para gratificação instantânea, e os profissionais de marketing sabem exatamente como explorar isso.\n\n**A armadilha da dopamina.**\nQuando você quer algo, seu cérebro libera dopamina. No momento em que você compra, a dopamina cai. O prazer estava no desejo, não na posse. É por isso que novas compras parecem vazias em poucos dias.\n\nApós 7 dias, 80% das compras por impulso não são mais desejadas.', readTime: '5 min de leitura' },
    ],
  },
  {
    slug: 'budget-5-min',
    tag: 'Practice',
    translations: [
      { language: 'en', title: 'Budget in 5 minutes: a system that actually works', content: 'Most budgeting advice is terrible. "Track every penny!" "Create 47 categories!" "Use this spreadsheet with 12 tabs!" No wonder 80% of people give up on budgeting within 3 months.\n\n**The problem with traditional budgeting.**\nTraditional budgets treat you like an accountant. They demand precision, constant updates, and complex categorization. But life is messy. Unexpected expenses happen. And nobody wants to spend Sunday evening reconciling receipts.\n\n**The 50/30/20 framework, simplified.**\nInstead of tracking everything, use three buckets:\n\n**50% — Needs (Base)**\nRent, food, utilities, transport, minimum debt payments. If this exceeds 50%, you need to either increase income or reduce fixed costs — no amount of coffee-cutting will fix it.\n\n**30% — Wants (Conscious)**\nRestaurants, entertainment, hobbies, shopping, subscriptions. This is where the Incubator shines — freeze wants before spending.\n\n**20% — Future (Freedom)**\nSavings, investments, debt overpayment. This is your ticket out of the rat race. Every ruble here buys future freedom.\n\n**How to start today.**\n1. Open your banking app, look at last month\n2. Categorize into 3 buckets (don\'t overthink)\n3. If Needs > 50%: focus on income or housing\n4. If Wants > 30%: start using the Incubator\n5. If Future < 20%: automate a transfer on payday\n\nThat\'s it. 5 minutes, once a month. No spreadsheets, no guilt, no burnout. Just three numbers that tell you where your life is going.', readTime: '4 min read' },
      { language: 'ru', title: 'Бюджет за 5 минут: система, которая работает', content: 'Большинство советов по бюджету ужасны. «Отслеживай каждую копейку!» «Создай 47 категорий!» «Используй таблицу с 12 вкладками!» Неудивительно, что 80% людей бросают бюджетирование в течение 3 месяцев.\n\n**Проблема традиционного бюджетирования.**\nТрадиционные бюджеты относятся к тебе как к бухгалтеру. Они требуют точности, постоянных обновлений и сложной категоризации. Но жизнь беспорядочна. Неожиданные расходы случаются. И никто не хочет провести воскресный вечер, сверяя чеки.\n\n**Фреймворк 50/30/20, упрощённо.**\nВместо отслеживания всего используй три ведра:\n\n**50% — База (Необходимости)**\nАренда, еда, коммуналка, транспорт, минимальные платежи по долгам. Если это превышает 50%, нужно либо увеличить доход, либо сократить фиксированные расходы — никакая экономия на кофе это не исправит.\n\n**30% — Хотелки (Осознанные)**\nРестораны, развлечения, хобби, шопинг, подписки. Здесь Инкубатор проявляет себя лучше всего — замораживай хотелки перед тратой.\n\n**20% — Будущее (Свобода)**\nСбережения, инвестиции, досрочное погашение долгов. Это твой билет из крысиных бегов. Каждый рубль здесь покупает будущую свободу.\n\n**Как начать сегодня.**\n1. Открой банковское приложение, посмотри прошлый месяц\n2. Разнеси по трём вёдрам (не усложняй)\n3. Если База > 50%: фокус на доходе или жилье\n4. Если Хотелки > 30%: начни использовать Инкубатор\n5. Если Будущее < 20%: автоматизируй перевод в день зарплаты\n\nВот и всё. 5 минут, раз в месяц. Никаких таблиц, вины и выгорания. Всего три цифры, которые говорят тебе, куда движется твоя жизнь.', readTime: '5 мин чтения' },
      { language: 'es', title: 'Presupuesto en 5 minutos: un sistema que funciona', content: 'La mayoría de los consejos de presupuesto son terribles. ¡"Rastrea cada centavo"! ¡"Crea 47 categorías"! No es de extrañar que el 80% de las personas abandonen el presupuesto en 3 meses.\n\n**El problema con el presupuesto tradicional.**\nLos presupuestos tradicionales te tratan como a un contador. Exigen precisión, actualizaciones constantes y categorización compleja. Pero la vida es desordenada.\n\n**El marco 50/30/20, simplificado.**\nEn lugar de rastrear todo, usa tres categorías: 50% Necesidades, 30% Deseos, 20% Futuro. Cinco minutos, una vez al mes. Solo tres números que te dicen hacia dónde va tu vida.', readTime: '4 min lectura' },
      { language: 'de', title: 'Budget in 5 Minuten: Ein System, das funktioniert', content: 'Die meisten Budget-Ratschläge sind schrecklich. "Verfolge jeden Cent!" "Erstelle 47 Kategorien!" Kein Wunder, dass 80% der Menschen das Budgetieren innerhalb von 3 Monaten aufgeben.\n\n**Das Problem mit traditioneller Budgetierung.**\nTraditionelle Budgets behandeln dich wie einen Buchhalter. Sie verlangen Präzision, ständige Aktualisierungen und komplexe Kategorisierung. Aber das Leben ist chaotisch.\n\n**Das 50/30/20-Framework, vereinfacht.**\nStatt alles zu verfolgen, nutze drei Kategorien: 50% Notwendiges, 30% Wünsche, 20% Zukunft. Fünf Minuten, einmal im Monat. Nur drei Zahlen, die dir sagen, wohin dein Leben geht.', readTime: '4 Min. Lesezeit' },
      { language: 'pt', title: 'Orçamento em 5 minutos: um sistema que funciona', content: 'A maioria dos conselhos sobre orçamento é terrível. "Acompanhe cada centavo!" "Crie 47 categorias!" Não é de admirar que 80% das pessoas desistam de fazer orçamento em 3 meses.\n\n**O problema com o orçamento tradicional.**\nOs orçamentos tradicionais tratam você como um contador. Exigem precisão, atualizações constantes e categorização complexa. Mas a vida é bagunçada.\n\n**A estrutura 50/30/20, simplificada.**\nEm vez de rastrear tudo, use três categorias: 50% Necessidades, 30% Desejos, 20% Futuro. Cinco minutos, uma vez por mês. Apenas três números que dizem para onde sua vida está indo.', readTime: '4 min de leitura' },
    ],
  },
];

@Injectable()
export class ArticlesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(ArticlesService.name);

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    for (const article of SEED_ARTICLES) {
      const existing = await this.prisma.article.findUnique({ where: { slug: article.slug } });

      if (existing) {
        await this.prisma.articleTranslation.deleteMany({ where: { articleId: existing.id } });
        await this.prisma.articleTranslation.createMany({
          data: article.translations.map((t) => ({
            articleId: existing.id,
            ...t,
          })),
        });
        this.logger.log(`Updated article: ${article.slug}`);
      } else {
        await this.prisma.article.create({
          data: {
            slug: article.slug,
            tag: article.tag,
            translations: {
              create: article.translations,
            },
          },
        });
        this.logger.log(`Seeded article: ${article.slug}`);
      }
    }
  }

  async findAll(language: string) {
    const articles = await this.prisma.article.findMany({
      include: {
        translations: {
          where: { language },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return articles.map((article) => {
      const translation = article.translations[0] || null;
      return {
        id: article.id,
        slug: article.slug,
        tag: article.tag,
        viewCount: article.viewCount,
        title: translation?.title ?? '',
        content: translation?.content ?? '',
        readTime: translation?.readTime ?? '',
        language: translation?.language ?? language,
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
      };
    });
  }

  async findOne(id: string, language: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        translations: {
          where: { language },
        },
      },
    });

    if (!article) {
      throw new AppException('errors.articleNotFound', 404);
    }

    // Increment view count
    await this.prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    const translation = article.translations[0] || null;
    return {
      id: article.id,
      slug: article.slug,
      tag: article.tag,
      viewCount: article.viewCount + 1, // return incremented value
      title: translation?.title ?? '',
      content: translation?.content ?? '',
      readTime: translation?.readTime ?? '',
      language: translation?.language ?? language,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  }

  async create(
    slug: string,
    tag: string,
    translations: ArticleTranslationInput[],
  ) {
    const existing = await this.prisma.article.findUnique({ where: { slug } });
    if (existing) {
      throw new AppException('errors.articleSlugExists', 400);
    }

    const article = await this.prisma.article.create({
      data: {
        slug,
        tag,
        translations: {
          create: translations,
        },
      },
      include: { translations: true },
    });

    return article;
  }

  async update(
    id: string,
    data: { slug?: string; tag?: string; translations?: ArticleTranslationInput[] },
  ) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new AppException('errors.articleNotFound', 404);
    }

    // Delete existing translations and recreate
    if (data.translations) {
      await this.prisma.articleTranslation.deleteMany({ where: { articleId: id } });
    }

    return this.prisma.article.update({
      where: { id },
      data: {
        ...(data.slug && { slug: data.slug }),
        ...(data.tag && { tag: data.tag }),
        ...(data.translations && {
          translations: {
            create: data.translations,
          },
        }),
      },
      include: { translations: true },
    });
  }

  async delete(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new AppException('errors.articleNotFound', 404);
    }

    return this.prisma.article.delete({ where: { id } });
  }
}
