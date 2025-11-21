import { useState, useEffect } from "react";

interface ServicePartnerPerformanceData {
  stats: {
    totalVendors: number;
    activeVendors: number;
    averageCompletionRate: number;
    averageRating: number;
    totalEarnings: number;
  };
  topPerformers: Array<{
    name: string;
    businessName: string;
    totalOrders: number;
    completedOrders: number;
    completionRate: number;
    totalEarnings: number;
    averageRating: number;
    totalReviews: number;
  }>;
  performanceTrends: Array<{
    month: string;
    totalOrders: number;
    completedOrders: number;
    completionRate: number;
    totalEarnings: number;
  }>;
}

interface ServicePartnerPerformanceProps {
  period: string;
}

export default function ServicePartnerPerformance({ period }: ServicePartnerPerformanceProps) {
  const [data, setData] = useState<ServicePartnerPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setData(null);
        // const response = await apiService.getServicePartnerPerformance(period);
        // if (response.data) {
        //   setData(response.data);
        // }
      } catch (err) {
        console.error('Error fetching service partner performance data:', err);
        setError('Failed to load service partner performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading service partner performance data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <span className="text-[#013365] dark:text-blue-300">👥</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Partners</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {data.stats.totalVendors}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <span className="text-green-600 dark:text-green-300">✅</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {data.stats.activeVendors}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <span className="text-purple-600 dark:text-purple-300">📊</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {data.stats.averageCompletionRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                <span className="text-yellow-600 dark:text-yellow-300">⭐</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Rating</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {data.stats.averageRating}/5
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
                <span className="text-indigo-600 dark:text-indigo-300">💰</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Earnings</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(data.stats.totalEarnings)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Performing Service Partners
        </h3>
        <div className="space-y-3">
          {data.topPerformers.map((partner, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                  {index + 1}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {partner.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {partner.businessName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {partner.averageRating} ({partner.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {partner.completedOrders}/{partner.totalOrders}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {partner.completionRate}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Complete</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(partner.totalEarnings)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Earnings</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Trends Chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Trends
        </h3>
        <div className="h-64">
          {/* Simple bar chart representation */}
          <div className="flex h-full items-end justify-between gap-2">
            {data.performanceTrends.map((trend) => (
              <div key={trend.month} className="flex flex-1 flex-col items-center">
                <div className="mb-2 flex w-full items-end justify-center gap-1">
                  <div
                    className="w-full bg-primary/20 dark:bg-primary/30"
                    style={{ height: `${(trend.totalOrders / Math.max(...data.performanceTrends.map(t => t.totalOrders))) * 200}px` }}
                  />
                  <div
                    className="w-full bg-green-500/20 dark:bg-green-500/30"
                    style={{ height: `${(trend.completedOrders / Math.max(...data.performanceTrends.map(t => t.completedOrders))) * 200}px` }}
                  />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {trend.month}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {trend.completionRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-primary/20 dark:bg-primary/30"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Orders</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-500/20 dark:bg-green-500/30"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Completed Orders</span>
          </div>
        </div>
      </div>
    </div>
  );
}
