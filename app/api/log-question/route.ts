
import { connectDB } from '@/lib/db';
import { Log } from '@/models/Log';

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const {
    question,
    userId = 'anonymous',
    sessionId = 'default',
    timestamp = new Date().toISOString(),
  } = body;

  if (!question) {
    return new Response(JSON.stringify({ error: 'Question is required' }), { status: 400 });
  }

  const log = new Log({
    id: Date.now().toString(),
    question,
    userId,
    sessionId,
    timestamp,
    status: 'pending',
  });

  await log.save();

  return new Response(JSON.stringify({ success: true, questionId: log.id }), { status: 200 });
}
