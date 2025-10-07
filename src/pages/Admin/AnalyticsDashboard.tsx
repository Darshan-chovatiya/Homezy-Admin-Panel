import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

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

const dummyAnalytics: AnalyticsData = {
  totalUsers: 1250,
  totalServicePartners: 340,
  totalBookings: 2847,
  totalRevenue: 425680,
  monthlyGrowth: {
    users: 12.5,
    bookings: 18.3,
    revenue: 22.7
  },
  topServices: [
    { name: "House Cleaning", bookings: 456, revenue: 54720, growth: 15.2 },
    { name: "Plumbing Repair", bookings: 389, revenue: 70020, growth: 8.7 },
    { name: "Electrical Work", bookings: 234, revenue: 58500, growth: 12.4 },
    { name: "HVAC Service", bookings: 198, revenue: 47520, growth: 6.3 },
    { name: "Landscaping", bookings: 167, revenue: 50100, growth: 9.8 }
  ],
  topServicePartners: [
    { name: "Sarah Johnson", bookings: 89, rating: 4.9, earnings: 12450 },
    { name: "Mike Wilson", bookings: 76, rating: 4.8, earnings: 10890 },
    { name: "David Brown", bookings: 65, rating: 4.7, earnings: 9870 },
    { name: "Lisa Anderson", bookings: 58, rating: 4.9, earnings: 8760 },
    { name: "John Smith", bookings: 52, rating: 4.6, earnings: 7890 }
  ],
  recentActivity: [
    { type: "booking", description: "New booking: House Cleaning for John Doe", timestamp: "2024-03-26T10:30:00Z", status: "completed" },
    { type: "user", description: "New service partner registration: Emily Davis", timestamp: "2024-03-26T09:15:00Z", status: "pending" },
    { type: "payment", description: "Payment processed: $180 for Plumbing Repair", timestamp: "2024-03-26T08:45:00Z", status: "completed" },
    { type: "review", description: "New 5-star review for Sarah Johnson", timestamp: "2024-03-26T07:20:00Z", status: "completed" },
    { type: "dispute", description: "Dispute raised for booking BK005", timestamp: "2024-03-26T06:10:00Z", status: "pending" }
  ],
  bookingTrends: [
    { month: "Jan", bookings: 234, revenue: 35100 },
    { month: "Feb", bookings: 267, revenue: 40050 },
    { month: "Mar", bookings: 298, revenue: 44700 },
    { month: "Apr", bookings: 312, revenue: 46800 },
    { month: "May", bookings: 345, revenue: 51750 },
    { month: "Jun", bookings: 378, revenue: 56700 }
  ],
  userSatisfaction: {
    averageRating: 4.7,
    totalReviews: 1847,
    satisfactionRate: 94.2
  }
};

export default function AnalyticsDashboard() {
  const [analytics] = useState<AnalyticsData>(dummyAnalytics);
  const [selectedPeriod, setSelectedPeriod] = useState("6months");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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

  return (
    <>
      <PageMeta
        title="Analytics Dashboard | Homezy Admin Panel"
        description="Real-time insights and analytics for the Homezy platform"
      />
      <PageBreadcrumb pageTitle="Analytics Dashboard" />
      
      <div className="space-y-6">
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
                  {formatNumber(analytics.totalUsers)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  +{analytics.monthlyGrowth.users}% this month
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
                  {formatNumber(analytics.totalServicePartners)}
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
                  {formatNumber(analytics.totalBookings)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  +{analytics.monthlyGrowth.bookings}% this month
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
                  {formatCurrency(analytics.totalRevenue)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  +{analytics.monthlyGrowth.revenue}% this month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Services */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Services
              </h3>
              <select
                className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
            <div className="space-y-4">
              {analytics.topServices.map((service, index) => (
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
              {analytics.topServicePartners.map((partner, index) => (
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
                    {analytics.userSatisfaction.averageRating}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatNumber(analytics.userSatisfaction.totalReviews)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {analytics.userSatisfaction.satisfactionRate}%
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
              {analytics.recentActivity.map((activity, index) => (
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

        {/* Booking Trends Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Booking Trends
            </h3>
            <div className="flex gap-2">
              <button className="rounded-lg bg-primary px-3 py-1 text-sm text-white">
                Bookings
              </button>
              <button className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-300">
                Revenue
              </button>
            </div>
          </div>
          <div className="h-64">
            {/* Simple bar chart representation */}
            <div className="flex h-full items-end justify-between gap-2">
              {analytics.bookingTrends.map((trend, index) => (
                <div key={trend.month} className="flex flex-1 flex-col items-center">
                  <div className="mb-2 flex w-full items-end justify-center gap-1">
                    <div
                      className="w-full bg-primary/20 dark:bg-primary/30"
                      style={{ height: `${(trend.bookings / 400) * 200}px` }}
                    />
                    <div
                      className="w-full bg-green-500/20 dark:bg-green-500/30"
                      style={{ height: `${(trend.revenue / 60000) * 200}px` }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                      {trend.month}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {trend.bookings}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-primary/20 dark:bg-primary/30"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500/20 dark:bg-green-500/30"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
            </div>
          </div>
        </div>

        {/* Export and Actions */}
        <div className="flex justify-end gap-2">
          <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            Export Report
          </button>
          <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
            Generate Full Report
          </button>
        </div>
      </div>
    </>
  );
}
