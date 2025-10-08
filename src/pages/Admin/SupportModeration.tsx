import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import apiService, { CreateDisputeRequest, DisputeStats } from "../../services/api";
import Swal from "sweetalert2";

// Updated Dispute interface to match backend response
interface Dispute {
  _id: string;
  customerId: {
    _id: string;
    name: string;
  };
  servicePartnerId: {
    _id: string;
    name: string;
  };
  serviceId: {
    _id: string;
    name: string;
  };
  description: string;
  customerEvidence: string[];
  servicePartnerEvidence: string[];
  status: 'open' | 'closed' | 'inProgress' | 'reopen';
  resolution?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
  __v?: string;
  // Populated fields
  customerName: string;
  servicePartnerName: string;
  serviceName: string;
}


// Using the Dispute interface from the API service



export default function SupportModeration() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<DisputeStats>({
    openDisputes: 0,
    inProgressDisputes: 0,
    closedDisputes: 0,
    reopenDisputes: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed" | "inProgress" | "reopen">("all");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newDispute, setNewDispute] = useState<CreateDisputeRequest>({
    customerId: "",
    servicePartnerId: "",
    serviceId: "",
    description: ""
  });

  // Helper function to format IDs safely
  const formatId = (id: any): string => {
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id !== null) {
      return id._id || id.$oid || id.toString();
    }
    return String(id);
  };

  // Load disputes and stats on component mount
  useEffect(() => {
    loadDisputes();
    loadStats();
  }, []);

  // Load disputes when filters change
  useEffect(() => {
    loadDisputes();
  }, [filterStatus, searchTerm]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== "all") params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;
      
      const response = await apiService.getAllDisputes(params);
      setDisputes(response.data as unknown as Dispute[]);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to load disputes'
      });
      console.error('Error loading disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getDisputeStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    const disputeId = formatId(dispute._id);
    const customerId = formatId(dispute.customerId._id);
    const servicePartnerId = formatId(dispute.servicePartnerId._id);
    const serviceId = formatId(dispute.serviceId._id);
    
    const matchesSearch = disputeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.servicePartnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servicePartnerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dispute.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || dispute.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleDisputeStatusChange = async (disputeId: string, newStatus: Dispute["status"]) => {
    try {
      setLoading(true);
      const response = await apiService.updateDisputeStatus(disputeId, { status: newStatus });
      setDisputes(disputes.map(dispute => 
        formatId(dispute._id) === disputeId ? response.data as unknown as Dispute : dispute
      ));
      // Reload stats to reflect changes
      loadStats();
      
      Swal.fire({
        icon: 'success',
        title: 'Status Updated!',
        text: `Dispute status has been updated to ${newStatus === "inProgress" ? "In Progress" : newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to update dispute status'
      });
      console.error("Error updating dispute status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDispute = async () => {
    try {
      setLoading(true);
      const response = await apiService.createDispute(newDispute);
      setDisputes([response.data as unknown as Dispute, ...disputes]);
      setNewDispute({
        customerId: "",
        servicePartnerId: "",
        serviceId: "",
        description: ""
      });
      setShowAddModal(false);
      // Reload stats to reflect changes
      loadStats();
      
      Swal.fire({
        icon: 'success',
        title: 'Dispute Created!',
        text: 'New dispute has been created successfully',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to create dispute'
      });
      console.error("Error adding dispute:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDispute = async (disputeId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) {
      return;
    }
    
    try {
      setLoading(true);
      await apiService.deleteDispute(disputeId);
      setDisputes(disputes.filter(dispute => formatId(dispute._id) !== disputeId));
      // Reload stats to reflect changes
      loadStats();
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Dispute has been deleted successfully',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to delete dispute'
      });
      console.error("Error deleting dispute:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      open: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      inProgress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      closed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      reopen: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status === "inProgress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <>
      <PageMeta
        title="Dispute Management | Homezy Admin Panel"
        description="Manage and resolve disputes on the Homezy platform"
      />
      <PageBreadcrumb pageTitle="Dispute Management" />
      
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Disputes</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.openDisputes}</p>
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
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.inProgressDisputes}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Closed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.closedDisputes}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <span className="text-orange-600 dark:text-orange-300">🔄</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reopened</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.reopenDisputes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Dispute Management
            </h3>
            <div className="flex gap-2">
              
              {/* <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                Export Reports
              </button> */}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by dispute ID, customer name, service name, service partner name, description, or any ID..."
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
                <option value="inProgress">In Progress</option>
                <option value="closed">Closed</option>
                <option value="reopen">Reopen</option>
              </select>
            </div>
          </div>

          {/* Disputes Table */}
            <div className="overflow-x-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500 dark:text-gray-400">Loading disputes...</div>
                          </div>
                        )}
            {!loading && (
              <>
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Service</th>
                    <th scope="col" className="px-6 py-3">Customer</th>
                    <th scope="col" className="px-6 py-3">Service Partner</th>
                    <th scope="col" className="px-6 py-3">Description</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Created</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDisputes.map((dispute) => (
                      <tr key={formatId(dispute._id)} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {dispute.serviceName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm  text-gray-900 dark:text-white">
                          {dispute.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm  text-gray-900 dark:text-white">
                          {dispute.servicePartnerName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                          <p className="truncate" title={dispute.description}>
                            {dispute.description.length > 30 ? `${dispute.description.substring(0, 30)}...` : dispute.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={dispute.status}
                          onChange={(e) => handleDisputeStatusChange(formatId(dispute._id), e.target.value as Dispute["status"])}
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="open">Open</option>
                          <option value="inProgress">In Progress</option>
                          <option value="closed">Closed</option>
                          <option value="reopen">Reopen</option>
                        </select>
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
                            className="border rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                            title="View Details"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteDispute(formatId(dispute._id))}
                            className="border rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                            title="Delete Dispute"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

                {filteredDisputes.length === 0 && (
            <div className="py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">No disputes found matching your criteria.</div>
            </div>
          )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
{showModal && selectedDispute && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-60 p-4">
    <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Dispute Details
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {/* Dispute & Parties Information */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Dispute Information Card */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Dispute Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Service:</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedDispute.serviceName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                  <span>{getStatusBadge(selectedDispute.status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedDispute.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Updated:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedDispute.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Parties Involved Card */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Parties Involved
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedDispute.customerName}
                  </div>
                  
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Service Partner</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedDispute.servicePartnerName}
                  </div>
                
                </div>
              </div>
            </div>
          </div>

          {/* Dispute Description */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
              Dispute Description
            </h4>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {selectedDispute.description}
            </p>
          </div>

          {/* Customer Evidence */}
          {selectedDispute.customerEvidence && selectedDispute.customerEvidence.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Customer Evidence
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {selectedDispute.customerEvidence.map((evidence, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-600"
                  >
                    <img
                      src={apiService.resolveImageUrl(evidence)}
                      alt={`Customer Evidence ${index + 1}`}
                      className="h-28 w-full cursor-pointer object-cover transition-transform duration-200 group-hover:scale-105"
                      onClick={() => window.open(apiService.resolveImageUrl(evidence), '_blank')}
                    />
                    <div className="absolute inset-0 bg-black opacity-0 transition-opacity group-hover:opacity-10"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Partner Evidence */}
          {selectedDispute.servicePartnerEvidence && selectedDispute.servicePartnerEvidence.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Service Partner Evidence
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedDispute.servicePartnerEvidence.map((evidence, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {evidence}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Resolution */}
          {selectedDispute.resolution && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                Resolution
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {selectedDispute.resolution}
              </p>
              {selectedDispute.refundAmount && (
                <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Refund Amount: </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    ${selectedDispute.refundAmount}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex justify-end">
          <button
            onClick={() => setShowModal(false)}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Add Dispute Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add New Dispute
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Customer ID
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  value={newDispute.customerId}
                  onChange={(e) => setNewDispute({...newDispute, customerId: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service Partner ID
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  value={newDispute.servicePartnerId}
                  onChange={(e) => setNewDispute({...newDispute, servicePartnerId: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service ID
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  value={newDispute.serviceId}
                  onChange={(e) => setNewDispute({...newDispute, serviceId: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  value={newDispute.description}
                  onChange={(e) => setNewDispute({...newDispute, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddDispute}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                >
                  Add Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
