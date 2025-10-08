import { useState, useEffect } from "react";
import { apiService } from "../../services/api";
import SimpleChart from "../../components/analytics/SimpleChart";

interface AnalyticsData {
  totalUsers: number;
  totalServicePartners: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyGrowth: {
    users: number;
    bookings: number;
    revenue: number;
  };
  topServices: {
    name: string;
    bookings: number;
    revenue: number;
    growth: number;
  }[];
  topServicePartners: {
    name: string;
    bookings: number;
    rating: number;
    earnings: number;
  }[];
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
    status: string;
  }[];
  bookingTrends: {
    month: string;
    bookings: number;
    revenue: number;
  }[];
  userSatisfaction: {
    averageRating: number;
    totalReviews: number;
    satisfactionRate: number;
  };
}

interface CustomerRetentionData {
  segments: {
    newCustomers: number;
    returningCustomers: number;
    loyalCustomers: number;
    vipCustomers: number;
  };
  churnRate: number;
  totalCustomers: number;
  topCustomers: Array<{
    name: string;
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    lastOrder: string;
  }>;
  averageOrdersPerCustomer: number;
  averageCustomerValue: number;
}

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

export default function Home() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [customerRetention, setCustomerRetention] = useState<CustomerRetentionData | null>(null);
  const [servicePartnerPerformance, setServicePartnerPerformance] = useState<ServicePartnerPerformanceData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      booking: "📅",
      user: "👤",
      payment: "💳",
      review: "⭐",
      dispute: "⚠️"
    };
    return icons[type as keyof typeof icons] || "📊";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: "text-green-600 dark:text-green-400",
      pending: "text-yellow-600 dark:text-yellow-400",
      failed: "text-red-600 dark:text-red-400"
    };
    return colors[status as keyof typeof colors] || "text-gray-600 dark:text-gray-400";
  };

  // Fetch all analytics data
  const fetchAllAnalytics = async (period: string) => {
    try {
      setLoading(true);
      const analyticsResponse = await apiService.getDashboardAnalytics(period);

      if (analyticsResponse.data) {
        // Extract main analytics data
        const {
          totalUsers,
          totalServicePartners,
          totalBookings,
          totalRevenue,
          monthlyGrowth,
          topServices,
          topServicePartners,
          recentActivity,
          bookingTrends,
          userSatisfaction
        } = analyticsResponse.data;
        
        setAnalytics({
          totalUsers,
          totalServicePartners,
          totalBookings,
          totalRevenue,
          monthlyGrowth,
          topServices,
          topServicePartners,
          recentActivity,
          bookingTrends,
          userSatisfaction
        });
        
        // Extract customer retention data
        if (analyticsResponse.data.customerRetention) {
          setCustomerRetention(analyticsResponse.data.customerRetention);
        }
        
        // Extract service partner performance data
        if (analyticsResponse.data.servicePartnerPerformance) {
          setServicePartnerPerformance(analyticsResponse.data.servicePartnerPerformance);
        }
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and period change
  useEffect(() => {
    fetchAllAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  return (
    <>
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Analytics</h1>
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            <button
              onClick={() => fetchAllAnalytics(selectedPeriod)}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <span>🔄</span>
              )}
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <span className="text-blue-600 dark:text-blue-300">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatNumber(analytics?.totalUsers || 0)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  +{analytics?.monthlyGrowth?.users || 0}% this month
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <span className="text-purple-600 dark:text-purple-300">🔧</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Service Partners</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatNumber(analytics?.totalServicePartners || 0)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Active partners
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <span className="text-green-600 dark:text-green-300">📅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatNumber(analytics?.totalBookings || 0)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  +{analytics?.monthlyGrowth?.bookings || 0}% this month
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                  <span className="text-yellow-600 dark:text-yellow-300">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(analytics?.totalRevenue || 0)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  +{analytics?.monthlyGrowth?.revenue || 0}% this month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Retention & Service Partner Stats */}
        {/* <div className="grid gap-6 lg:grid-cols-3"> */}
          {/* Customer Segments */}
          {/* <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Customer Segments
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <span className="text-blue-600 dark:text-blue-300">🆕</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">New Customers</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">First-time users</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {customerRetention?.segments.newCustomers || 0}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <span className="text-green-600 dark:text-green-300">🔄</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Returning</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2-3 orders</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {customerRetention?.segments.returningCustomers || 0}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                    <span className="text-purple-600 dark:text-purple-300">💎</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Loyal</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">4-10 orders</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {customerRetention?.segments.loyalCustomers || 0}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                    <span className="text-yellow-600 dark:text-yellow-300">👑</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">VIP</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">10+ orders</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {customerRetention?.segments.vipCustomers || 0}
                </p>
              </div>
            </div>
          </div> */}

          {/* Service Partner Performance */}
          {/* <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Service Partner Performance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Partners</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {servicePartnerPerformance?.stats.totalVendors || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Partners</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {servicePartnerPerformance?.stats.activeVendors || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Completion Rate</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {servicePartnerPerformance?.stats.averageCompletionRate || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {servicePartnerPerformance?.stats.averageRating || 0}/5
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(servicePartnerPerformance?.stats.totalEarnings || 0)}
                </span>
              </div>
            </div>
          </div> */}

          {/* Customer Retention Metrics */}
          {/* <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Customer Retention
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Customers</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {customerRetention?.totalCustomers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</span>
                <span className={`text-lg font-semibold ${(customerRetention?.churnRate || 0) > 20 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {customerRetention?.churnRate || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Orders/Customer</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {customerRetention?.averageOrdersPerCustomer || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Customer Value</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(customerRetention?.averageCustomerValue || 0)}
                </span>
              </div>
            </div>
          </div>
        </div> */}

        {/* Top Services & Service Partners */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Services */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Top Services
              </h3>
            <div className="space-y-4">
              {analytics?.topServices?.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatNumber(service.bookings)} bookings
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(service.revenue)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      +{service.growth}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Service Partners */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Top Service Partners
            </h3>
            <div className="space-y-4">
              {analytics?.topServicePartners?.map((partner, index) => (
                <div key={partner.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {partner.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {partner.rating} ({formatNumber(partner.bookings)} jobs)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(partner.earnings)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Earnings
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts and Performance Trends */}
        {/* <div className="grid gap-6 lg:grid-cols-2"> */}
          {/* Booking Trends Chart */}
          {/* <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Booking Trends
            </h3>
            <div className="h-64">
              <SimpleChart
                data={analytics?.bookingTrends?.map(trend => ({
                  label: trend.month,
                  value: trend.bookings,
                  color: '#3B82F6'
                })) || []}
                type="bar"
                height={200}
                showValues={true}
              />
            </div>
            <div className="mt-4 flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-primary/20 dark:bg-primary/30"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Bookings</span>
              </div>
            </div>
          </div> */}

          {/* Service Partner Performance Trends */}
          {/* <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Service Partner Performance Trends
            </h3>
            <div className="h-64">
              {servicePartnerPerformance?.performanceTrends && servicePartnerPerformance.performanceTrends.length > 0 ? (
                <SimpleChart
                  data={servicePartnerPerformance.performanceTrends.map(trend => ({
                    label: trend.month,
                    value: trend.completionRate,
                    color: '#10B981'
                  }))}
                  type="line"
                  height={200}
                  showValues={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  No performance data available
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-green-500/20 dark:bg-green-500/30"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate %</span>
              </div>
            </div>
          </div> */}
        {/* </div> */}

        {/* User Satisfaction and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Satisfaction */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              User Satisfaction
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Rating</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {analytics?.userSatisfaction?.averageRating || 0}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatNumber(analytics?.userSatisfaction?.totalReviews || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {analytics?.userSatisfaction?.satisfactionRate || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {analytics?.recentActivity?.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <span className="text-sm">{getActivityIcon(activity.type)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                      <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Customers and Top Performers */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Customers */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Top Customers by Value
            </h3>
            <div className="space-y-3">
              {customerRetention?.topCustomers.slice(0, 5).map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {customer.totalOrders} orders • Last: {new Date(customer.lastOrder).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Avg: {formatCurrency(customer.avgOrderValue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Service Partner Performers */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Top Service Partner Performers
            </h3>
            <div className="space-y-3">
              {servicePartnerPerformance?.topPerformers.slice(0, 5).map((partner, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {partner.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {partner.businessName}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {partner.averageRating} ({partner.totalReviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(partner.totalEarnings)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {partner.completionRate}% complete
                    </p>
                  </div>
            </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export and Actions */}
        {/* <div className="flex justify-end gap-2">
          <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            Export Report
          </button>
          <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            Generate Full Report
          </button>
        </div> */}
      </div>
    </>
  );
}
