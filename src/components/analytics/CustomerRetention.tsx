import { useState, useEffect } from "react";
import { apiService } from "../../services/api";

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

interface CustomerRetentionProps {
  period: string;
}

export default function CustomerRetention({ period }: CustomerRetentionProps) {
  const [data, setData] = useState<CustomerRetentionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getCustomerRetention(period);
        if (response.data) {
          setData(response.data);
        }
      } catch (err) {
        console.error('Error fetching customer retention data:', err);
        setError('Failed to load customer retention data');
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
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading customer retention data...</span>
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
      {/* Customer Segments */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <span className="text-blue-600 dark:text-blue-300">🆕</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">New Customers</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {data.segments.newCustomers}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <span className="text-green-600 dark:text-green-300">🔄</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Returning</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {data.segments.returningCustomers}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <span className="text-purple-600 dark:text-purple-300">💎</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loyal</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {data.segments.loyalCustomers}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                <span className="text-yellow-600 dark:text-yellow-300">👑</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">VIP</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {data.segments.vipCustomers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Retention Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Customers</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {data.totalCustomers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</span>
              <span className={`text-lg font-semibold ${data.churnRate > 20 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {data.churnRate}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Orders/Customer</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {data.averageOrdersPerCustomer}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Customer Value</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(data.averageCustomerValue)}
              </span>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="md:col-span-2 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Customers by Value
          </h3>
          <div className="space-y-3">
            {data.topCustomers.slice(0, 8).map((customer, index) => (
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
      </div>
    </div>
  );
}
