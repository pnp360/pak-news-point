import Link from 'next/link';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export default function Logo({ className = '', showTagline = false }: LogoProps) {
  return (
    <Link href="/" className={`flex flex-col items-start ${className}`}>
      <span className="font-nastaliq text-3xl md:text-4xl font-bold text-primary-600 leading-tight">
        آزاد خبر
      </span>
      <span className="flex items-center gap-2 mt-0.5">
        <span className="w-6 h-0.5 bg-primary-600 inline-block flex-shrink-0" />
        <span className="text-xs md:text-sm font-semibold text-gray-600 tracking-[0.15em] uppercase">
          Azad Khabar
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
