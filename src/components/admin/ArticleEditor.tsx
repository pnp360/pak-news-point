'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import toast from 'react-hot-toast';

interface ArticleData {
  id?: string;
  title?: string;
  excerpt?: string | null;
  content?: string;
  categoryId?: string;
  featuredImage?: string | null;
  status?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  tags?: { tag: { id: string; name: string } }[];
}

interface Props {
  article?: ArticleData;
}

export default function ArticleEditor({ article }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [categoryId, setCategoryId] = useState(article?.categoryId || '');
  const [categories, setCategories] = useState<{ id: string; nameUrdu: string; slug: string }[]>([]);
  const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    article?.tags?.map((t) => t.tag.id) || []
  );
  const [featuredImage, setFeaturedImage] = useState(article?.featuredImage || '');
  const [isBreaking, setIsBreaking] = useState(article?.isBreaking || false);
  const [isFeatured, setIsFeatured] = useState(article?.isFeatured || false);
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ canPublish: boolean; currentCount: number; limit: number; message: string } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'right',
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'خبر کا مواد یہاں لکھیں...',
      }),
    ],
    content: article?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px]',
        dir: 'rtl',
        lang: 'ur',
      },
    },
  });

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories);
    fetch('/api/tags').then((r) => r.json()).then(setAllTags);
    fetchDailyLimit();
  }, []);

  const fetchDailyLimit = async () => {
    try {
      const res = await fetch('/api/daily-limit');
      const data = await res.json();
      setLimitInfo(data);
    } catch {}
  };

  const insertImage = useCallback(() => {
    const url = prompt('تصویر کا URL درج کریں:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleSave = async (publishStatus: string) => {
    if (!title.trim()) {
      toast.error('عنوان درج کریں');
      return;
    }
    if (!categoryId) {
      toast.error('زمرہ منتخب کریں');
      return;
    }
    if (!editor?.getHTML() || editor.getHTML() === '<p></p>') {
      toast.error('مواد درج کریں');
      return;
    }

    if (publishStatus === 'PUBLISHED' && limitInfo && !limitInfo.canPublish) {
      toast.error(limitInfo.message);
      return;
    }

    setSaving(true);

    try {
      const method = article?.id ? 'PUT' : 'POST';
      const url = article?.id ? `/api/news/${article.id}` : '/api/news';

      const body = {
        title,
        excerpt: excerpt || null,
        content: editor.getHTML(),
        categoryId,
        featuredImage: featuredImage || null,
        status: publishStatus,
        isBreaking,
        isFeatured,
        tags: selectedTags,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.limitInfo) {
          setLimitInfo(data.limitInfo);
          toast.error(data.error || data.limitInfo.message);
        } else {
          toast.error(data.error || 'کچھ غلط ہو گیا');
        }
        return;
      }

      toast.success(publishStatus === 'PUBLISHED' ? 'خبر شائع ہو گئی' : 'خبر محفوظ ہو گئی');
      router.push('/admin/news');
      router.refresh();
    } catch {
      toast.error('کچھ غلط ہو گیا');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setFeaturedImage(data.url);
        toast.success('تصویر اپ لوڈ ہو گئی');
      } else {
        toast.error('تصویر اپ لوڈ نہیں ہو سکی');
      }
    } catch {
      toast.error('تصویر اپ لوڈ نہیں ہو سکی');
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleAiRewrite = async () => {
    if (!title.trim() || !editor?.getHTML() || editor.getHTML() === '<p></p>') {
      toast.error('عنوان اور مواد درج کریں');
      return;
    }

    setAiBusy(true);
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: editor.getHTML(),
          articleId: article?.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'AI ری رائٹ ناکام');
        return;
      }

      const data = await res.json();
      setTitle(data.title);
      setExcerpt(data.excerpt || '');
      editor.commands.setContent(data.content);
      toast.success('خبر AI سے دوبارہ تحریر ہو گئی');
    } catch {
      toast.error('AI ری رائٹ ناکام');
    } finally {
      setAiBusy(false);
    }
  };

  const handleAutoImage = async () => {
    if (!title.trim()) {
      toast.error('عنوان درج کریں');
      return;
    }

    setImageBusy(true);
    try {
      const catName = categories.find((c) => c.id === categoryId)?.nameUrdu || '';
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: editor?.getHTML() || '',
          category: catName,
        }),
      });

      if (!res.ok) throw new Error('Image fetch failed');

      const data = await res.json();
      if (data.image) {
        setFeaturedImage(data.image);
        toast.success('متعلقہ تصویر مل گئی');
      } else {
        toast.error('کوئی تصویر نہیں مل سکی');
      }
    } catch {
      toast.error('تصویر حاصل کرنے میں ناکام');
    } finally {
      setImageBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily limit warning */}
      {limitInfo && !limitInfo.canPublish && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {limitInfo.message}
        </div>
      )}

      {/* Limit info bar */}
      {limitInfo && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm">
          آج {limitInfo.currentCount} / {limitInfo.limit} خبریں شائع
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block font-medium mb-1">عنوان</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
          placeholder="خبر کا عنوان"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block font-medium mb-1">خلاصہ</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="خبر کا مختصر خلاصہ (اختیاری)"
        />
      </div>

      {/* Category and Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">زمرہ</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">زمرہ منتخب کریں</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nameUrdu}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">نمائشی تصویر</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="تصویر کا URL"
            />
            <label className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer">
              اپ لوڈ
              <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
            </label>
            <button
              onClick={handleAutoImage}
              disabled={imageBusy}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              title="AI سے متعلقہ تصویر حاصل کریں"
            >
              {imageBusy ? '...' : 'AI تصویر'}
            </button>
          </div>
          {featuredImage && (
            <img src={featuredImage} alt="" className="mt-2 h-32 w-auto rounded object-cover" />
          )}
        </div>
      </div>

      {/* Content Editor */}
      <div>
        <label className="block font-medium mb-1">مواد</label>
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
              title="بولڈ"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
              title="اٹالک"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('underline') ? 'bg-gray-200' : ''}`}
              title="انڈر لائن"
            >
              <u>U</u>
            </button>
            <span className="w-px bg-gray-300 mx-1" />
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
            >
              H2
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
            >
              H3
            </button>
            <span className="w-px bg-gray-300 mx-1" />
            <button
              onClick={() => editor?.chain().focus().setTextAlign('right').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
            >
              دائیں
            </button>
            <button
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
            >
              مرکز
            </button>
            <button
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
            >
              بائیں
            </button>
            <span className="w-px bg-gray-300 mx-1" />
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
            >
              فہرست
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('orderedList') ? 'bg-gray-200' : ''}`}
            >
              نمبر فہرست
            </button>
            <span className="w-px bg-gray-300 mx-1" />
            <button
              onClick={insertImage}
              className="p-2 rounded hover:bg-gray-200"
              title="تصویر شامل کریں"
            >
              🖼
            </button>
            <button
              onClick={() => {
                const url = prompt('لنک کا URL درج کریں:');
                if (url) {
                  editor?.chain().focus().setLink({ href: url }).run();
                }
              }}
              className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('link') ? 'bg-gray-200' : ''}`}
              title="لنک"
            >
              🔗
            </button>
          </div>

          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block font-medium mb-1">ٹیگز</label>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                selectedTags.includes(tag.id)
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isBreaking}
            onChange={(e) => setIsBreaking(e.target.checked)}
            className="w-4 h-4"
          />
          بریکنگ نیوز
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4"
          />
          نمایاں خبر
        </label>
      </div>

      {/* AI Rewrite */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-purple-800">AI ری رائٹر</h4>
            <p className="text-sm text-gray-600">AI کی مدد سے خبر کو پیشہ ورانہ انداز میں دوبارہ تحریر کریں</p>
          </div>
          <button
            onClick={handleAiRewrite}
            disabled={aiBusy}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            {aiBusy ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                تحریر ہو رہا ہے...
              </>
            ) : (
              'AI سے دوبارہ لکھیں'
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        <button
          onClick={() => handleSave('PUBLISHED')}
          disabled={saving || (limitInfo ? !limitInfo.canPublish : false)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'محفوظ ہو رہا ہے...' : 'شائع کریں'}
        </button>
        <button
          onClick={() => handleSave('DRAFT')}
          disabled={saving}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          ڈرافٹ میں محفوظ کریں
        </button>
        <button
          onClick={() => handleSave('SCHEDULED')}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          شیڈول کریں
        </button>
      </div>
    </div>
  );
}
