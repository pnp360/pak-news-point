'use client';

import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';
import { FaFacebook, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { HiLink } from 'react-icons/hi';
import toast from 'react-hot-toast';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('لنک کاپی ہو گیا');
    } catch {
      toast.error('لنک کاپی نہیں ہو سکا');
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="font-bold">شیئر کریں:</span>
      <FacebookShareButton url={url} title={title}>
        <div className="bg-blue-600 text-white p-2.5 rounded-full hover:opacity-90">
          <FaFacebook className="w-5 h-5" />
        </div>
      </FacebookShareButton>
      <TwitterShareButton url={url} title={title}>
        <div className="bg-black text-white p-2.5 rounded-full hover:opacity-90">
          <FaTwitter className="w-5 h-5" />
        </div>
      </TwitterShareButton>
      <WhatsappShareButton url={url} title={title}>
        <div className="bg-green-600 text-white p-2.5 rounded-full hover:opacity-90">
          <FaWhatsapp className="w-5 h-5" />
        </div>
      </WhatsappShareButton>
      <button
        onClick={copyLink}
        className="bg-gray-600 text-white p-2.5 rounded-full hover:opacity-90"
        title="لنک کاپی کریں"
      >
        <HiLink className="w-5 h-5" />
      </button>
    </div>
  );
}
