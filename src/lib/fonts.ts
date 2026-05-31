import localFont from 'next/font/local';

export const notoNastaliq = localFont({
  src: [
    {
      path: '../../public/fonts/NotoNastaliqUrdu-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/NotoNastaliqUrdu-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-nastaliq',
  display: 'swap',
});
