export const maxDuration = 120;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { runPipeline, shouldRunPipeline } from '@/lib/news-pipeline';

export async function GET() {
  try {
    const canRun = await shouldRunPipeline();
    if (!canRun) {
      return NextResponse.json({ triggered: false, message: 'Pipeline already ran recently.' });
    }

    const result = await runPipeline();
    return NextResponse.json({ triggered: true, ...result });
  } catch (error) {
    return NextResponse.json({ triggered: false, error: String(error) }, { status: 500 });
  }
}
