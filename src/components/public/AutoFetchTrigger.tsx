'use client';

import { useEffect } from 'react';

export default function AutoFetchTrigger() {
  useEffect(() => {
    fetch('/api/trigger-fetch').catch(() => {});
  }, []);

  return null;
}
