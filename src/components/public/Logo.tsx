import Link from 'next/link';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export default function Logo({ className = '', showTagline = false }: LogoProps) {
  return (
    <Link href="/" className={`flex flex-col ${className}`}>
      <span className="flex flex-row items-center gap-3" dir="ltr">
        <span className="text-sm md:text-base font-semibold text-gray-700 tracking-[0.15em] uppercase whitespace-nowrap">
          Azad Khabar
        </span>
        <span className="w-6 h-[3px] bg-primary-600 inline-block flex-shrink-0 rounded-full" />
        <span className="font-nastaliq text-2xl md:text-3xl font-bold text-primary-600 leading-none">
          آزاد خبر
        </span>
      </span>
      {showTagline && (
        <span className="text-xs text-gray-500 mt-1 font-nastaliq">
          پاکستان کی معروف خبروں کی ویب سائٹ
        </span>
      )}
    </Link>
  );
}
