'use client';

import { useEffect } from 'react';

const THIRTY_MINUTES = 30 * 60 * 1000;

export default function AutoFetchTrigger() {
  useEffect(() => {
    fetch('/api/trigger-fetch').catch(() => {});
    const id = setInterval(() => {
      fetch('/api/trigger-fetch').catch(() => {});
    }, THIRTY_MINUTES);
    return () => clearInterval(id);
  }, []);

  return null;
}
