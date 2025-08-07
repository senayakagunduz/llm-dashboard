//app/api/logs/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

import { Log } from '@/models/Log';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url || 'http://localhost'); // fallback
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const applianceId = url.searchParams.get('applianceId');
    const deviceUDID = url.searchParams.get('deviceUDID');
    const homeId = url.searchParams.get('homeId');
    const skuNumber = url.searchParams.get('skuNumber');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    try {
      await connectDB();

      // Build query
      const query: any = {};
      if (applianceId) {
        query.applianceId = applianceId;
      }
      if (deviceUDID) {
        query.deviceUDID = deviceUDID;
      }
      if (homeId) {
        query.homeId = homeId;
      }
      if (skuNumber) {
        query.skuNumber = skuNumber;
      }

      // Add date range filtering
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) {
          query.timestamp.$gte = new Date(startDate);
        }
        if (endDate) {
          query.timestamp.$lte = new Date(endDate);
        }
      }

      // Get total count for pagination
      const total = await Log.countDocuments(query);
      
      // Get sort parameters from URL
      const sortBy = url.searchParams.get('sortBy') || 'timestamp';
      const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 1 : -1;

      // Create sort options
      const sortOptions: any = { [sortBy]: sortOrder };

      // Sort and paginate
      const logs = await Log.find(query, {
        prompt: 1,
        response: 1,
        applianceId: 1,
        deviceUDID: 1,
        homeId: 1,
        skuNumber: 1,
        timestamp: 1,
        responseTime: 1,
        status: 1,
        _id: 1
      })
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit);

      // Calculate stats
      const stats = await Log.aggregate([
        {
          $match: query // Mevcut filtreleri uygula
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $ne: ["$response", ""] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$response", ""] }, 1, 0] } },
            error: { $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] } },
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
            pending: 1,
            error: 1,
            avgResponseTime: { $round: ["$avgResponseTime", 2] }, // İki ondalık basamağa yuvarla
            uniqueAppliances: { $size: "$byAppliance" },
            uniqueDevices: { $size: "$byDevice" },
            uniqueHomes: { $size: "$byHome" },
            uniqueSKUs: { $size: "$bySKU" }
          }
        }
      ]);

      const responseLogs = {
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats: stats[0] || {
          total: 0,
          completed: 0,
          pending: 0,
          error: 0,
          avgResponseTime: 0
        }
      };

      return NextResponse.json(responseLogs);
    } catch (error: unknown) {
      console.error('Error fetching logs:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
