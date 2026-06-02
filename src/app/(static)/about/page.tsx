export const metadata = {
  title: 'ہمارے بارے میں',
  description: 'آزاد خبر کے بارے میں معلومات',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-6">ہمارے بارے میں</h1>
        <div className="prose prose-lg leading-loose space-y-4">
          <p>
            آزاد خبر ایک معروف اردو خبروں کی ویب سائٹ ہے جو پاکستان
            بھر سے تازہ ترین خبریں فراہم کرتی ہے۔
          </p>
          <p>
            ہمارا مشن عوام کو درست، غیر جانبدارانہ اور بروقت خبریں فراہم کرنا ہے۔
            ہم پاکستان، دنیا، کھیل، کاروبار، شوبز، سائنس و ٹیکنالوجی، صحت اور
            تعلیم سمیت مختلف شعبوں کی خبریں شائع کرتے ہیں۔
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">ہمارا وژن</h2>
          <p>
            پاکستان کی سب سے بھروسہ مند اردو نیوز ویب سائٹ بننا اور عوام کو
            اعلیٰ معیار کی صحافت فراہم کرنا۔
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">ہماری ٹیم</h2>
          <p>
            ہماری ٹیم پیشہ ور صحافیوں، ایڈیٹرز اور تخلیق کاروں پر مشتمل ہے جو
            دن رات عوام کو بہترین خبریں فراہم کرنے کے لیے کام کرتے ہیں۔
          </p>
        </div>
      </div>
    </div>
  );
}
