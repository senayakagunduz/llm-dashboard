import { connectDB } from '@/lib/db';
import { Log } from '@/models/Log';

export async function POST(req: Request) {
  await connectDB();

  try {
    const body = await req.json();

    const {
      requestId,
      applianceId,
      sessionId,
      deviceUDID,
      homeId,
      prompt,
      response,
      skuNumber
    } = body;

    if (!requestId) {
      return new Response(JSON.stringify({ error: 'Request ID is required' }), { status: 400 });
    }

    // Try to find existing log
    let log = await Log.findOne({ requestId });

    if (log) {
      // Update existing log
      if (response) log.response = response;
      if (prompt) log.prompt = prompt;
      if (applianceId) log.applianceId = applianceId;
      if (sessionId) log.sessionId = sessionId;
      if (deviceUDID) log.deviceUDID = deviceUDID;
      if (homeId) log.homeId = homeId;
      if (skuNumber) log.skuNumber = skuNumber;
    } else {
      // Create new log
      if (!prompt) {
        return new Response(JSON.stringify({ error: 'Prompt is required for new logs' }), { status: 400 });
      }
      
      log = new Log({
        requestId,
        applianceId,
        sessionId,
        deviceUDID,
        homeId,
        prompt,
        response: response || '',
        skuNumber,
        timestamp: new Date()
      });
    }

    await log.save();

    return new Response(JSON.stringify({ 
      success: true, 
      log: {
        requestId: log.requestId,
        prompt: log.prompt,
        response: log.response,
        timestamp: log.timestamp
      }
    }), { status: 200 });

  } catch (error) {
    console.error('Error saving log:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to save log' 
    }), { status: 500 });
  }
}
