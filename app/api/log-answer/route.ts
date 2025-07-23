import { connectDB } from '@/lib/db';
import { Log } from '@/models/Log';

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const {
    questionId,
    answer,
    responseTime,
    model,
    tokensUsed,
    error,
  } = body;

  if (!questionId || !answer) {
    return new Response(JSON.stringify({ error: 'Question ID and answer are required' }), { status: 400 });
  }

  const log = await Log.findOne({ id: questionId });

  if (!log) {
    return new Response(JSON.stringify({ error: 'Log not found' }), { status: 404 });
  }

  log.answer = answer;
  log.responseTime = responseTime || 0;
  log.model = model || 'unknown';
  log.tokensUsed = tokensUsed || 0;
  log.error = error || null;
  log.status = error ? 'error' : 'completed';
  log.completedAt = new Date().toISOString();

  await log.save();

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
