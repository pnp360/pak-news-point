'use client';

import { useEffect } from 'react';

const FOUR_MINUTES = 4 * 60 * 1000;

export default function AutoFetchTrigger() {
  useEffect(() => {
    fetch('/api/trigger-fetch').catch(() => {});
    const ping = () => fetch('/api/keep-alive').catch(() => {});
    ping();
    const id = setInterval(ping, FOUR_MINUTES);
    return () => clearInterval(id);
  }, []);

  return null;
}
