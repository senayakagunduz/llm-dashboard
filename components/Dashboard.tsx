"use client"
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { MessageSquare, UserCircle2, AlertCircle, CheckCircle, CheckCircle2, Settings, Filter, X, Search, Calendar, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import JSZip from 'jszip';

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
  sortBy: 'timestamp' | 'responseTime' | 'applianceId' | 'deviceUDID' | 'homeId' | 'skuNumber';
  sortOrder: 'asc' | 'desc';
  minResponseTime?: string;
  maxResponseTime?: string;
  sessionId?: string;
  requestId?: string;
  status?: string;
  promptSearch: string;
  responseSearch: string;
  page?:number;
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
  const [isExpanded, setIsExpanded] = useState<Record<string,boolean>>({});

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const [filters, setFilters] = useState<Filters>({
    applianceId: '',
    deviceUDID: '',
    homeId: '',
    skuNumber: '',
    startDate: "",
    endDate: "",
    searchText: '',
    sortBy: 'timestamp',
    sortOrder: 'desc',
    minResponseTime: '',
    maxResponseTime: '',
    sessionId: '',
    requestId: '',
    status: '',
    promptSearch: '',
    responseSearch: '',
    page:1
  });

  // Unique values for dropdowns
  const [uniqueValues, setUniqueValues] = useState<UniqueValues>({
    appliances: [],
    devices: [],
    homes: [],
    skus: []
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

  const toggleExpand = (logId:string) => {
    setIsExpanded(prev=>({...prev, [logId]: !prev[logId]}));
  }
  const applyDatePreset = async (preset: string) => {
    const now = new Date();
    let startDate = '';
    let endDate = '';

    // Türkiye saatine göre tarih formatlama
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    const getTurkeyDate = (date: Date) => {
      // UTC'den Türkiye saatine çevir (+3 saat)
      const turkishDate = new Date(date);
      turkishDate.setHours(turkishDate.getHours() + 3);
      return turkishDate;
    };

    const today = getTurkeyDate(now);

    switch (preset) {
      case 'today':
        startDate = formatDate(today);
        endDate = formatDate(today);
        break;
      case '7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        startDate = formatDate(sevenDaysAgo);
        endDate = formatDate(today);
        break;
      case '30days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        startDate = formatDate(thirtyDaysAgo);
        endDate = formatDate(today);
        break;
      case 'month':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = formatDate(firstDayOfMonth);
        endDate = formatDate(today);
        break;
    }

    setFilters(prev => ({ ...prev, startDate, endDate }));
    // Sayfayı 1'e sıfırla ve verileri yeniden çek
    setPagination(prev => ({ ...prev, page: 1 }));
    // fetchData fonksiyonunu çağırarak yeni filtrelerle verileri güncelle
    fetchData({ ...filters, startDate, endDate }, 1);

  };
  //added pagination parameters to buildQueryParams function (for sending parameters from the api to get wanted page data)
  const buildQueryParams = useCallback((currentFilters: Filters, page: number = 1) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', pagination.limit.toString());

    // Include all filters in the query params
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    return params.toString();
  }, [pagination.limit]);

  // Fetch logs with filters and pagination 
  // Bu parametreler API'ye gönderilerek sadece istenen sayfadaki verilerin getirilmesi sağlanıyor.
  const fetchData = useCallback(async (currentFilters: Filters = filters, page: number = 1) => {
    if (status !== 'authenticated') return;

    try {
      setIsLoading(true);
      const queryParams = buildQueryParams(currentFilters, page);
      const response = await fetch(`/api/logs?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.data);
        setPagination(data.pagination || pagination);
        setStats({
          total: data.pagination?.total || 0,
          completed: data.stats?.completed || 0,
          error: data.stats?.error || 0,
          pending: data.stats?.pending || 0,
          avgResponseTime: Math.round(data.stats?.avgResponseTime || 0)
        });

        // Update unique values for dropdowns
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

    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));

    if (key === 'searchText') {
      if (searchTimeout) clearTimeout(searchTimeout);
      const timeout = setTimeout(() => {
        fetchData({ ...newFilters, page: 1 });
      }, 500);
      setSearchTimeout(timeout);
    } else {
      fetchData({ ...newFilters, page: 1 });
    }
  };

  // Handle sort change
  const handleSortChange = (sortBy: 'timestamp' | 'responseTime', sortOrder: 'asc' | 'desc') => {
    const newFilters = { ...filters, sortBy, sortOrder };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    const emptyFilters: Filters = {
      applianceId: '',
      deviceUDID: '',
      homeId: '',
      skuNumber: '',
      startDate: "",
      endDate: "",
      searchText: '',
      sortBy: 'timestamp',
      sortOrder: 'desc',
      minResponseTime: '',
      maxResponseTime: '',
      sessionId: '',
      requestId: '',
      status: '',
      promptSearch: '',
      responseSearch: '',
    };
    setFilters(emptyFilters);
    fetchData(emptyFilters);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== '').length - 2;
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
    if (filters.sessionId) activeFilters.push({ key: 'sessionId', label: `Session ID: ${filters.sessionId}`, value: filters.sessionId });
    if (filters.requestId) activeFilters.push({ key: 'requestId', label: `Request ID: ${filters.requestId}`, value: filters.requestId });
    if (filters.status) activeFilters.push({ key: 'status', label: `Status: ${filters.status}`, value: filters.status });
    if (filters.promptSearch) activeFilters.push({ key: 'promptSearch', label: `Prompt Search: "${filters.promptSearch}"`, value: filters.promptSearch });
    if (filters.responseSearch) activeFilters.push({ key: 'responseSearch', label: `Response Search: "${filters.responseSearch}"`, value: filters.responseSearch });
    return activeFilters;
  };

  const handleFilterLongs = async () => {
    try {
      setIsLoading(true);
      console.log('Starting export process...');

      // Create URLSearchParams with current filters
      const params = new URLSearchParams();

      // Add filters (remove empty values)
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== undefined && value !== null) {
          // Skip searchText as it's handled client-side
          if (key !== 'searchText') {
            params.append(key, String(value));
          }
        }
      });

      // Add export-specific parameters
      params.append('limit', '10000');
      params.append('page', '1');
      params.append('export', 'true');

      const apiUrl = `/api/logs?${params.toString()}`;
      console.log('API URL:', apiUrl);
      console.log('Applied filters:', filters);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`API hatası: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response received:', {
        success: data.success,
        hasData: !!data.data,
        dataLength: data.data?.length || 0,
        hasLogs: !!data.logs,
        logsLength: data.logs?.length || 0,
        totalFound: data.totalFound
      });

      if (!data.success) {
        throw new Error('API başarısız yanıt döndürdü');
      }

      // Get logs from the response (API returns data field)
      let logsToExport = data.data || [];
      console.log(`Initial logs count: ${logsToExport.length}`);

      if (!logsToExport || logsToExport.length === 0) {
        console.warn('No logs found with current filters');
        alert("Filtrelenmiş sonuç bulunamadı. Lütfen filtrelerinizi kontrol edin.");
        return;
      }

      // Apply client-side searchText filter if exists
      if (filters.searchText && filters.searchText.trim() !== '') {
        const searchLower = filters.searchText.toLowerCase().trim();
        const originalCount = logsToExport.length;

        logsToExport = logsToExport.filter((log: any) => {
          const promptMatch = log.prompt?.toLowerCase().includes(searchLower) || false;
          const responseMatch = log.response?.toLowerCase().includes(searchLower) || false;
          return promptMatch || responseMatch;
        });

        console.log(`Client-side search filter applied. Count: ${originalCount} -> ${logsToExport.length}`);
      }

      if (logsToExport.length === 0) {
        alert("Arama kriterinize uygun sonuç bulunamadı.");
        return;
      }

      console.log(`Final export count: ${logsToExport.length}`);

      // Prepare export data
      const exportData = {
        exportMetadata: {
          exportDate: new Date().toISOString(),
          exportedBy: session?.user?.email || 'Bilinmeyen Kullanıcı',
          totalRecords: logsToExport.length,
          appliedFilters: Object.entries(filters)
            .filter(([key, value]) => value && value !== '')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
          exportVersion: '1.0'
        },
        logs: logsToExport.map((log: any, index: any) => ({
          ...log,
          exportIndex: index + 1,
          // Convert timestamp to readable format for Excel/viewing
          readableTimestamp: log.timestamp ? new Date(log.timestamp).toLocaleString('tr-TR') : null
        }))
      };

      // Create JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      console.log(`JSON string created, size: ${(jsonString.length / 1024).toFixed(2)} KB`);

      // Create ZIP file
      const zip = new JSZip();

      // Add main data file
      zip.file('filtered_logs.json', jsonString);

      // Add summary file
      const summaryContent = `
  Veri İhracat Özeti
  ==================
  İhracat Tarihi: ${new Date().toLocaleString('tr-TR')}
  İhracat Eden: ${session?.user?.email || 'Bilinmeyen Kullanıcı'}
  Toplam Kayıt: ${logsToExport.length}
  
  Uygulanan Filtreler:
  ${Object.entries(filters)
          .filter(([key, value]) => value && value !== '')
          .map(([key, value]) => `- ${key}: ${value}`)
          .join('\n') || 'Filtre uygulanmadı'}
  
  İhracat Dosyaları:
  - filtered_logs.json: Ana veri dosyası (JSON formatında)
  - summary.txt: Bu özet dosyası
  
  Kullanım Notu:
  JSON dosyasını Excel'de açmak için "Veri > JSON'dan" seçeneğini kullanabilirsiniz.
      `.trim();

      zip.file('summary.txt', summaryContent);

      // Generate ZIP
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      console.log(`ZIP file generated, size: ${(zipBlob.size / 1024).toFixed(2)} KB`);

      // Create filename with timestamp and record count
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0];
      const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `logs_export_${timestamp}_${timeString}_${logsToExport.length}_records.zip`;

      // Download file
      const downloadUrl = window.URL.createObjectURL(zipBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = filename;
      downloadLink.style.display = 'none';

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(downloadUrl);

      console.log('Export completed successfully!');

      // Show success message
      alert(`İhracat başarılı! ${logsToExport.length} kayıt indirildi.`);

    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata oluştu';
      alert(`İndirme hatası: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
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
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">LLM Monitoring Dashboard</h1>
              <div className="flex justify-center items-center gap-4 mt-2">
                <p className="flex justify-center items-center text-gray-600 ">Welcome back, {session?.user?.name}</p>
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
            <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0">
              <div className="flex items-center gap-2 text-gray-600">
                <UserCircle2 className="h-5 w-5" />
                <span>{session?.user?.email}</span>
              </div>
              <button
                onClick={async () => {
                  const baseUrl = process.env.NEXT_PUBLIC_NEXTAUTH_URL || window.location.origin;
                  await signOut({
                    callbackUrl: `${baseUrl}/signin`,
                    redirect: true
                  });
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{logs.length && stats.total.toLocaleString()}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{logs.length && stats.completed.toLocaleString()}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-3xl font-bold text-purple-600 truncate w-60">{stats.avgResponseTime}ms</p>
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
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex  items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-gray-800">Recent Activity</h3>
                </div>
                <div className="flex flex-col md:flex-row items-center space-x-3">
                  <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    {logs.length} entries
                  </span>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showFilters
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
                      placeholder="Prompts"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                </div>

                {/* New Filter Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {/* Session ID */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Session ID"
                      value={filters.sessionId || ''}
                      onChange={(e) => handleFilterChange('sessionId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Request ID */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Request ID"
                      value={filters.requestId || ''}
                      onChange={(e) => handleFilterChange('requestId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Response Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Responses"
                      value={filters.responseSearch || ''}
                      onChange={(e) => handleFilterChange('responseSearch', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* SKU Number */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="SKU Number"
                      value={filters.skuNumber || ''}
                      onChange={(e) => handleFilterChange('skuNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Response Time Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">Min (ms)</span>
                    <input
                      type="number"
                      // placeholder="Min response time"
                      value={filters.minResponseTime || ''}
                      onChange={(e) => handleFilterChange('minResponseTime', e.target.value)}
                      className="w-full pl-20 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">Max (ms)</span>
                    <input
                      type="number"
                      // placeholder="Max response time"
                      value={filters.maxResponseTime || ''}
                      onChange={(e) => handleFilterChange('maxResponseTime', e.target.value)}
                      className="w-full pl-20 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
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
                    <div key={log._id} className="flex flex-wrap group bg-gray-50 hover:bg-blue-50 rounded-xl p-5 border border-transparent hover:border-blue-200 transition-all duration-200">
                      <div className="flex flex-col md:flex-row items-start space-x-4">
                        {/* Activity Icon */}
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.747-.426l-2.123.707c-.396.132-.795.044-1.09-.251a.97.97 0 01-.251-1.09l.707-2.123A8.955 8.955 0 013 12C3 7.582 6.582 4 12 4s9 3.582 9 8z" />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Main Content */}
                          <div className="mb-3">
                            <h4 className="text-xs md:text-lg font-medium text-gray-900 mb-2">
                              {log.prompt}
                            </h4>

                            {log.response && (
                              <div className="px-2 py-3">
                                <p className="text-gray-800 text-xs md:text-sm leading-relaxed">
                                {isExpanded[log._id] ? log.response : log.response.substring(0, 150)}
                                  {log.response.length > 150 && (
                                    <span className="text-blue-500 cursor-pointer hover:underline ml-1" onClick={(e)=>{e.stopPropagation();toggleExpand(log._id);}}>
                                       {isExpanded[log._id] ? 'less show' : 'read more'}
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Metadata Tags */}
                          <div className="flex flex-col md:flex-row flex-wrap text-xs md:text-sm gap-2 mb-3">
                            {log.applianceId && (
                              <span className="text-[.70rem] sm:text-sm inline-flex flex-wrap items-center px-2.5 py-1 rounded-full  bg-purple-100">
                                <span className="text-gray-600">Appliance ID:</span>
                                <span className="text-purple-800 ">{log.applianceId}</span>
                              </span>
                            )}

                            {log.skuNumber && (
                              <span className="text-[.70rem] sm:text-sm inline-flex flex-wrap items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 ">
                                <span className="text-gray-600">Sku Number:</span>
                                <span className="text-orange-700 ">{log.skuNumber}</span>
                              </span>
                            )}

                            {log.deviceUDID && (
                              <span className="text-[.70rem] sm:text-sm inline-flex flex-wrap items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <span className=" text-gray-600">Device UDID:</span>
                                <span className=" text-green-800 ">{log.deviceUDID}</span>
                              </span>
                            )}

                            {log.homeId && (
                              <span className="text-[.70rem] sm:text-sm inline-flex flex-wrap items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                <span className=" text-gray-600">Home ID:</span>
                                <span className=" text-blue-800 ">{log.homeId}</span>
                              </span>
                            )}
                            {log.sessionId && (
                              <span className="text-[.70rem] sm:text-sm inline-flex flex-wrap items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <span className="text-gray-600">Session ID:</span>
                                <span className="text-green-800 ">{log.sessionId}</span>
                              </span>
                            )}
                          </div>

                          {/* Footer Info */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-4 ml-1 mt-2">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="darkgreen" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(log.timestamp).toLocaleString('en-EN', {
                                  timeZone: 'Europe/Istanbul',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                })}
                              </span>

                              {log.responseTime && (
                                <span className="flex items-center">
                                  <div className={`w-3 h-3 rounded-full mr-1 ${log.responseTime < 1000 ? 'bg-green-400' : log.responseTime < 3000 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-5a2 2 0 00-2-2h-2m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

            {/* Pagination component */}
            {!filters.searchText && pagination.pages > 1 ? (
              <div className="flex flex-wrap justify-between items-center mt-6 mb-4 px-2">
                <div className="flex flex-wrap text-sm mb-2 text-gray-500">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> &nbsp;logs
                </div>
                <div className="flex flex-wrap text-sm mb-2 text-gray-500">Filtered &nbsp;{logs.length} Logs</div>
                <div className="flex text-lg lg:text-2xl space-x-2">
                  <button
                    onClick={() => fetchData(filters, pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-2 py-1 lg:px-4 lg:py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex text-md lg:text-2xl items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      // Calculate page numbers to show (current page in the middle when possible)
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page > pagination.pages - 3) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchData(filters, pageNum)}
                          className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium ${pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => fetchData(filters, pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : logs.length > 0 ? (
              <div className='flex items-center justify-center mb-2 mx-3'>
                <span className="text-sm text-gray-500">{logs.length} logs found</span>
              </div>
            ) : null}
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
                <button onClick={() => handleFilterLongs()} className="px-3 py-1.5 text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
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