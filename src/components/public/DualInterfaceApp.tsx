'use client';

export default function DualInterfaceApp() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-serif">
      <header className="border-b border-gray-800 bg-gray-900 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold tracking-wider text-red-500">آزاد خبر</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6">
        <p className="text-gray-400">خبریں لوڈ ہو رہی ہیں...</p>
      </main>
    </div>
  );
}
