// "use client"
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSession, signOut } from 'next-auth/react';
// import { MessageSquare, XCircle, UserCircle2, AlertCircle, CheckCircle, CheckCircle2, Clock, Settings } from 'lucide-react';
// import Link from 'next/link';

// interface Stats {
//   total: number;
//   completed: number;
//   error: number;
//   pending: number;
//   avgResponseTime: number;
// }

// export default function Dashboard() {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const [stats, setStats] = useState<Stats>({
//     total: 0,
//     completed: 0,
//     error: 0,
//     pending: 0,
//     avgResponseTime: 0
//   });

//   const [logs, setLogs] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Fetch logs and stats
//   useEffect(() => {
//     if (status === 'authenticated') {
//       const fetchData = async () => {
//         try {
//           setIsLoading(true);
//           const response = await fetch('/api/logs');
//           const data = await response.json();
//           console.log(data);

//           if (data.success) {
//             setLogs(data.data);
//             setStats({
//               total: data.stats?.total || 0,
//               completed: data.stats?.completed || 0,
//               error: data.stats?.error || 0,
//               pending: data.stats?.pending || 0,
//               avgResponseTime: Math.round(data.stats?.avgResponseTime || 0)
//             });
//           }
//         } catch (error) {
//           console.error('Error fetching logs:', error);
//         } finally {
//           setIsLoading(false);
//         }
//       };

//       fetchData();
//     } else if (status === 'unauthenticated') {
//       router.push('/api/auth/signin');
//     }
//   }, [status, router]);

//   // Loading state
//   if (status === 'loading') {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-lg">Loading...</div>
//       </div>
//     );
//   }

//   // Redirect if not authenticated
//   if (status === 'unauthenticated') {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">LLM Monitoring Dashboard</h1>
//               <div className="flex items-center gap-4">
//                 <p className="text-gray-600 mt-2">Welcome back, {session?.user?.name}</p>
//               </div>
//             </div>

//             {session?.user?.role === 'admin' && (
//               <Link
//                 href="/admin"
//                 className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
//                 title="Admin Panel"
//               >
//                 <Settings className="h-5 w-5 text-indigo-100 group-hover:scale-110 transition-transform" />
//                 <span className="hidden md:inline font-medium">Admin Panel</span>
//               </Link>
//             )}
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2 text-gray-600">
//                 <UserCircle2 className="h-5 w-5" />
//                 <span>{session?.user?.email}</span>
//               </div>
//               <button
//                 onClick={async () => {
//                   await signOut({ callbackUrl: '/signin' });
//                   router.push('/signin');
//                 }}
//                 className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
//               >
//                 Sign Out
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Requests</p>
//                 <p className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
//               </div>
//               <MessageSquare className="h-8 w-8 text-blue-500" />
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Completed</p>
//                 <p className="text-3xl font-bold text-green-600">{stats.completed.toLocaleString()}</p>
//               </div>
//               <CheckCircle2 className="h-8 w-8 text-green-500" />
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Errors</p>
//                 <p className="text-3xl font-bold text-red-600">{stats.error.toLocaleString()}</p>
//               </div>
//               <XCircle className="h-8 w-8 text-red-500" />
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Pending</p>
//                 <p className="text-3xl font-bold text-yellow-600">{stats.pending.toLocaleString()}</p>
//               </div>
//               <Clock className="h-8 w-8 text-yellow-500" />
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Avg Response</p>
//                 <p className="text-3xl font-bold text-purple-600">{stats.avgResponseTime}ms</p>
//               </div>
//               <AlertCircle className="h-8 w-8 text-purple-500" />
//             </div>
//           </div>
//         </div>

//         {/* Main Content Area */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Recent Activity */}
//           {/* <div className="lg:col-span-2 bg-white rounded-lg shadow">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
//             </div>
//             <div className="p-6">
//               {isLoading ? (
//                 <div className="text-center text-gray-500 py-8">Loading logs...</div>
//               ) : logs.length > 0 ? (
//                 <div className="space-y-4">
//                   {logs.map((log) => (
//                     <div key={log._id} className="p-4 border rounded-lg">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <p className="font-medium">{log.prompt}</p>
//                           <p className="text-sm text-gray-600 mt-1">{log.response?.substring(0, 100)}{log.response?.length > 100 ? '...' : ''}</p>
//                           <div className="mt-2 text-xs text-gray-500">
//                             <span>Appliance: {log.applianceId}</span>
//                             {log.skuNumber && <span className="ml-2">SKU: {log.skuNumber}</span>}
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <div className="text-xs text-gray-500 my-7">
//                             {new Date(log.timestamp).toLocaleString()}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="mt-2 flex justify-between text-xs text-gray-500">
//                         <span>Device: {log.deviceUDID || 'N/A'}</span>
//                         <span>Response: {log.responseTime}ms</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center text-gray-500 py-8">
//                   No recent activity to display
//                 </div>
//               )}
//             </div>
//           </div> */}
//           <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
//             <div className="px-6 py-5 border-b border-gray-100">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-2">
//                   <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//                   <h3 className="text-xl font-semibold text-gray-800">Recent Activity</h3>
//                 </div>
//                 <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
//                   {logs.length} entries
//                 </span>
//               </div>
//             </div>

//             <div className="p-6">
//               {isLoading ? (
//                 <div className="flex flex-col items-center justify-center py-12">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
//                   <p className="text-gray-500">Loading your activity...</p>
//                 </div>
//               ) : logs.length > 0 ? (
//                 <div className="space-y-4">
//                   {logs.map((log, index) => (
//                     <div key={log._id} className="group bg-gray-50 hover:bg-blue-50 rounded-xl p-5 border border-transparent hover:border-blue-200 transition-all duration-200">
//                       <div className="flex items-start space-x-4">
//                         {/* Activity Icon */}
//                         <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
//                           <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.747-.426l-2.123.707c-.396.132-.795.044-1.09-.251a.97.97 0 01-.251-1.09l.707-2.123A8.955 8.955 0 013 12C3 7.582 6.582 4 12 4s9 3.582 9 8z" />
//                           </svg>
//                         </div>

//                         <div className="flex-1 min-w-0">
//                           {/* Main Content */}
//                           <div className="mb-3">
//                             <h4 className="text-lg font-medium text-gray-900 mb-2 leading-tight">
//                               {log.prompt}
//                             </h4>

//                             {log.response && (
//                               <div className="bg-white rounded-lg p-3 border border-gray-200">
//                                 <p className="text-gray-700 text-sm leading-relaxed">
//                                   {log.response.substring(0, 150)}
//                                   {log.response.length > 150 && (
//                                     <span className="text-blue-500 cursor-pointer hover:underline ml-1">
//                                       read more
//                                     </span>
//                                   )}
//                                 </p>
//                               </div>
//                             )}
//                           </div>

//                           {/* Metadata Tags */}
//                           <div className="flex flex-wrap gap-2 mb-3">
//                             <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                               📱 {log.applianceId}
//                             </span>

//                             {log.skuNumber && (
//                               <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
//                                 🏷️ {log.skuNumber}
//                               </span>
//                             )}

//                             {log.deviceUDID && (
//                               <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                                 🔗 Device Connected
//                               </span>
//                             )}
//                           </div>

//                           {/* Footer Info */}
//                           <div className="flex items-center justify-between text-xs text-gray-500">
//                             <div className="flex items-center space-x-4">
//                               <span className="flex items-center">
//                                 <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                 </svg>
//                                 {new Date(log.timestamp).toLocaleDateString('tr-TR', {
//                                   day: 'numeric',
//                                   month: 'short',
//                                   hour: '2-digit',
//                                   minute: '2-digit'
//                                 })}
//                               </span>

//                               {log.responseTime && (
//                                 <span className="flex items-center">
//                                   <div className={`w-2 h-2 rounded-full mr-1 ${log.responseTime < 1000 ? 'bg-green-400' : log.responseTime < 3000 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
//                                   {log.responseTime}ms
//                                 </span>
//                               )}
//                             </div>

//                             <span className="text-gray-400">#{index + 1}</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-16">
//                   <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
//                     <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                     </svg>
//                   </div>
//                   <h4 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h4>
//                   <p className="text-gray-500 max-w-sm mx-auto">
//                     Your recent interactions will appear here. Start using the system to see your activity log.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//           {/* System Status */}
//           <div className="bg-white rounded-lg shadow">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <h3 className="text-lg font-medium text-gray-900">System Status</h3>
//             </div>
//             <div className="p-6">
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-600">Database</span>
//                   <div className="flex items-center gap-2">
//                     <CheckCircle className="h-4 w-4 text-green-500" />
//                     <span className="text-sm text-green-600">Connected</span>
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-600">Auth Service</span>
//                   <div className="flex items-center gap-2">
//                     <CheckCircle className="h-4 w-4 text-green-500" />
//                     <span className="text-sm text-green-600">Active</span>
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-600">Monitoring</span>
//                   <div className="flex items-center gap-2">
//                     <CheckCircle className="h-4 w-4 text-green-500" />
//                     <span className="text-sm text-green-600">Running</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client"
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { MessageSquare, XCircle, UserCircle2, AlertCircle, CheckCircle, CheckCircle2, Clock, Settings, Filter, X, Search, Calendar, ChevronDown, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  total: number;
  completed: number;
  error: number;
  pending: number;
  avgResponseTime: number;
}

interface UniqueValues {
  appliances: string[];
  devices: string[];
  homes: string[];
  skus: string[];
}

interface Filters {
  applianceId: string;
  deviceUDID: string;
  homeId: string;
  skuNumber: string;
  startDate: string;
  endDate: string;
  searchText: string;
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
  const [showFilters, setShowFilters] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const [filters, setFilters] = useState<Filters>({
    applianceId: '',
    deviceUDID: '',
    homeId: '',
    skuNumber: '',
    startDate: '',
    endDate: '',
    searchText: ''
  });

  // Unique values for dropdowns
  const [uniqueValues, setUniqueValues] = useState({
    appliances: [] as string[],
    devices: [] as string[],
    homes: [] as string[],
    skus: [] as string[]
  });

  // Debounce search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Date presets
  const datePresets = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 days', value: '7days' },
    { label: 'Last 30 days', value: '30days' },
    { label: 'This month', value: 'month' }
  ];

  const applyDatePreset = (preset: string) => {
    const now = new Date();
    let startDate = '';
    let endDate = new Date().toISOString().split('T')[0];

    switch (preset) {
      case 'today':
        startDate = new Date().toISOString().split('T')[0];
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        break;
    }

    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  // Build query parameters
  const buildQueryParams = useCallback((currentFilters: Filters, page: number = 1) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', pagination.limit.toString());

    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && key !== 'searchText') {
        params.append(key, value);
      }
    });

    return params.toString();
  }, [pagination.limit]);

  // Fetch logs with filters
  const fetchData = useCallback(async (currentFilters: Filters = filters, page: number = 1) => {
    if (status !== 'authenticated') return;

    try {
      setIsLoading(true);
      const queryParams = buildQueryParams(currentFilters, page);
      const response = await fetch(`/api/logs?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        let filteredLogs = data.data;

        // Client-side search filter for prompt/response
        if (currentFilters.searchText) {
          const searchLower = currentFilters.searchText.toLowerCase();
          filteredLogs = filteredLogs.filter((log: any) => 
            log.prompt?.toLowerCase().includes(searchLower) ||
            log.response?.toLowerCase().includes(searchLower)
          );
        }

        setLogs(filteredLogs);
        setPagination(data.pagination || pagination);
        setStats({
          total: data.stats?.total || 0,
          completed: data.stats?.completed || 0,
          error: data.stats?.error || 0,
          pending: data.stats?.pending || 0,
          avgResponseTime: Math.round(data.stats?.avgResponseTime || 0)
        });

        // Extract unique values for dropdowns
        const appliances = [...new Set(data.data.map((log: any) => log.applianceId).filter(Boolean))] as string[];
        const devices = [...new Set(data.data.map((log: any) => log.deviceUDID).filter(Boolean))] as string[];
        const homes = [...new Set(data.data.map((log: any) => log.homeId).filter(Boolean))] as string[];
        const skus = [...new Set(data.data.map((log: any) => log.skuNumber).filter(Boolean))] as string[];

        setUniqueValues({ appliances, devices, homes, skus });
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [status, filters, buildQueryParams, pagination]);

  // Handle filter changes with debouncing for search
  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    if (key === 'searchText') {
      if (searchTimeout) clearTimeout(searchTimeout);
      const timeout = setTimeout(() => {
        fetchData(newFilters);
      }, 500);
      setSearchTimeout(timeout);
    } else {
      fetchData(newFilters);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    const emptyFilters: Filters = {
      applianceId: '',
      deviceUDID: '',
      homeId: '',
      skuNumber: '',
      startDate: '',
      endDate: '',
      searchText: ''
    };
    setFilters(emptyFilters);
    fetchData(emptyFilters);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  // Get active filter tags
  const getActiveFilters = () => {
    const activeFilters = [];
    if (filters.searchText) activeFilters.push({ key: 'searchText', label: `Search: "${filters.searchText}"`, value: filters.searchText });
    if (filters.applianceId) activeFilters.push({ key: 'applianceId', label: `Appliance: ${filters.applianceId}`, value: filters.applianceId });
    if (filters.deviceUDID) activeFilters.push({ key: 'deviceUDID', label: `Device: ${filters.deviceUDID}`, value: filters.deviceUDID });
    if (filters.homeId) activeFilters.push({ key: 'homeId', label: `Home: ${filters.homeId}`, value: filters.homeId });
    if (filters.skuNumber) activeFilters.push({ key: 'skuNumber', label: `SKU: ${filters.skuNumber}`, value: filters.skuNumber });
    if (filters.startDate) activeFilters.push({ key: 'startDate', label: `From: ${filters.startDate}`, value: filters.startDate });
    if (filters.endDate) activeFilters.push({ key: 'endDate', label: `To: ${filters.endDate}`, value: filters.endDate });
    return activeFilters;
  };

  // Initial data fetch
  useEffect(() => {
    if (status === 'authenticated') {
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
          {/* Recent Activity with Filters */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Header with Filter Toggle */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-800">Recent Activity</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    {logs.length} entries
                  </span>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      showFilters 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                    {getActiveFilterCount() > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => fetchData()}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                {/* Search and Date Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search in prompts/responses..."
                      value={filters.searchText}
                      onChange={(e) => handleFilterChange('searchText', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Start Date */}
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* End Date */}
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Date Presets */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {datePresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => applyDatePreset(preset.value)}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Dropdown Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Appliance Filter */}
                  <select
                    value={filters.applianceId}
                    onChange={(e) => handleFilterChange('applianceId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Appliances</option>
                    {uniqueValues.appliances.map((appliance) => (
                      <option key={appliance} value={appliance}>{appliance}</option>
                    ))}
                  </select>

                  {/* Device Filter */}
                  <select
                    value={filters.deviceUDID}
                    onChange={(e) => handleFilterChange('deviceUDID', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Devices</option>
                    {uniqueValues.devices.map((device) => (
                      <option key={device} value={device}>{device}</option>
                    ))}
                  </select>

                  {/* Home Filter */}
                  <select
                    value={filters.homeId}
                    onChange={(e) => handleFilterChange('homeId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Homes</option>
                    {uniqueValues.homes.map((home) => (
                      <option key={home} value={home}>{home}</option>
                    ))}
                  </select>

                  {/* SKU Filter */}
                  <input
                    type="text"
                    placeholder="SKU Number"
                    value={filters.skuNumber}
                    onChange={(e) => handleFilterChange('skuNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Active Filters and Clear All */}
                {getActiveFilterCount() > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {getActiveFilters().map((filter) => (
                        <span
                          key={filter.key}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {filter.label}
                          <button
                            onClick={() => handleFilterChange(filter.key as keyof Filters, '')}
                            className="hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Activity Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
                  <p className="text-gray-500">Loading your activity...</p>
                </div>
              ) : logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.map((log, index) => (
                    <div key={log._id} className="group bg-gray-50 hover:bg-blue-50 rounded-xl p-5 border border-transparent hover:border-blue-200 transition-all duration-200">
                      <div className="flex items-start space-x-4">
                        {/* Activity Icon */}
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.747-.426l-2.123.707c-.396.132-.795.044-1.09-.251a.97.97 0 01-.251-1.09l.707-2.123A8.955 8.955 0 013 12C3 7.582 6.582 4 12 4s9 3.582 9 8z" />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Main Content */}
                          <div className="mb-3">
                            <h4 className="text-lg font-medium text-gray-900 mb-2 leading-tight">
                              {log.prompt}
                            </h4>

                            {log.response && (
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {log.response.substring(0, 150)}
                                  {log.response.length > 150 && (
                                    <span className="text-blue-500 cursor-pointer hover:underline ml-1">
                                      read more
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Metadata Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {log.applianceId && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                📱 {log.applianceId}
                              </span>
                            )}

                            {log.skuNumber && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                🏷️ {log.skuNumber}
                              </span>
                            )}

                            {log.deviceUDID && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                🔗 Device Connected
                              </span>
                            )}

                            {log.homeId && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                🏠 {log.homeId}
                              </span>
                            )}
                          </div>

                          {/* Footer Info */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(log.timestamp).toLocaleDateString('tr-TR', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>

                              {log.responseTime && (
                                <span className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full mr-1 ${log.responseTime < 1000 ? 'bg-green-400' : log.responseTime < 3000 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                                  {log.responseTime}ms
                                </span>
                              )}
                            </div>

                            <span className="text-gray-400">#{((pagination.page - 1) * pagination.limit) + index + 1}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No activity found</h4>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {getActiveFilterCount() > 0 
                      ? 'Try adjusting your filters to see more results.'
                      : 'Your recent interactions will appear here. Start using the system to see your activity log.'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchData(filters, pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => fetchData(filters, pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
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

                {/* Filter Statistics */}
                {getActiveFilterCount() > 0 && (
                  <>
                    <div className="border-t pt-4 mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Current Filter Stats</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Filtered Results:</span>
                          <span className="font-medium text-blue-600">{logs.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Available:</span>
                          <span className="font-medium text-gray-900">{pagination.total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Active Filters:</span>
                          <span className="font-medium text-orange-600">{getActiveFilterCount()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Quick Stats */}
                <div className="border-t pt-4 mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Insights</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unique Devices:</span>
                      <span className="font-medium text-gray-900">{uniqueValues.devices.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unique Appliances:</span>
                      <span className="font-medium text-gray-900">{uniqueValues.appliances.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unique Homes:</span>
                      <span className="font-medium text-gray-900">{uniqueValues.homes.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export and Bulk Actions (Hidden for now, can be activated) */}
        {getActiveFilterCount() > 0 && logs.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-800">
                  Found {logs.length} results with current filters
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
                  Export Results
                </button>
                <button 
                  onClick={clearAllFilters}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}