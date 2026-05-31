import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pnp365.com' },
    update: {},
    create: {
      name: 'ایڈمن',
      email: 'admin@pnp365.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin: admin@pnp365.com / admin123');

  const editorPassword = await bcrypt.hash('editor123', 12);
  await prisma.user.upsert({
    where: { email: 'editor@pnp365.com' },
    update: {},
    create: {
      name: 'ایڈیٹر',
      email: 'editor@pnp365.com',
      password: editorPassword,
      role: 'EDITOR',
    },
  });

  const categoryData = [
    { name: 'Pakistan', nameUrdu: 'پاکستان', slug: 'pakistan', description: 'پاکستان کی تازہ ترین خبریں', order: 1 },
    { name: 'World', nameUrdu: 'دنیا', slug: 'world', description: 'دنیا بھر کی خبریں', order: 2 },
    { name: 'Sports', nameUrdu: 'کھیل', slug: 'sports', description: 'کھیلوں کی خبریں', order: 3 },
    { name: 'Business', nameUrdu: 'کاروبار', slug: 'business', description: 'کاروبار اور معیشت کی خبریں', order: 4 },
    { name: 'Entertainment', nameUrdu: 'شوبز', slug: 'entertainment', description: 'شوبز اور تفریح کی خبریں', order: 5 },
    { name: 'Technology', nameUrdu: 'سائنس و ٹیکنالوجی', slug: 'technology', description: 'سائنس اور ٹیکنالوجی کی خبریں', order: 6 },
    { name: 'Health', nameUrdu: 'صحت', slug: 'health', description: 'صحت اور طب کی خبریں', order: 7 },
    { name: 'Education', nameUrdu: 'تعلیم', slug: 'education', description: 'تعلیم کی خبریں', order: 8 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = created.id;
  }
  console.log('✅ Categories');

  const tagData = ['سیاست', 'معیشت', 'کرکٹ', 'فٹ بال', 'فلم', 'موبائل', 'ایپس', 'وائرس', 'تعلیم', 'صحت'];
  for (const name of tagData) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }
  const tags = await prisma.tag.findMany();
  console.log('✅ Tags');

  function makeSlug(title: string): string {
    const latinSlug = slugify(title, { lower: true, strict: true });
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `${latinSlug}-${timestamp}${random}`;
  }

  async function createIfNotExists(articles: typeof sampleArticles) {
    for (const article of articles) {
      const slug = makeSlug(article.title);
      const existing = await prisma.article.findFirst({ where: { title: article.title } });
      if (existing) {
        console.log(`  ⏭ Skipped: ${article.title}`);
        continue;
      }
      const catSlug = article.categorySlug;
      await prisma.article.create({
        data: {
          title: article.title,
          slug,
          excerpt: article.excerpt,
          content: article.content,
          categoryId: categories[catSlug],
          authorId: admin.id,
          featuredImage: null,
          status: 'PUBLISHED',
          publishedAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)),
          isBreaking: article.isBreaking,
          isFeatured: article.isFeatured,
          views: Math.floor(Math.random() * 5000),
          tags: {
            create: tags.slice(0, 2).map((tag) => ({ tagId: tag.id })),
          },
        },
      });
      console.log(`  ✅ Created: ${article.title}`);
    }
  }

  const sampleArticles = [
    // Pakistan (4 articles)
    { title: 'پاکستان اور آئی ایم ایف کے درمیان معاہدہ طے پا گیا', excerpt: 'پاکستان اور آئی ایم ایف کے درمیان 7 ارب ڈالر کے قرض پروگرام پر معاہدہ طے پا گیا ہے۔', content: '<p>پاکستان اور آئی ایم ایف کے درمیان 7 ارب ڈالر کے قرض پروگرام پر معاہدہ طے پا گیا ہے۔ اس معاہدے کے تحت پاکستان کو اگلے تین سالوں میں 7 ارب ڈالر کی مالی امداد فراہم کی جائے گی۔</p><p>وزیر خزانہ نے کہا کہ یہ معاہدہ پاکستان کی معیشت کو مستحکم کرنے میں مددگار ثابت ہوگا۔</p>', categorySlug: 'pakistan', isBreaking: true, isFeatured: true },
    { title: 'وفاقی بجٹ 2026-27 پیش، تنخواہوں میں اضافہ', excerpt: 'وفاقی حکومت نے بجٹ 2026-27 قومی اسمبلی میں پیش کر دیا۔', content: '<p>وفاقی حکومت نے آئندہ مالی سال کا بجٹ 2026-27 قومی اسمبلی میں پیش کر دیا ہے۔ سرکاری ملازمین کی تنخواہوں میں 25 فیصد اضافہ تجویز کیا گیا ہے۔</p><p>بجٹ میں تعلیم اور صحت کے شعبوں کے لیے مختص رقم میں نمایاں اضافہ کیا گیا ہے۔</p>', categorySlug: 'pakistan', isBreaking: false, isFeatured: true },
    { title: 'پاکستان میں مہنگائی کی شرح میں کمی متوقع', excerpt: 'ماہرین کے مطابق آنے والے مہینوں میں مہنگائی کی شرح میں کمی متوقع ہے۔', content: '<p>ماہرین معیشت کے مطابق عالمی مارکیٹ میں تیل کی قیمتوں میں استحکام اور مقامی زرعی پیداوار میں بہتری کی وجہ سے آنے والے مہینوں میں مہنگائی کی شرح میں کمی متوقع ہے۔</p><p>اسٹیٹ بینک کے مطابق مہنگائی کی شرح رواں مالی سال کے آخر تک 8 فیصد تک رہنے کا امکان ہے۔</p>', categorySlug: 'pakistan', isBreaking: false, isFeatured: false },
    { title: 'پاک چین اقتصادی راہداری منصوبے میں تیزی', excerpt: 'سی پیک کے دوسرے مرحلے کے منصوبوں پر تیزی سے کام ہو رہا ہے۔', content: '<p>پاک چین اقتصادی راہداری (سی پیک) کے دوسرے مرحلے کے تحت مختلف منصوبوں پر تیزی سے کام جاری ہے۔ خاص طور پر صنعتی تعاون اور زراعت کے شعبوں میں نئے منصوبے شروع کیے گئے ہیں۔</p><p>چینی سرمایہ کاری سے پاکستان میں روزگار کے نئے مواقع پیدا ہوں گے۔</p>', categorySlug: 'pakistan', isBreaking: false, isFeatured: false },

    // World (3 articles)
    { title: 'فلسطین میں جنگ بندی کے لیے اقوام متحدہ کی کوششیں', excerpt: 'اقوام متحدہ فلسطین میں مستقل جنگ بندی کے لیے کوششیں تیز کر دی ہیں۔', content: '<p>اقوام متحدہ کی سیکورٹی کونسل نے فلسطین میں مستقل جنگ بندی کے لیے ایک نئی قرارداد پر غور شروع کر دیا ہے۔ امریکہ اور یورپی ممالک اس قرارداد کی حمایت کر رہے ہیں۔</p><p>اقوام متحدہ کے سیکرٹری جنرل نے دونوں فریقوں سے پرامن حل کے لیے مذاکرات کی میز پر آنے کی اپیل کی ہے۔</p>', categorySlug: 'world', isBreaking: true, isFeatured: true },
    { title: 'امریکی صدارتی انتخابات کے لیے مہم تیز', excerpt: 'امریکہ میں صدارتی انتخابات کے لیے امیدواروں کی انتخابی مہم زوروں پر ہے۔', content: '<p>امریکہ میں صدارتی انتخابات کے لیے دونوں بڑی جماعتوں کے امیدواروں نے انتخابی مہم تیز کر دی ہے۔ معیشت، امیگریشن اور صحت کے مسائل اس بار انتخابات کے اہم نکات ہیں۔</p><p>رائے شماری کے مطابق دونوں امیدواروں کے درمیان سخت مقابلہ متوقع ہے۔</p>', categorySlug: 'world', isBreaking: false, isFeatured: false },
    { title: 'یورپ میں گرمی کی لہر، درجہ حرارت ریکارڈ توڑ', excerpt: 'یورپ کے کئی ممالک میں گرمی کی شدید لہر نے ریکارڈ توڑ دیے۔', content: '<p>یورپ کے کئی ممالک میں گرمی کی شدید لہر نے درجہ حرارت کے تمام ریکارڈ توڑ دیے ہیں۔ سپین، فرانس اور اٹلی میں درجہ حرارت 45 ڈگری سینٹی گریڈ سے تجاوز کر گیا۔</p><p>حکام نے شہریوں کو احتیاطی تدابیر اختیار کرنے کی ہدایت کی ہے۔</p>', categorySlug: 'world', isBreaking: false, isFeatured: false },

    // Sports (3 articles)
    { title: 'قومی کرکٹ ٹیم کے کھلاڑیوں کا اعلان جلد', excerpt: 'قومی کرکٹ ٹیم کے آنے والے دورے کے لیے کھلاڑیوں کے انتخاب کا اعلان جلد کیا جائے گا۔', content: '<p>پاکستان کرکٹ بورڈ نے قومی ٹیم کے آنے والے بین الاقوامی دورے کے لیے کھلاڑیوں کے انتخاب کا اعلان جلد کرنے کا فیصلہ کیا ہے۔</p><p>ذرائع کے مطابق سلیکشن کمیٹی نے ممکنہ کھلاڑیوں کی فہرست تیار کر لی ہے۔</p>', categorySlug: 'sports', isBreaking: false, isFeatured: true },
    { title: 'پی ایس ایل 11 کا شیڈول جاری', excerpt: 'پاکستان سپر لیگ کے 11ویں ایڈیشن کا شیڈول جاری کر دیا گیا۔', content: '<p>پاکستان کرکٹ بورڈ نے پاکستان سپر لیگ (پی ایس ایل) کے 11ویں ایڈیشن کا شیڈول جاری کر دیا ہے۔ ٹورنامنٹ اگلے ماہ سے شروع ہوگا۔</p><p>اس بار پی ایس ایل میں 6 ٹیمیں حصہ لیں گی اور میچز پاکستان کے مختلف شہروں میں کھیلے جائیں گے۔</p>', categorySlug: 'sports', isBreaking: false, isFeatured: false },
    { title: 'پاکستان اور بھارت کرکٹ سیریز کا اعلان متوقع', excerpt: 'پاکستان اور بھارت کے درمیان محدود اوورز کی کرکٹ سیریز کا اعلان متوقع ہے۔', content: '<p>پاکستان اور بھارت کے درمیان محدود اوورز کی کرکٹ سیریز کے حوالے سے مثبت پیش رفت ہوئی ہے۔ آئی سی سی کے عہدیداروں کے مطابق دونوں ممالک کے درمیان سیریز کے امکانات روشن ہیں۔</p><p>یہ سیریز کسی غیر جانبدار مقام پر کھیلی جا سکتی ہے۔</p>', categorySlug: 'sports', isBreaking: false, isFeatured: false },

    // Business (3 articles)
    { title: 'اسٹاک مارکیٹ میں تیزی، 100 انڈیکس میں اضافہ', excerpt: 'پاکستان اسٹاک ایکسچینج میں کاروبار کے دوران تیزی دیکھنے میں آئی۔', content: '<p>پاکستان اسٹاک ایکسچینج میں آج کاروبار کے دوران زبردست تیزی دیکھنے میں آئی۔ 100 انڈیکس 500 پوائنٹس کے اضافے سے بند ہوا۔</p><p>ماہرین کے مطابق سیاسی استحکام اور معاشی بہتری کی امیدوں سے مارکیٹ میں مثبت رجحان دیکھنے میں آیا۔</p>', categorySlug: 'business', isBreaking: false, isFeatured: false },
    { title: 'روپے کی قدر میں بہتری، ڈالر سستا', excerpt: 'انٹربینک مارکیٹ میں روپے کی قدر میں بہتری آئی ہے اور ڈالر سستا ہو گیا۔', content: '<p>انٹربینک مارکیٹ میں روپے کی قدر میں بہتری آئی ہے اور امریکی ڈالر 275 روپے کی سطح پر آ گیا ہے۔ برآمدات میں اضافہ اور ترسیلات زر میں بہتری روپے کی قدر میں بہتری کی اہم وجوہات ہیں۔</p><p>ماہرین کے مطابق آنے والے دنوں میں روپے کی مزید بہتری متوقع ہے۔</p>', categorySlug: 'business', isBreaking: false, isFeatured: false },
    { title: 'پاکستان کی برآمدات میں نمایاں اضافہ', excerpt: 'رواں مالی سال کے پہلے 11 ماہ کے دوران پاکستان کی برآمدات میں نمایاں اضافہ ہوا ہے۔', content: '<p>وزارت تجارت کے اعداد و شمار کے مطابق رواں مالی سال کے پہلے 11 ماہ کے دوران پاکستان کی برآمدات میں 15 فیصد اضافہ ہوا ہے۔ ٹیکسٹائل، چاول اور کھیلوں کے سامان کی برآمدات میں خاصی بہتری آئی ہے۔</p><p>حکومت نے برآمدات بڑھانے کے لیے مختلف مراعات فراہم کی ہیں۔</p>', categorySlug: 'business', isBreaking: false, isFeatured: false },

    // Entertainment (3 articles)
    { title: 'مشہور اداکار کی نئی فلم کا اعلان', excerpt: 'بالی وڈ کے مشہور اداکار نے اپنی نئی فلم کا اعلان کر دیا۔', content: '<p>بالی وڈ کے مشہور اداکار نے اپنی نئی فلم کا اعلان کر دیا ہے۔ یہ فلم ایکشن سے بھرپور ہوگی اور اس میں کئی بڑے ستارے کام کریں گے۔</p><p>فلم کی شوٹنگ اگلے ماہ سے شروع ہوگی اور اسے رواں سال کے آخر میں ریلیز کیا جائے گا۔</p>', categorySlug: 'entertainment', isBreaking: false, isFeatured: false },
    { title: 'پاکستانی ڈرامہ سیریل نے بھارت میں بھی مقبولیت حاصل کر لی', excerpt: 'پاکستانی ڈرامہ سیریل کو بھارتی ناظرین کی طرف سے زبردست پذیرائی مل رہی ہے۔', content: '<p>ایک پاکستانی ڈرامہ سیریل نے بھارت میں بھی مقبولیت حاصل کر لی ہے۔ اس ڈرامے کو بھارتی پلیٹ فارمز پر لاکھوں ملاحظات مل چکے ہیں۔</p><p>ڈرامے کی کہانی اور اداکاری کو بھارتی ناقدین نے بھی سراہا ہے۔</p>', categorySlug: 'entertainment', isBreaking: false, isFeatured: false },
    { title: 'لوک میوزک فیسٹیول کا انعقاد، فنکاروں کی شرکت', excerpt: 'اسلام آباد میں دو روزہ لوک میوزک فیسٹیول کا انعقاد کیا گیا۔', content: '<p>اسلام آباد میں دو روزہ لوک میوزک فیسٹیول کا انعقاد کیا گیا جس میں ملک بھر سے معروف لوک گلوکاروں نے شرکت کی۔</p><p>فیسٹیول میں مختلف علاقائی موسیقی کی محفلیں سجائی گئیں اور بڑی تعداد میں شائقین نے شرکت کی۔</p>', categorySlug: 'entertainment', isBreaking: false, isFeatured: false },

    // Technology (3 articles)
    { title: 'نیا سمارٹ فون متعارف، کیمرہ میں انقلابی تبدیلی', excerpt: 'ایک معروف کمپنی نے اپنا نیا فلیگ شپ سمارٹ فون متعارف کرا دیا۔', content: '<p>ایک معروف ٹیکنالوجی کمپنی نے اپنا نیا فلیگ شپ سمارٹ فون متعارف کرا دیا ہے۔ اس فون میں کیمرہ ٹیکنالوجی میں انقلابی تبدیلیاں کی گئی ہیں۔</p><p>اس فون میں 200 میگا پکسل کا مین کیمرہ، جدید پروسیسر اور طویل بیٹری بیک اپ دیا گیا ہے۔</p>', categorySlug: 'technology', isBreaking: false, isFeatured: false },
    { title: 'مصنوعی ذہانت سے صحت کے شعبے میں انقلاب', excerpt: 'مصنوعی ذہانت کے استعمال سے صحت کے شعبے میں تشخیص اور علاج میں انقلاب آ رہا ہے۔', content: '<p>مصنوعی ذہانت (AI) کے استعمال سے صحت کے شعبے میں تشخیص اور علاج کے طریقوں میں انقلاب آ رہا ہے۔ اے آی الگورتھم بیماریوں کی تشخیص میں ڈاکٹروں کی مدد کر رہے ہیں۔</p><p>پاکستان میں بھی کئی ہسپتالوں میں اے آی پر مبنی نظام متعارف کرا دیے گئے ہیں۔</p>', categorySlug: 'technology', isBreaking: false, isFeatured: false },
    { title: 'پاکستان میں 5G سروس کے اجراء کی تیاریاں', excerpt: 'پاکستان میں 5G موبائل سروس کے اجراء کے لیے تیاریاں تیز کر دی گئی ہیں۔', content: '<p>پاکستان ٹیلی کمیونیکیشن اتھارٹی (پی ٹی اے) نے 5G موبائل سروس کے اجراء کے لیے تیاریاں تیز کر دی ہیں۔ اسپیکٹرم کی نیلامی کا عمل جلد شروع ہوگا۔</p><p>5G سروس سے انٹرنیٹ کی رفتار میں نمایاں اضافہ ہوگا اور نئے کاروباری مواقع پیدا ہوں گے۔</p>', categorySlug: 'technology', isBreaking: false, isFeatured: false },

    // Health (3 articles)
    { title: 'صحت کی سہولتوں میں بہتری کے لیے منصوبہ تیار', excerpt: 'حکومت نے صحت کی سہولتوں میں بہتری کے لیے ایک جامع منصوبہ تیار کیا ہے۔', content: '<p>حکومت نے صحت کی سہولتوں میں بہتری کے لیے ایک جامع منصوبہ تیار کیا ہے۔ اس منصوبے کے تحت دیہی علاقوں میں نئے ہسپتال قائم کیے جائیں گے۔</p><p>اس منصوبے پر 50 ارب روپے لاگت آئے گی۔</p>', categorySlug: 'health', isBreaking: false, isFeatured: false },
    { title: 'ڈینگی بخار سے بچاؤ کے لیے احتیاطی تدابیر', excerpt: 'محکمہ صحت نے ڈینگی بخار سے بچاؤ کے لیے احتیاطی تدابیر جاری کر دی ہیں۔', content: '<p>محکمہ صحت نے موسم بارش میں ڈینگی بخار سے بچاؤ کے لیے احتیاطی تدابیر جاری کر دی ہیں۔ شہریوں کو مشورہ دیا گیا ہے کہ وہ گھروں کے ارد گرد پانی جمع نہ ہونے دیں۔</p><p>مچھروں سے بچاؤ کے لیے اسپرے اور دیگر اقدامات کیے جا رہے ہیں۔</p>', categorySlug: 'health', isBreaking: false, isFeatured: false },
    { title: 'پاکستان میں پولیو کے خلاف قطرہ مہم کا آغاز', excerpt: 'پاکستان میں پولیو کے خلاف قطرہ مہم کا آغاز کر دیا گیا ہے۔', content: '<p>پاکستان میں پولیو کے خلاف قطرہ مہم کا آغاز کر دیا گیا ہے۔ اس مہم کے تحت پانچ سال سے کم عمر کے لاکھوں بچوں کو پولیو سے بچاؤ کے قطرے پلائے جائیں گے۔</p><p>محکمہ صحت نے والدین سے اپیل کی ہے کہ وہ اپنے بچوں کو پولیو کے قطرے ضرور پلائیں۔</p>', categorySlug: 'health', isBreaking: false, isFeatured: false },

    // Education (3 articles)
    { title: 'تعلیمی اداروں میں سالانہ امتحانات کا آغاز', excerpt: 'ملک بھر کے تعلیمی اداروں میں سالانہ امتحانات کا آغاز ہو گیا ہے۔', content: '<p>ملک بھر کے تعلیمی اداروں میں سالانہ امتحانات کا آغاز ہو گیا ہے۔ تعلیمی بورڈز نے امتحانات کا شیڈول جاری کر دیا ہے۔</p><p>امتحانات مئی کے آخر تک جاری رہیں گے اور اس کے بعد گرمیوں کی چھٹیاں شروع ہوں گی۔</p>', categorySlug: 'education', isBreaking: false, isFeatured: false },
    { title: 'نئے تعلیمی نصاب کا اعلان، عملی زندگی پر توجہ', excerpt: 'حکومت نے نئے تعلیمی نصاب کا اعلان کر دیا ہے جس میں عملی زندگی پر توجہ دی گئی ہے۔', content: '<p>حکومت نے نئے تعلیمی نصاب کا اعلان کر دیا ہے جس میں طلبہ کو عملی زندگی کے لیے تیار کرنے پر زور دیا گیا ہے۔ نئے نصاب میں ٹیکنالوجی اور کاروبار سے متعلق مضامین شامل کیے گئے ہیں۔</p><p>نئے نصاب کا اطلاق اگلے تعلیمی سال سے ہوگا۔</p>', categorySlug: 'education', isBreaking: false, isFeatured: false },
    { title: 'طلبہ کے لیے نئے اسکالرشپ پروگرام کا اعلان', excerpt: 'حکومت نے تعلیم کے حصول کے لیے نئے اسکالرشپ پروگرام کا اعلان کیا ہے۔', content: '<p>حکومت نے تعلیم کے حصول کے لیے نئے اسکالرشپ پروگرام کا اعلان کیا ہے۔ اس پروگرام کے تحت مستحق اور ہونہار طلبہ کو اعلیٰ تعلیم کے لیے مالی امداد فراہم کی جائے گی۔</p><p>اسکالرشپ پروگرام کا مقصد تعلیمی شرح میں اضافہ کرنا ہے۔</p>', categorySlug: 'education', isBreaking: false, isFeatured: false },
  ];

  console.log('📰 Creating articles...');
  await createIfNotExists(sampleArticles);

  const allArticles = await prisma.article.count();
  console.log(`\n✅ Total articles in DB: ${allArticles}`);

  const defaultSettings = [
    { key: 'daily_news_limit', value: '100' },
    { key: 'site_name', value: 'Azad Khabar' },
    { key: 'site_description', value: 'پاکستان کی تازہ ترین خبریں، بریکنگ نیوز، کھیل، کاروبار، شوبز، سائنس و ٹیکنالوجی' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('✅ Settings');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
