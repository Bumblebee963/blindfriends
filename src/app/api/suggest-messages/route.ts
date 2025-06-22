// app/api/suggest-messages/route.ts
import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST() {
  if (!process.env.GROQ_API_KEY) {
    console.error('[SUGGEST] MISSING GROQ_API_KEY');
    return NextResponse.json(
      { message: 'Server misconfigured: missing GROQ_API_KEY.' },
      { status: 500 }
    );
  }

  try {
    const timeOfDay = new Date().getHours();
    const mood =
      timeOfDay < 12
        ? 'morning'
        : timeOfDay < 18
        ? 'afternoon'
        : 'evening';

    const { text } = await generateText({
      model: groq('gemma2-9b-it'),
      temperature: 0.9,
      prompt: `It's a pleasant ${mood}. Generate a list of three friendly, wholesome, and anonymous comments (not questions). Each comment should be separated by '||'. These comments will be posted anonymously on a public profile on a messaging platform like Qooh.me. Avoid personal, controversial, or offensive content. Keep them positive, uplifting, and suitable for a wide audience.`,
    });

    console.log('[SUGGEST] Generated:', text);
    return NextResponse.json({ suggestions: text });
  } catch (err) {
    console.error('[SUGGEST] generateText error', err);
    return NextResponse.json(
      { message: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
