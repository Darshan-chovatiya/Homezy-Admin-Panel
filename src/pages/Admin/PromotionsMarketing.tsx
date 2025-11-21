import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

interface Promotion {
  id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed_amount" | "free_service";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  status: "active" | "inactive" | "expired";
  targetAudience: "all" | "new_users" | "existing_users" | "service_partners";
  applicableServices: string[];
  description: string;
  createdAt: string;
  createdBy: string;
}

interface Campaign {
  id: string;
  name: string;
  type: "email" | "push" | "sms" | "in_app";
  status: "draft" | "scheduled" | "active" | "completed" | "cancelled";
  targetAudience: "all" | "customers" | "service_partners" | "specific_segment";
  subject?: string;
  content: string;
  scheduledAt?: string;
  sentAt?: string;
  totalRecipients: number;
  openedCount?: number;
  clickedCount?: number;
  conversionCount?: number;
  createdAt: string;
  createdBy: string;
}

const dummyPromotions: Promotion[] = [
  {
    id: "PROMO001",
    name: "New User Welcome Discount",
    code: "WELCOME20",
    type: "percentage",
    value: 20,
    minOrderAmount: 50,
    maxDiscount: 100,
    usageLimit: 1000,
    usedCount: 234,
    validFrom: "2024-01-01",
    validUntil: "2024-12-31",
    status: "active",
    targetAudience: "new_users",
    applicableServices: ["House Cleaning", "Plumbing Repair", "Electrical Work"],
    description: "20% discount for new users on their first booking",
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "Admin User"
  },
  {
    id: "PROMO002",
    name: "Spring Cleaning Special",
    code: "SPRING50",
    type: "fixed_amount",
    value: 50,
    minOrderAmount: 100,
    usageLimit: 500,
    usedCount: 89,
    validFrom: "2024-03-01",
    validUntil: "2024-05-31",
    status: "active",
    targetAudience: "all",
    applicableServices: ["House Cleaning", "Deep Cleaning"],
    description: "$50 off on cleaning services during spring season",
    createdAt: "2024-02-15T00:00:00Z",
    createdBy: "Marketing Team"
  },
  {
    id: "PROMO003",
    name: "Service Partner Bonus",
    code: "PARTNER10",
    type: "percentage",
    value: 10,
    usageLimit: 200,
    usedCount: 45,
    validFrom: "2024-02-01",
    validUntil: "2024-04-30",
    status: "active",
    targetAudience: "service_partners",
    applicableServices: ["All Services"],
    description: "10% bonus for service partners on completed jobs",
    createdAt: "2024-01-20T00:00:00Z",
    createdBy: "Admin User"
  },
  {
    id: "PROMO004",
    name: "Emergency Service Discount",
    code: "EMERGENCY25",
    type: "percentage",
    value: 25,
    minOrderAmount: 75,
    usageLimit: 100,
    usedCount: 12,
    validFrom: "2024-03-15",
    validUntil: "2024-06-15",
    status: "active",
    targetAudience: "existing_users",
    applicableServices: ["Plumbing Repair", "Electrical Work", "HVAC Service"],
    description: "25% discount on emergency services for existing customers",
    createdAt: "2024-03-10T00:00:00Z",
    createdBy: "Admin User"
  },
  {
    id: "PROMO005",
    name: "Holiday Special",
    code: "HOLIDAY30",
    type: "percentage",
    value: 30,
    minOrderAmount: 100,
    maxDiscount: 150,
    usageLimit: 300,
    usedCount: 300,
    validFrom: "2023-12-01",
    validUntil: "2023-12-31",
    status: "expired",
    targetAudience: "all",
    applicableServices: ["All Services"],
    description: "30% discount during holiday season",
    createdAt: "2023-11-15T00:00:00Z",
    createdBy: "Marketing Team"
  }
];

const dummyCampaigns: Campaign[] = [
  {
    id: "CAMP001",
    name: "New Service Launch Email",
    type: "email",
    status: "completed",
    targetAudience: "customers",
    subject: "Introducing Our New Landscaping Services!",
    content: "We're excited to announce our new landscaping services. Book now and get 20% off your first landscaping project!",
    scheduledAt: "2024-03-20T10:00:00Z",
    sentAt: "2024-03-20T10:00:00Z",
    totalRecipients: 1250,
    openedCount: 456,
    clickedCount: 123,
    conversionCount: 45,
    createdAt: "2024-03-18T00:00:00Z",
    createdBy: "Marketing Team"
  },
  {
    id: "CAMP002",
    name: "Service Partner Appreciation",
    type: "push",
    status: "active",
    targetAudience: "service_partners",
    content: "Thank you for being an amazing service partner! Check out your earnings dashboard for this month's bonus.",
    scheduledAt: "2024-03-25T09:00:00Z",
    sentAt: "2024-03-25T09:00:00Z",
    totalRecipients: 340,
    openedCount: 289,
    clickedCount: 156,
    conversionCount: 89,
    createdAt: "2024-03-22T00:00:00Z",
    createdBy: "Admin User"
  },
  {
    id: "CAMP003",
    name: "Weekly Newsletter",
    type: "email",
    status: "scheduled",
    targetAudience: "customers",
    subject: "This Week's Home Maintenance Tips",
    content: "Get expert tips on maintaining your home and discover our featured services of the week.",
    scheduledAt: "2024-03-28T08:00:00Z",
    totalRecipients: 1250,
    createdAt: "2024-03-26T00:00:00Z",
    createdBy: "Marketing Team"
  },
  {
    id: "CAMP004",
    name: "SMS Reminder Campaign",
    type: "sms",
    status: "draft",
    targetAudience: "specific_segment",
    content: "Don't forget! Your service appointment is tomorrow at 10 AM. Reply STOP to opt out.",
    totalRecipients: 0,
    createdAt: "2024-03-25T00:00:00Z",
    createdBy: "Admin User"
  }
];

export default function PromotionsMarketing() {
  const [promotions, setPromotions] = useState<Promotion[]>(dummyPromotions);
  const [campaigns, setCampaigns] = useState<Campaign[]>(dummyCampaigns);
  const [activeTab, setActiveTab] = useState<"promotions" | "campaigns">("promotions");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "expired">("all");
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || promotion.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || campaign.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handlePromotionStatusChange = (promotionId: string, newStatus: Promotion["status"]) => {
    setPromotions(promotions.map(promotion => 
      promotion.id === promotionId ? { ...promotion, status: newStatus } : promotion
    ));
  };

  const handleCampaignStatusChange = (campaignId: string, newStatus: Campaign["status"]) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === campaignId ? { ...campaign, status: newStatus } : campaign
    ));
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeClasses = {
      percentage: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      fixed_amount: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      free_service: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      email: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      push: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      sms: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      in_app: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeClasses[type as keyof typeof typeClasses]}`}>
        {type.replace("_", " ").charAt(0).toUpperCase() + type.replace("_", " ").slice(1)}
      </span>
    );
  };

  const getTargetAudienceBadge = (audience: string) => {
    const audienceClasses = {
      all: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      new_users: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      existing_users: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      service_partners: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      customers: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      specific_segment: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${audienceClasses[audience as keyof typeof audienceClasses]}`}>
        {audience.replace("_", " ").charAt(0).toUpperCase() + audience.replace("_", " ").slice(1)}
      </span>
    );
  };

  const getStats = () => {
    const activePromotions = promotions.filter(p => p.status === "active").length;
    const totalPromotionUsage = promotions.reduce((sum, p) => sum + p.usedCount, 0);
    const activeCampaigns = campaigns.filter(c => c.status === "active" || c.status === "scheduled").length;
    const totalCampaignReach = campaigns.reduce((sum, c) => sum + c.totalRecipients, 0);

    return { activePromotions, totalPromotionUsage, activeCampaigns, totalCampaignReach };
  };

  const stats = getStats();

  return (
    <>
      <PageMeta
        title="Promotions & Marketing | Homezy Admin Panel"
        description="Manage promotions, discount codes, and marketing campaigns on the Homezy platform"
      />
      <PageBreadcrumb pageTitle="Promotions & Marketing" />
      
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <span className="text-green-600 dark:text-green-300">🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Promotions</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activePromotions}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <span className="text-[#013365] dark:text-blue-300">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Usage</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalPromotionUsage}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <span className="text-purple-600 dark:text-purple-300">📢</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Campaigns</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activeCampaigns}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <span className="text-orange-600 dark:text-orange-300">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reach</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalCampaignReach.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Promotions & Marketing
            </h3>
            <div className="flex gap-2">
              <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                Export Data
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Create {activeTab === "promotions" ? "Promotion" : "Campaign"}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("promotions")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "promotions"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Promotions ({promotions.length})
              </button>
              <button
                onClick={() => setActiveTab("campaigns")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "campaigns"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Marketing Campaigns ({campaigns.length})
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <input
                type="text"
                placeholder={`Search ${activeTab} by name, code, or description...`}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "promotions" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPromotions.map((promotion) => (
                <div key={promotion.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {promotion.name}
                      </h4>
                      <div className="mt-1 flex items-center gap-2">
                        {getStatusBadge(promotion.status)}
                        {getTypeBadge(promotion.type)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {promotion.type === "percentage" ? `${promotion.value}%` : `$${promotion.value}`}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Code: {promotion.code}
                      </div>
                    </div>
                  </div>

                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {promotion.description}
                  </p>

                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Usage:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {promotion.usedCount}/{promotion.usageLimit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Valid Until:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(promotion.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Target:</span>
                      {getTargetAudienceBadge(promotion.targetAudience)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPromotion(promotion);
                        setShowModal(true);
                      }}
                      className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                    >
                      View Details
                    </button>
                    <select
                      value={promotion.status}
                      onChange={(e) => handlePromotionStatusChange(promotion.id, e.target.value as Promotion["status"])}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Campaign</th>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3">Target Audience</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Recipients</th>
                    <th scope="col" className="px-6 py-3">Performance</th>
                    <th scope="col" className="px-6 py-3">Scheduled</th>
                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {campaign.name}
                        </div>
                        {campaign.subject && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {campaign.subject}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getTypeBadge(campaign.type)}
                      </td>
                      <td className="px-6 py-4">
                        {getTargetAudienceBadge(campaign.targetAudience)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(campaign.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {campaign.totalRecipients.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {campaign.openedCount && campaign.clickedCount ? (
                          <div className="text-sm">
                            <div>Opened: {campaign.openedCount}</div>
                            <div>Clicked: {campaign.clickedCount}</div>
                            <div className="text-green-600 dark:text-green-400">
                              Conversion: {campaign.conversionCount || 0}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleDateString() : "-"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleTimeString() : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setShowModal(true);
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            View
                          </button>
                          <select
                            value={campaign.status}
                            onChange={(e) => handleCampaignStatusChange(campaign.id, e.target.value as Campaign["status"])}
                            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(activeTab === "promotions" ? filteredPromotions : filteredCampaigns).length === 0 && (
            <div className="py-12 text-center">
              <div className="text-gray-500 dark:text-gray-400">No {activeTab} found matching your criteria.</div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && (selectedPromotion || selectedCampaign) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-3xl rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedPromotion ? `Promotion Details - ${selectedPromotion.name}` : `Campaign Details - ${selectedCampaign?.name}`}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {selectedPromotion && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Promotion Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Code:</strong> {selectedPromotion.code}</div>
                        <div><strong>Type:</strong> {getTypeBadge(selectedPromotion.type)}</div>
                        <div><strong>Value:</strong> {selectedPromotion.type === "percentage" ? `${selectedPromotion.value}%` : `$${selectedPromotion.value}`}</div>
                        <div><strong>Status:</strong> {getStatusBadge(selectedPromotion.status)}</div>
                        <div><strong>Target:</strong> {getTargetAudienceBadge(selectedPromotion.targetAudience)}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Usage & Validity</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Usage:</strong> {selectedPromotion.usedCount}/{selectedPromotion.usageLimit}</div>
                        <div><strong>Valid From:</strong> {new Date(selectedPromotion.validFrom).toLocaleDateString()}</div>
                        <div><strong>Valid Until:</strong> {new Date(selectedPromotion.validUntil).toLocaleDateString()}</div>
                        {selectedPromotion.minOrderAmount && (
                          <div><strong>Min Order:</strong> ${selectedPromotion.minOrderAmount}</div>
                        )}
                        {selectedPromotion.maxDiscount && (
                          <div><strong>Max Discount:</strong> ${selectedPromotion.maxDiscount}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Description</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPromotion.description}</p>
                  </div>

                  <div>
                    <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Applicable Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPromotion.applicableServices.map((service, index) => (
                        <span key={index} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedCampaign && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Campaign Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Type:</strong> {getTypeBadge(selectedCampaign.type)}</div>
                        <div><strong>Status:</strong> {getStatusBadge(selectedCampaign.status)}</div>
                        <div><strong>Target:</strong> {getTargetAudienceBadge(selectedCampaign.targetAudience)}</div>
                        <div><strong>Recipients:</strong> {selectedCampaign.totalRecipients.toLocaleString()}</div>
                        <div><strong>Created:</strong> {new Date(selectedCampaign.createdAt).toLocaleString()}</div>
                        <div><strong>Created By:</strong> {selectedCampaign.createdBy}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Performance</h4>
                      <div className="space-y-2 text-sm">
                        {selectedCampaign.openedCount && (
                          <div><strong>Opened:</strong> {selectedCampaign.openedCount}</div>
                        )}
                        {selectedCampaign.clickedCount && (
                          <div><strong>Clicked:</strong> {selectedCampaign.clickedCount}</div>
                        )}
                        {selectedCampaign.conversionCount && (
                          <div><strong>Conversions:</strong> {selectedCampaign.conversionCount}</div>
                        )}
                        {selectedCampaign.scheduledAt && (
                          <div><strong>Scheduled:</strong> {new Date(selectedCampaign.scheduledAt).toLocaleString()}</div>
                        )}
                        {selectedCampaign.sentAt && (
                          <div><strong>Sent:</strong> {new Date(selectedCampaign.sentAt).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedCampaign.subject && (
                    <div>
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Subject</h4>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedCampaign.subject}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Content</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCampaign.content}</p>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                  {selectedPromotion ? "Edit Promotion" : "Edit Campaign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New {activeTab === "promotions" ? "Promotion" : "Campaign"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <form className="space-y-4">
              {activeTab === "promotions" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Promotion Name
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter promotion name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Promo Code
                      </label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter promo code"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </label>
                      <select className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        <option value="percentage">Percentage</option>
                        <option value="fixed_amount">Fixed Amount</option>
                        <option value="free_service">Free Service</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Value
                      </label>
                      <input
                        type="number"
                        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter value"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter promotion description"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter campaign name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </label>
                      <select className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        <option value="email">Email</option>
                        <option value="push">Push Notification</option>
                        <option value="sms">SMS</option>
                        <option value="in_app">In-App</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Target Audience
                      </label>
                      <select className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        <option value="all">All Users</option>
                        <option value="customers">Customers</option>
                        <option value="service_partners">Service Partners</option>
                        <option value="specific_segment">Specific Segment</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subject (for email)
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter email subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Content
                    </label>
                    <textarea
                      rows={4}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter campaign content"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                >
                  Create {activeTab === "promotions" ? "Promotion" : "Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
