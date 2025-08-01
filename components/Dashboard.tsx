"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { MessageSquare, XCircle, UserCircle2, AlertCircle, CheckCircle, CheckCircle2, Clock, UserCog, Settings } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  total: number;
  completed: number;
  error: number;
  pending: number;
  avgResponseTime: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    error: 0,
    pending: 0,
    avgResponseTime: 0
  });

  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch logs and stats
  useEffect(() => {
    if (status === 'authenticated') {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/logs');
          const data = await response.json();

          if (data.success) {
            setLogs(data.data);
            setStats({
              total: data.stats?.total || 0,
              completed: data.stats?.completed || 0,
              error: data.stats?.error || 0,
              pending: data.stats?.pending || 0,
              avgResponseTime: Math.round(data.stats?.avgResponseTime || 0)
            });
          }
        } catch (error) {
          console.error('Error fetching logs:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LLM Monitoring Dashboard</h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600 mt-2">Welcome back, {session?.user?.name}</p>
              </div>
            </div>
           
            {session?.user?.role === 'admin' && (
              <Link
                href="/admin"
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                title="Admin Panel"
              >
                <Settings className="h-5 w-5 text-indigo-100 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline font-medium">Admin Panel</span>
              </Link>
            )}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <UserCircle2 className="h-5 w-5" />
                <span>{session?.user?.email}</span>
              </div>
              <button
                onClick={async () => {
                  await signOut({ callbackUrl: '/signin' });
                  router.push('/signin');
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed.toLocaleString()}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Errors</p>
                <p className="text-3xl font-bold text-red-600">{stats.error.toLocaleString()}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-3xl font-bold text-purple-600">{stats.avgResponseTime}ms</p>
              </div>
              <AlertCircle className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="text-center text-gray-500 py-8">Loading logs...</div>
              ) : logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log._id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{log.question}</p>
                          <p className="text-sm text-gray-600 mt-1">{log.answer?.substring(0, 100)}{log.answer?.length > 100 ? '...' : ''}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${log.status === 'completed' ? 'bg-green-100 text-green-800' :
                          log.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>Model: {log.model || 'N/A'}</span>
                        <span>Response: {log.responseTime}ms</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No recent activity to display
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">System Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auth Service</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monitoring</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Running</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}