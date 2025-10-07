import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import vendorService, { Vendor } from "../../services/vendor";

export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  // Add Vendor Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessDescription: ""
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getAllVendors({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        isActive: filterStatus === "all" ? undefined : filterStatus === "active"
      });

      if (response.data) {
        setVendors(response.data.docs);
        setTotalPages(response.data.totalPages);
        setTotalDocs(response.data.totalDocs);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [currentPage, searchTerm, filterStatus]);

  // Handle status change
  const handleStatusChange = async (vendorId: string, isActive: boolean) => {
    try {
      await vendorService.updateVendor({
        vendorId,
        isActive
      });
      fetchVendors();
    } catch (error) {
      console.error("Error updating vendor status:", error);
    }
  };

  // Handle delete
  const handleDelete = async (vendorId: string) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      try {
        await vendorService.deleteVendor(vendorId);
        fetchVendors();
      } catch (error) {
        console.error("Error deleting vendor:", error);
      }
    }
  };

  // Handle Add Vendor
  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      await vendorService.createVendor(formData);
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        businessName: "",
        businessDescription: ""
      });
      fetchVendors();
      alert("Vendor created successfully!");
    } catch (error) {
      console.error("Error creating vendor:", error);
      alert("Failed to create vendor. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        isActive 
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      }`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <>
      <PageMeta
        title="Vendor Management | Admin Panel"
        description="Manage vendors on the platform"
      />
      <PageBreadcrumb pageTitle="Vendor Management" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Vendor Management
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Vendors: {totalDocs}
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-md"
          >
            + Add Vendor
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search vendors by name, email, or phone..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">Loading vendors...</div>
          </div>
        ) : (
          <>
            {/* Vendors Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Vendor</th>
                    <th scope="col" className="px-6 py-3">Business</th>
                    <th scope="col" className="px-6 py-3">Contact</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Rating</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor._id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {vendor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {vendor.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {vendor.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {vendor.businessName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {vendor.businessDescription?.substring(0, 50) || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {vendor.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(vendor.isActive)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          ⭐ {vendor.overallRating || 0} ({vendor.totalRatings || 0})
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {vendor.completedJobs || 0} jobs
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setShowModal(true);
                            }}
                            className="text-primary hover:text-primary/80 text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleStatusChange(vendor._id, !vendor.isActive)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {vendor.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(vendor._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {vendors.length === 0 && (
              <div className="py-12 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  No vendors found matching your criteria.
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
  <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Add New Vendor
      </h3>
      <button
        onClick={() => setShowAddModal(false)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
      >
        ✕
      </button>
    </div>

    <form onSubmit={handleAddVendor} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm 
          focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary 
          dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Enter vendor name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm 
          focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary 
          dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Enter email address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm 
          focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary 
          dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Enter phone number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm 
          focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary 
          dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Enter business name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Business Description
        </label>
        <textarea
          rows={3}
          value={formData.businessDescription}
          onChange={(e) =>
            setFormData({ ...formData, businessDescription: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm 
          focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary 
          dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Enter business description (optional)"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
        <button
          type="button"
          onClick={() => setShowAddModal(false)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium 
          text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 
          dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formLoading}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white 
          shadow hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 
          disabled:cursor-not-allowed"
        >
          {formLoading ? "Creating..." : "Create Vendor"}
        </button>
      </div>
    </form>
  </div>
</div>

      )}

      {/* Vendor Detail Modal */}
      {showModal && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 dark:bg-gray-800 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Vendor Details
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">
                    {selectedVendor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedVendor.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedVendor.email}</p>
                  <div className="mt-2">
                    {getStatusBadge(selectedVendor.isActive)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedVendor.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Business Name
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedVendor.businessName}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Business Description
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedVendor.businessDescription || 'No description available'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rating
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    ⭐ {selectedVendor.overallRating || 0} / 5 ({selectedVendor.totalRatings || 0} ratings)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Completed Jobs
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedVendor.completedJobs || 0}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}