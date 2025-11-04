import { useState, useEffect } from "react";
import { apiService } from "../../services/api";
import { Users, Wrench, Calendar, DollarSign } from "lucide-react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

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
  bookingTrends: {
    month: string;
    bookings: number;
    revenue: number;
  }[];
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

interface RevenueChartData {
  categories: string[];
  revenue: number[];
  totalRevenue: number;
}

export default function Home() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [customerRetention, setCustomerRetention] = useState<CustomerRetentionData | null>(null);
  const [servicePartnerPerformance, setServicePartnerPerformance] = useState<ServicePartnerPerformanceData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [revenueChartData, setRevenueChartData] = useState<RevenueChartData | null>(null);
  const [revenueFilter, setRevenueFilter] = useState<'week' | 'month' | 'year'>('month');
  const [revenuePeriod, setRevenuePeriod] = useState<string>('month');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Fetch all analytics data
  const fetchAllAnalytics = async (period: string) => {
    try {
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
          bookingTrends
        } = analyticsResponse.data;
        
        setAnalytics({
          totalUsers,
          totalServicePartners,
          totalBookings,
          totalRevenue,
          monthlyGrowth,
          topServices,
          topServicePartners,
          bookingTrends
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
    }
  };

  // Fetch revenue chart data
  const fetchRevenueChartData = async (period: string, filter: 'week' | 'month' | 'year') => {
    try {
      const response = await apiService.getRevenueChartData(period, filter);
      if (response.data) {
        setRevenueChartData(response.data);
      }
    } catch (err) {
      console.error('Error fetching revenue chart data:', err);
    }
  };

  // Fetch data on component mount and period change
  useEffect(() => {
    fetchAllAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  // Fetch revenue chart data when filter or period changes
  useEffect(() => {
    fetchRevenueChartData(revenuePeriod, revenueFilter);
  }, [revenuePeriod, revenueFilter]);

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
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatNumber(analytics?.totalUsers || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Wrench className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Service Partners</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatNumber(analytics?.totalServicePartners || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatNumber(analytics?.totalBookings || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                  <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(analytics?.totalRevenue || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

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

        {/* Revenue Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Revenue Chart
            </h3>
            <div className="flex items-center gap-3">
              <select
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={revenuePeriod}
                onChange={(e) => setRevenuePeriod(e.target.value)}
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="year">Last Year</option>
              </select>
              <select
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={revenueFilter}
                onChange={(e) => setRevenueFilter(e.target.value as 'week' | 'month' | 'year')}
              >
                <option value="week">Group by Week</option>
                <option value="month">Group by Month</option>
                <option value="year">Group by Year</option>
              </select>
            </div>
          </div>
          {revenueChartData && (
            <div className="w-full">
              <Chart
                options={{
                  colors: ["#465fff"],
                  chart: {
                    fontFamily: "Outfit, sans-serif",
                    type: "bar",
                    height: 350,
                    toolbar: {
                      show: false,
                    },
                  },
                  plotOptions: {
                    bar: {
                      horizontal: false,
                      columnWidth: "55%",
                      borderRadius: 5,
                      borderRadiusApplication: "end",
                    },
                  },
                  dataLabels: {
                    enabled: false,
                  },
                  stroke: {
                    show: true,
                    width: 2,
                    colors: ["transparent"],
                  },
                  xaxis: {
                    categories: revenueChartData.categories,
                    axisBorder: {
                      show: false,
                    },
                    axisTicks: {
                      show: false,
                    },
                  },
                  yaxis: {
                    labels: {
                      formatter: (val: number) => formatCurrency(val),
                    },
                  },
                  grid: {
                    yaxis: {
                      lines: {
                        show: true,
                      },
                    },
                    xaxis: {
                      lines: {
                        show: false,
                      },
                    },
                  },
                  fill: {
                    opacity: 1,
                  },
                  tooltip: {
                    y: {
                      formatter: (val: number) => formatCurrency(val),
                    },
                  },
                } as ApexOptions}
                series={[
                  {
                    name: "Revenue",
                    data: revenueChartData.revenue,
                  },
                ]}
                type="bar"
                height={350}
              />
            </div>
          )}
          {!revenueChartData && (
            <div className="flex h-[350px] items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
            </div>
          )}
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
      </div>
    </>
  );
}
