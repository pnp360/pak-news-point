export const metadata = {
  title: 'رازداری کی پالیسی',
  description: 'آزاد خبر کی رازداری کی پالیسی',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-6">رازداری کی پالیسی</h1>
        <div className="space-y-4 leading-loose">
          <p>
            آزاد خبر آپ کی رازداری کا احترام کرتا ہے۔ یہ پالیسی
            بتاتی ہے کہ ہم آپ کی ذاتی معلومات کیسے جمع، استعمال اور محفوظ کرتے
            ہیں۔
          </p>
          <h2 className="text-xl font-bold mt-6">معلومات کا جمع کرنا</h2>
          <p>
            ہم آپ کی ذاتی معلومات صرف اس وقت جمع کرتے ہیں جب آپ ہم سے رابطہ
            کرتے ہیں یا ہمارے خبرنامے کے لیے رجسٹر ہوتے ہیں۔
          </p>
          <h2 className="text-xl font-bold mt-6">معلومات کا استعمال</h2>
          <p>
            آپ کی معلومات صرف آپ سے رابطہ کرنے اور آپ کو خدمات فراہم کرنے کے
            لیے استعمال کی جاتی ہیں۔
          </p>
          <h2 className="text-xl font-bold mt-6">ککیز</h2>
          <p>
            ہم اپنی ویب سائٹ کو بہتر بنانے کے لیے ککیز استعمال کر سکتے ہیں۔
            آپ اپنے براؤزر کی ترتیبات سے ککیز کو کنٹرول کر سکتے ہیں۔
          </p>
          <h2 className="text-xl font-bold mt-6">رابطہ</h2>
          <p>
            اگر آپ کو اس پالیسی کے بارے میں کوئی سوال ہے تو براہ کرم ہم سے
            رابطہ کریں۔
          </p>
        </div>
      </div>
    </div>
  );
}
