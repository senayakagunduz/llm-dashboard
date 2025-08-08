//app/api/logs/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Log } from '@/models/Log';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url || 'http://localhost');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const isExport = url.searchParams.get('export') === 'true';
    
    // Filter parameters
    const applianceId = url.searchParams.get('applianceId');
    const deviceUDID = url.searchParams.get('deviceUDID');
    const homeId = url.searchParams.get('homeId');
    const skuNumber = url.searchParams.get('skuNumber');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const sessionId = url.searchParams.get('sessionId');  
    const requestId = url.searchParams.get('requestId'); 
    const promptSearch = url.searchParams.get('promptSearch'); 
    const responseSearch = url.searchParams.get('responseSearch'); 
    const status = url.searchParams.get('status');   
    const minResponseTime = url.searchParams.get('minResponseTime'); 
    const maxResponseTime = url.searchParams.get('maxResponseTime');

    await connectDB();

    // Build query
    const query: any = {};
    
    // Text-based exact matches
    if (applianceId) query.applianceId = applianceId;
    if (deviceUDID) query.deviceUDID = deviceUDID;
    if (homeId) query.homeId = homeId;
    if (skuNumber) query.skuNumber = skuNumber;
    if (sessionId) query.sessionId = sessionId;
    if (requestId) query.requestId = requestId;
    if (status) query.status = status;

    // Text search with regex (case insensitive)
    if (promptSearch) {
      query.prompt = { $regex: promptSearch, $options: 'i' };
    }
    if (responseSearch) {
      query.response = { $regex: responseSearch, $options: 'i' };
    }

    // Numeric range filtering for response time
    if (minResponseTime || maxResponseTime) {
      query.responseTime = {};
      if (minResponseTime) {
        query.responseTime.$gte = parseInt(minResponseTime);
      }
      if (maxResponseTime) {
        query.responseTime.$lte = parseInt(maxResponseTime);
      }
    }

    // Date range filtering
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.timestamp.$lte = endOfDay;
      }
    }

    console.log('Query:', JSON.stringify(query, null, 2));

    // For export, get all matching records (with reasonable limit)
    const exportLimit = isExport ? 50000 : limit; // Max 50k records for export
    const skipCount = isExport ? 0 : (page - 1) * limit;

    // Get total count for pagination
    const total = await Log.countDocuments(query);
    console.log(`Total matching documents: ${total}`);

    // Get sort parameters from URL
    const sortBy = url.searchParams.get('sortBy') || 'timestamp';
    const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const sortOptions: any = { [sortBy]: sortOrder };

    // Query logs with appropriate limit
    const logsQuery = Log.find(query, {
      prompt: 1,
      response: 1,
      applianceId: 1,
      deviceUDID: 1,
      homeId: 1,
      skuNumber: 1,
      sessionId: 1,
      requestId: 1,
      timestamp: 1,
      responseTime: 1,
      status: 1,
      _id: 1
    })
      .sort(sortOptions)
      .skip(skipCount)
      .limit(exportLimit);

    const logs = await logsQuery.exec();
    console.log(`Retrieved ${logs.length} logs`);

    // Calculate stats (only if not export or small dataset)
    let stats = {
      total: 0,
      completed: 0,
      pending: 0,
      error: 0,
      avgResponseTime: 0
    };

    if (!isExport || total < 10000) {
      const statsResult = await Log.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $ne: ["$response", ""] }, 1, 0] } },
            avgResponseTime: { $avg: "$responseTime" },
            byAppliance: { $addToSet: "$applianceId" },
            byDevice: { $addToSet: "$deviceUDID" },
            byHome: { $addToSet: "$homeId" },
            bySKU: { $addToSet: "$skuNumber" }
          }
        },
        {
          $project: {
            total: 1,
            completed: 1,
            avgResponseTime: { $round: ["$avgResponseTime", 2] },
            uniqueAppliances: { $size: "$byAppliance" },
            uniqueDevices: { $size: "$byDevice" },
            uniqueHomes: { $size: "$byHome" },
            uniqueSKUs: { $size: "$bySKU" }
          }
        }
      ]);

      stats = statsResult[0] || stats;
    }

    const response = {
      success: true,
      data: logs,
      logs: logs, // Both fields for compatibility
      pagination: {
        page,
        limit: isExport ? logs.length : limit,
        total,
        pages: Math.ceil(total / limit),
        isExport
      },
      stats,
      query, // Debug info
      totalFound: logs.length
    };

    console.log(`Sending response with ${logs.length} logs`);
    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        logs: []
      },
      { status: 500 }
    );
  }
}