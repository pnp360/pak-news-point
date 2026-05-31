'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [dailyLimit, setDailyLimit] = useState('100');
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    const data = await res.json();
    setSettings(data);
    setDailyLimit(data.daily_news_limit || '100');
    setSiteName(data.site_name || 'PNP365');
    setSiteDescription(data.site_description || '');
  };

  const saveSetting = async (key: string, value: string) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting('daily_news_limit', dailyLimit),
        saveSetting('site_name', siteName),
        saveSetting('site_description', siteDescription),
      ]);
      toast.success('سیٹنگز محفوظ ہو گئیں');
    } catch {
      toast.error('کچھ غلط ہو گیا');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">سیٹنگز</h1>

      <div className="max-w-xl bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block font-medium mb-1">سائٹ کا نام</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">سائٹ کی تفصیل</label>
          <textarea
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">یومیہ خبروں کی حد (Daily News Limit)</label>
          <input
            type="number"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            min={1}
            max={1000}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            فی دن زیادہ سے زیادہ شائع ہونے والی خبروں کی تعداد
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'محفوظ ہو رہا ہے...' : 'سیٹنگز محفوظ کریں'}
        </button>
      </div>
    </div>
  );
}
