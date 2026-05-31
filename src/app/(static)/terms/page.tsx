export const metadata = {
  title: 'شرائط و ضوابط',
  description: 'پاکستان نیوز پوائنٹ کے شرائط و ضوابط',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-6">شرائط و ضوابط</h1>
        <div className="space-y-4 leading-loose">
          <p>
            پاکستان نیوز پوائنٹ استعمال کرنے سے پہلے براہ کرم ان شرائط کو
            غور سے پڑھیں۔
          </p>
          <h2 className="text-xl font-bold mt-6">مواد کا استعمال</h2>
          <p>
            اس ویب سائٹ پر شائع تمام مواد پاکستان نیوز پوائنٹ کی ملکیت ہے۔
            بغیر اجازت کسی بھی مواد کو دوبارہ شائع کرنا منع ہے۔
          </p>
          <h2 className="text-xl font-bold mt-6">ذمہ داری</h2>
          <p>
            ہم معلومات کی درستگی کے لیے کوشش کرتے ہیں لیکن کسی بھی قسم کی
            غلطی یا نقصان کے ذمہ دار نہیں ہوں گے۔
          </p>
          <h2 className="text-xl font-bold mt-6">تبدیلیاں</h2>
          <p>
            ہم کسی بھی وقت ان شرائط میں تبدیلی کا حق محفوظ رکھتے ہیں۔
          </p>
        </div>
      </div>
    </div>
  );
}
