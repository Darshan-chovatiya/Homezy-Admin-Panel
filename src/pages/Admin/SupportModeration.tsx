import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

interface SupportTicket {
  id: string;
  type: "dispute" | "complaint" | "refund" | "technical" | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  subject: string;
  description: string;
  customerName: string;
  customerEmail: string;
  servicePartnerName?: string;
  servicePartnerEmail?: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: string;
  attachments?: string[];
}

interface Dispute {
  id: string;
  bookingId: string;
  customerName: string;
  servicePartnerName: string;
  serviceName: string;
  disputeType: "service_quality" | "payment" | "behavior" | "cancellation" | "other";
  description: string;
  customerEvidence?: string[];
  servicePartnerEvidence?: string[];
  status: "pending" | "investigating" | "resolved" | "escalated";
  resolution?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

const dummyTickets: SupportTicket[] = [
  {
    id: "ST001",
    type: "dispute",
    priority: "high",
    status: "open",
    subject: "Service quality dispute - House Cleaning",
    description: "Customer claims the cleaning service was not thorough and left areas dirty. Service partner disputes this claim.",
    customerName: "John Doe",
    customerEmail: "john.doe@email.com",
    servicePartnerName: "Sarah Johnson",
    servicePartnerEmail: "sarah.johnson@email.com",
    bookingId: "BK001",
    createdAt: "2024-03-26T10:30:00Z",
    updatedAt: "2024-03-26T10:30:00Z",
    attachments: ["photo1.jpg", "photo2.jpg"]
  },
  {
    id: "ST002",
    type: "refund",
    priority: "medium",
    status: "in_progress",
    subject: "Refund request for cancelled booking",
    description: "Customer requesting refund for booking cancelled due to service partner no-show.",
    customerName: "Emily Davis",
    customerEmail: "emily.davis@email.com",
    servicePartnerName: "Mike Wilson",
    servicePartnerEmail: "mike.wilson@email.com",
    bookingId: "BK002",
    createdAt: "2024-03-25T14:20:00Z",
    updatedAt: "2024-03-26T09:15:00Z",
    assignedTo: "Admin User"
  },
  {
    id: "ST003",
    type: "complaint",
    priority: "low",
    status: "resolved",
    subject: "Service partner behavior complaint",
    description: "Customer complained about unprofessional behavior from service partner during service.",
    customerName: "Robert Smith",
    customerEmail: "robert.smith@email.com",
    servicePartnerName: "David Brown",
    servicePartnerEmail: "david.brown@email.com",
    bookingId: "BK003",
    createdAt: "2024-03-24T16:45:00Z",
    updatedAt: "2024-03-25T11:30:00Z",
    assignedTo: "Admin User",
    resolution: "Service partner has been warned and customer has been compensated with a discount for future services."
  },
  {
    id: "ST004",
    type: "technical",
    priority: "medium",
    status: "open",
    subject: "App login issues",
    description: "Customer unable to login to the mobile app, getting error message.",
    customerName: "Lisa Anderson",
    customerEmail: "lisa.anderson@email.com",
    createdAt: "2024-03-26T08:15:00Z",
    updatedAt: "2024-03-26T08:15:00Z"
  },
  {
    id: "ST005",
    type: "general",
    priority: "low",
    status: "closed",
    subject: "General inquiry about service availability",
    description: "Customer asking about availability of landscaping services in their area.",
    customerName: "Michael Johnson",
    customerEmail: "michael.johnson@email.com",
    createdAt: "2024-03-23T12:00:00Z",
    updatedAt: "2024-03-23T15:30:00Z",
    assignedTo: "Support Agent",
    resolution: "Provided information about available landscaping services and scheduled a consultation."
  }
];

const dummyDisputes: Dispute[] = [
  {
    id: "DP001",
    bookingId: "BK001",
    customerName: "John Doe",
    servicePartnerName: "Sarah Johnson",
    serviceName: "House Cleaning",
    disputeType: "service_quality",
    description: "Customer claims the cleaning was incomplete and left visible dirt in corners and under furniture. Service partner maintains the service was completed as per standards.",
    customerEvidence: ["before_photo1.jpg", "after_photo1.jpg", "dirty_corner.jpg"],
    servicePartnerEvidence: ["completion_photo1.jpg", "completion_photo2.jpg"],
    status: "investigating",
    createdAt: "2024-03-26T10:30:00Z",
    updatedAt: "2024-03-26T14:20:00Z"
  },
  {
    id: "DP002",
    bookingId: "BK005",
    customerName: "Michael Johnson",
    servicePartnerName: "Mike Wilson",
    serviceName: "Landscaping",
    disputeType: "service_quality",
    description: "Customer dissatisfied with landscaping work, claims plants were not properly installed and some died within a week.",
    customerEvidence: ["dead_plants.jpg", "poor_installation.jpg"],
    servicePartnerEvidence: ["installation_photos.jpg", "care_instructions.jpg"],
    status: "pending",
    createdAt: "2024-03-26T16:45:00Z",
    updatedAt: "2024-03-26T16:45:00Z"
  }
];

export default function SupportModeration() {
  const [tickets, setTickets] = useState<SupportTicket[]>(dummyTickets);
  const [disputes, setDisputes] = useState<Dispute[]>(dummyDisputes);
  const [activeTab, setActiveTab] = useState<"tickets" | "disputes">("tickets");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "in_progress" | "resolved" | "closed">("all");
  const [filterPriority, setFilterPriority] = useState<"all" | "low" | "medium" | "high" | "urgent">("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    const matchesPriority = filterPriority === "all" || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || dispute.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleTicketStatusChange = (ticketId: string, newStatus: SupportTicket["status"]) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() } : ticket
    ));
  };

  const handleDisputeStatusChange = (disputeId: string, newStatus: Dispute["status"]) => {
    setDisputes(disputes.map(dispute => 
      dispute.id === disputeId ? { ...dispute, status: newStatus, updatedAt: new Date().toISOString() } : dispute
    ));
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      open: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      closed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      pending: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      investigating: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      escalated: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses = {
      low: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityClasses[priority as keyof typeof priorityClasses]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeClasses = {
      dispute: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      complaint: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      refund: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      technical: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      general: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeClasses[type as keyof typeof typeClasses]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getStats = () => {
    const openTickets = tickets.filter(t => t.status === "open").length;
    const inProgressTickets = tickets.filter(t => t.status === "in_progress").length;
    const resolvedTickets = tickets.filter(t => t.status === "resolved").length;
    const pendingDisputes = disputes.filter(d => d.status === "pending").length;

    return { openTickets, inProgressTickets, resolvedTickets, pendingDisputes };
  };

  const stats = getStats();

  return (
    <>
      <PageMeta
        title="Support & Moderation | Homezy Admin Panel"
        description="Manage support tickets and resolve disputes on the Homezy platform"
      />
      <PageBreadcrumb pageTitle="Support & Moderation" />
      
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                  <span className="text-red-600 dark:text-red-300">🔴</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Tickets</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.openTickets}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                  <span className="text-yellow-600 dark:text-yellow-300">🟡</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.inProgressTickets}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <span className="text-green-600 dark:text-green-300">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.resolvedTickets}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <span className="text-orange-600 dark:text-orange-300">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Disputes</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pendingDisputes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Support & Moderation
            </h3>
            <div className="flex gap-2">
              <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                Export Reports
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("tickets")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "tickets"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Support Tickets ({tickets.length})
              </button>
              <button
                onClick={() => setActiveTab("disputes")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "disputes"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Disputes ({disputes.length})
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by ID, subject, or customer name..."
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
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
              </select>
              {activeTab === "tickets" && (
                <select
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              )}
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === "tickets" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Ticket ID</th>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3">Subject</th>
                    <th scope="col" className="px-6 py-3">Customer</th>
                    <th scope="col" className="px-6 py-3">Priority</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Created</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {ticket.id}
                        </div>
                        {ticket.bookingId && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Booking: {ticket.bookingId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getTypeBadge(ticket.type)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate text-gray-900 dark:text-white">
                          {ticket.subject}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {ticket.description.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {ticket.customerName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {ticket.customerEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(ticket.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowModal(true);
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            View
                          </button>
                          <select
                            value={ticket.status}
                            onChange={(e) => handleTicketStatusChange(ticket.id, e.target.value as SupportTicket["status"])}
                            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Dispute ID</th>
                    <th scope="col" className="px-6 py-3">Booking</th>
                    <th scope="col" className="px-6 py-3">Service</th>
                    <th scope="col" className="px-6 py-3">Customer</th>
                    <th scope="col" className="px-6 py-3">Service Partner</th>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Created</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDisputes.map((dispute) => (
                    <tr key={dispute.id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {dispute.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {dispute.bookingId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {dispute.serviceName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {dispute.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {dispute.servicePartnerName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                          {dispute.disputeType.replace("_", " ").charAt(0).toUpperCase() + dispute.disputeType.replace("_", " ").slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(dispute.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(dispute.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setShowModal(true);
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            View
                          </button>
                          <select
                            value={dispute.status}
                            onChange={(e) => handleDisputeStatusChange(dispute.id, e.target.value as Dispute["status"])}
                            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                            <option value="escalated">Escalated</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(activeTab === "tickets" ? filteredTickets : filteredDisputes).length === 0 && (
            <div className="py-12 text-center">
              <div className="text-gray-500 dark:text-gray-400">No {activeTab} found matching your criteria.</div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && (selectedTicket || selectedDispute) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedTicket ? `Ticket Details - ${selectedTicket.id}` : `Dispute Details - ${selectedDispute?.id}`}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {selectedTicket && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Ticket Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Type:</strong> {getTypeBadge(selectedTicket.type)}</div>
                        <div><strong>Priority:</strong> {getPriorityBadge(selectedTicket.priority)}</div>
                        <div><strong>Status:</strong> {getStatusBadge(selectedTicket.status)}</div>
                        <div><strong>Created:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</div>
                        <div><strong>Updated:</strong> {new Date(selectedTicket.updatedAt).toLocaleString()}</div>
                        {selectedTicket.assignedTo && (
                          <div><strong>Assigned To:</strong> {selectedTicket.assignedTo}</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Name:</strong> {selectedTicket.customerName}</div>
                        <div><strong>Email:</strong> {selectedTicket.customerEmail}</div>
                        {selectedTicket.servicePartnerName && (
                          <>
                            <div><strong>Service Partner:</strong> {selectedTicket.servicePartnerName}</div>
                            <div><strong>SP Email:</strong> {selectedTicket.servicePartnerEmail}</div>
                          </>
                        )}
                        {selectedTicket.bookingId && (
                          <div><strong>Booking ID:</strong> {selectedTicket.bookingId}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Subject</h4>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedTicket.subject}</p>
                  </div>

                  <div>
                    <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Description</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTicket.description}</p>
                  </div>

                  {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                    <div>
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Attachments</h4>
                      <div className="flex gap-2">
                        {selectedTicket.attachments.map((attachment, index) => (
                          <span key={index} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {attachment}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTicket.resolution && (
                    <div>
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Resolution</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTicket.resolution}</p>
                    </div>
                  )}
                </>
              )}

              {selectedDispute && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Dispute Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Booking ID:</strong> {selectedDispute.bookingId}</div>
                        <div><strong>Service:</strong> {selectedDispute.serviceName}</div>
                        <div><strong>Type:</strong> {selectedDispute.disputeType.replace("_", " ")}</div>
                        <div><strong>Status:</strong> {getStatusBadge(selectedDispute.status)}</div>
                        <div><strong>Created:</strong> {new Date(selectedDispute.createdAt).toLocaleString()}</div>
                        <div><strong>Updated:</strong> {new Date(selectedDispute.updatedAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Parties Involved</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Customer:</strong> {selectedDispute.customerName}</div>
                        <div><strong>Service Partner:</strong> {selectedDispute.servicePartnerName}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Dispute Description</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDispute.description}</p>
                  </div>

                  {selectedDispute.customerEvidence && selectedDispute.customerEvidence.length > 0 && (
                    <div>
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Customer Evidence</h4>
                      <div className="flex gap-2">
                        {selectedDispute.customerEvidence.map((evidence, index) => (
                          <span key={index} className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                            {evidence}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDispute.servicePartnerEvidence && selectedDispute.servicePartnerEvidence.length > 0 && (
                    <div>
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Service Partner Evidence</h4>
                      <div className="flex gap-2">
                        {selectedDispute.servicePartnerEvidence.map((evidence, index) => (
                          <span key={index} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {evidence}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDispute.resolution && (
                    <div>
                      <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Resolution</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDispute.resolution}</p>
                      {selectedDispute.refundAmount && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Refund Amount:</strong> ${selectedDispute.refundAmount}
                        </p>
                      )}
                    </div>
                  )}
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
                  {selectedTicket ? "Update Ticket" : "Resolve Dispute"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
