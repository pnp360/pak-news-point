interface LangTextProps {
  ur: string;
  className?: string;
}

export default function LangText({ ur, className }: LangTextProps) {
  return <span className={className}>{ur}</span>;
}
