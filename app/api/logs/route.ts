import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Log } from '@/models/Log';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url || 'http://localhost'); // fallback
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status');
    const userId = url.searchParams.get('userId');

    try {
      await connectDB();
      
      // Build query
      const query: any = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      if (userId) {
        query.userId = userId;
      }

      // Get total count for pagination
      const total = await Log.countDocuments(query);
      
      // Sort and paginate
      const logs = await Log.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      // Calculate stats
      const stats = await Log.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            error: { $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] } },
            avgResponseTime: { $avg: "$responseTime" }
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
