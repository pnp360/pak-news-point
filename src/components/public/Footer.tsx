import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Logo showTagline />
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">اہم زمرے</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pakistan" className="hover:text-white">پاکستان</Link></li>
              <li><Link href="/world" className="hover:text-white">دنیا</Link></li>
              <li><Link href="/sports" className="hover:text-white">کھیل</Link></li>
              <li><Link href="/business" className="hover:text-white">کاروبار</Link></li>
              <li><Link href="/technology" className="hover:text-white">سائنس و ٹیکنالوجی</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">معلومات</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">ہمارے بارے میں</Link></li>
              <li><Link href="/contact" className="hover:text-white">رابطہ</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white">پرائیویسی پالیسی</Link></li>
              <li><Link href="/terms" className="hover:text-white">شرائط و ضوابط</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">نیوز لیٹر</h4>
            <p className="text-sm mb-3">تازہ ترین خبریں اپنی ای میل پر حاصل کریں</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="آپ کا ای میل"
                className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:border-primary-500"
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700"
              >
                سبسکرائب
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Azad Khabar - جملہ حقوق محفوظ ہیں</p>
        </div>
      </div>
    </footer>
  );
}
