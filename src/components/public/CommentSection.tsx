'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Reply {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies: Reply[];
}

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?articleId=${articleId}`)
      .then(r => r.json())
      .then(setComments)
      .catch(() => {});
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error('براہ کرم اپنا نام اور تبصرہ درج کریں');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          authorName: name.trim(),
          authorEmail: email.trim() || null,
          content: content.trim(),
          parentId: replyTo,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('آپ کا تبصرہ منظور ہونے کے بعد شائع کر دیا جائے گا');
      setContent('');
      setReplyTo(null);
    } catch {
      toast.error('تبصرہ جمع نہیں ہو سکا۔ براہ کرم دوبارہ کوشش کریں');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10 pt-6 border-t border-gray-200">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        تبصرے
        <span className="text-sm font-normal text-gray-400">({comments.length})</span>
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="آپ کا نام *"
            required
            maxLength={50}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ای میل (اختیاری)"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="اپنا تبصرہ لکھیں..."
          required
          maxLength={2000}
          rows={4}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm mb-3"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
          >
            {submitting ? 'جمع ہو رہا ہے...' : 'تبصرہ جمع کریں'}
          </button>
          {replyTo && (
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              جواب منسوخ کریں
            </button>
          )}
        </div>
      </form>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-gray-400 text-center py-8">کوئی تبصرہ نہیں۔ پہلا تبصرہ کریں!</p>
      ) : (
        <div className="space-y-5">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={setReplyTo}
              replyTo={replyTo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  onReply,
  replyTo,
}: {
  comment: Comment;
  onReply: (id: string | null) => void;
  replyTo: string | null;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">
          {comment.authorName.charAt(0)}
        </span>
        <span className="font-semibold text-sm">{comment.authorName}</span>
        <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
      </div>
      <p className="text-gray-700 leading-[2.25] mb-2">{comment.content}</p>
      <button
        onClick={() => onReply(replyTo === comment.id ? null : comment.id)}
        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
      >
        جواب دیں
      </button>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="mr-6 mt-3 space-y-3 border-r-2 border-gray-100 pr-4">
          {comment.replies.map(reply => (
            <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">
                  {reply.authorName.charAt(0)}
                </span>
                <span className="font-semibold text-xs">{reply.authorName}</span>
                <span className="text-xs text-gray-400">{timeAgo(reply.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ابھی';
  if (mins < 60) return `${mins} منٹ پہلے`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} گھنٹے پہلے`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} دن پہلے`;
  return new Date(date).toLocaleDateString('ur-PK');
}
