import { connectDB } from '@/lib/db';
import { Log } from '@/models/Log';

export async function POST(req: Request) {
  await connectDB();

  try {
    // Log raw request body for debugging
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      const errorMessage = parseError instanceof Error ? parseError.message : 'Failed to parse JSON';
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON format',
        details: errorMessage 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const {
      requestId,
      applianceId,
      sessionId,
      deviceUDID,
      homeId,
      prompt,
      response,
      skuNumber,
      responseTime,
      timestamp,
    } = body;

    if (!requestId) {
      return new Response(JSON.stringify({ error: 'Request ID is required' }), { status: 400 });
    }

    try {
      // Try to find existing log
      let log = await Log.findOne({ requestId });

      if (log) {
        // Update existing log
        if (response !== undefined) log.response = response;
        if (prompt !== undefined) log.prompt = prompt;
        if (applianceId !== undefined) log.applianceId = applianceId;
        if (sessionId !== undefined) log.sessionId = sessionId;
        if (deviceUDID !== undefined) log.deviceUDID = deviceUDID;
        if (homeId !== undefined) log.homeId = homeId;
        if (skuNumber !== undefined) log.skuNumber = skuNumber;
        if (responseTime !== undefined) log.responseTime = responseTime;
        if (timestamp !== undefined) log.timestamp = timestamp;
      } else {
        // Create new log
        if (!prompt) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Prompt is required for new logs' 
          }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        log = new Log({
          requestId,
          applianceId: applianceId || '',
          sessionId: sessionId || '',
          deviceUDID: deviceUDID || '',
          homeId: homeId || '',
          prompt,
          response: response || '',
          skuNumber: skuNumber || '',
          responseTime: responseTime || 0,
          timestamp: timestamp || new Date()
        });
      }

      await log.save();

      return new Response(JSON.stringify({ 
        success: true, 
        data: log 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to save log',
        details: errorMessage
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error saving log:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to save log' 
    }), { status: 500 });
  }
}
