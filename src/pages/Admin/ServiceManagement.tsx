import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiService, { Service } from "../../services/api";
import { Plus } from "lucide-react";

type Status = "active" | "inactive";

interface SubcategoryUI {
  id: string;
  name: string;
  description: string;
  duration: string;
  status: Status;
  price: number;
  images?: string[];
}

interface ServiceUI {
  id: string;
  name: string;
  description: string;
  status: Status;
  subCategories: SubcategoryUI[];
  image?: string;
}

// Helper function to convert API data to UI format
const convertServiceToUI = (service: Service): ServiceUI => {
  // Always resolve image URL with VITE_IMAGE_BASE_URL prefix
  // Paths like "uploads/services/..." will become "VITE_IMAGE_BASE_URL/uploads/services/..."
  const resolvedImage = service.image ? apiService.resolveImageUrl(service.image) : undefined;
  
  return {
    id: service._id,
    name: service.name,
    description: service.description,
    status: service.isActive ? "active" : "inactive",
    image: resolvedImage || undefined,
    subCategories: (service.subCategories || []).map(sub => ({
      id: sub._id,
      name: sub.name,
      description: sub.description,
      duration: `${Math.floor(sub.duration / 60)}h ${sub.duration % 60}m`,
      status: sub.isActive ? "active" : "inactive",
      price: sub.basePrice,
      // Resolve all image URLs with VITE_IMAGE_BASE_URL prefix
      images: (sub.images || [])
        .map(img => img ? apiService.resolveImageUrl(img) : undefined)
        .filter((img): img is string => img !== undefined && img !== null)
    }))
  };
};


export default function ServiceManagement() {
  const [services, setServices] = useState<ServiceUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [selectedService, setSelectedService] = useState<ServiceUI | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [modalImageError, setModalImageError] = useState(false);
  const [subcategoryImageErrors, setSubcategoryImageErrors] = useState<{[key: string]: boolean}>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [limit] = useState(10);

  // SweetAlert helpers (fallback to alert)
  const showSuccess = async (title: string, text?: string) => {
    try {
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({ icon: 'success', title, text, timer: 1500, showConfirmButton: false });
    } catch {
      if (text) console.log(text);
      window.alert(title);
    }
  };
  const showError = async (title: string, text?: string) => {
    try {
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({ icon: 'error', title, text });
    } catch {
      if (text) console.error(text);
      window.alert(title);
    }
  };

  // Load services on component mount and when page changes
  useEffect(() => {
    loadServices();
  }, [currentPage]);

  // Generate initials from name
  const getInitials = (name: string) => {
    const cleanName = name.trim();
    
    // Remove email domain if it's an email
    const nameWithoutEmail = cleanName.includes("@") ? cleanName.split("@")[0] : cleanName;
    
    // Split by spaces and filter out empty strings
    const parts = nameWithoutEmail.split(" ").filter(Boolean);
    
    if (parts.length >= 2) {
      // If we have at least 2 words, take first letter of first two words
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1) {
      // If we have only one word, take first two letters
      const word = parts[0];
      return word.length >= 2 ? word.slice(0, 2).toUpperCase() : (word[0] + "A").toUpperCase();
    }
    
    // Fallback
    return "AD";
  };

  // Handle image error
  const handleImageError = (serviceId: string) => {
    setImageErrors(prev => ({ ...prev, [serviceId]: true }));
  };

  // Handle modal image error
  const handleModalImageError = () => {
    setModalImageError(true);
  };

  // Reset modal image error when modal opens
  const handleModalOpen = (service: ServiceUI) => {
    setSelectedService(service);
    setModalImageError(false);
    setSubcategoryImageErrors({}); // Reset subcategory image errors
    setShowModal(true);
  };

  // Handle subcategory image error
  const handleSubcategoryImageError = (subcategoryId: string) => {
    setSubcategoryImageErrors(prev => ({ ...prev, [subcategoryId]: true }));
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getServices({ page: currentPage, limit: limit });
      if (response.data) {
        const uiServices = response.data.docs.map(convertServiceToUI);
        setServices(uiServices);
        setTotalPages(response.data.totalPages || 1);
        setTotalDocs(response.data.totalDocs || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const filteredServices = services.filter((service) => {
    const text = searchTerm.toLowerCase();
    const matchesServiceText =
      service.name.toLowerCase().includes(text) ||
      service.description.toLowerCase().includes(text);

    const matchesSubText = service.subCategories.some(
      (s) => s.name.toLowerCase().includes(text) || s.description.toLowerCase().includes(text)
    );

    const matchesText = matchesServiceText || matchesSubText;

    // Apply status filter only to the service itself
    const matchesStatus = filterStatus === "all" ? true : service.status === filterStatus;

    return matchesText && matchesStatus;
  });

  const handleStatusChange = async (serviceId: string, newStatus: Status) => {
    try {
      const Swal = (await import('sweetalert2')).default;
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this service?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#013365',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      });

      if (result.isConfirmed) {
        await apiService.updateServiceStatus(serviceId, newStatus);
        setServices(services.map(service => 
          service.id === serviceId ? { ...service, status: newStatus } : service
        ));
        // Update selected service if it's the one being changed
        if (selectedService && selectedService.id === serviceId) {
          setSelectedService({ ...selectedService, status: newStatus });
        }
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Service ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      const Swal = (await import('sweetalert2')).default;
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : 'Failed to update service status'
      });
      console.error('Error updating service status:', err);
    }
  };


  const getStatusBadge = (service: ServiceUI) => {
    return (
      <span
        onClick={() => handleStatusChange(service.id, service.status === 'active' ? 'inactive' : 'active')}
        className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
          service.status === 'active'
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        {service.status === 'active' ? "Active" : "Inactive"}
      </span>
    );
  };


  // Category badges removed in new structure

  return (
    <>
      <PageMeta
        title="Service Management | Homezy Admin Panel"
        description="Manage service categories and pricing on the Homezy platform"
      />
      {/* <PageBreadcrumb pageTitle="Service Management" /> */}
      
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex">
              <div className="text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Service's Categories Management
          </h3>
          <div className="flex gap-2">
            {/* <button className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">
              Export Services
            </button> */}
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-[#013365] px-4 py-2 text-sm font-medium text-white hover:bg-[#013365]/90 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search services by name or description..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400">Loading services...</div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
                  onClick={() => {
                    setSelectedService(service);
                    setShowModal(true);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {service.name.split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ')}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{service.description}</p>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{service.subCategories.length} Subcategories</div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="text-right mb-3" onClick={(e) => e.stopPropagation()}>
                        {getStatusBadge(service)}
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 text-[#013365] dark:bg-blue-900 dark:text-blue-300 overflow-hidden">
                        {service.image && !imageErrors[service.id] ? (
                          <img
                            src={service.image}
                            alt={service.name}
                            className="h-full w-full rounded-lg object-cover"
                            onError={() => handleImageError(service.id)}
                          />
                        ) : (
                          <span className="text-lg font-bold">
                            {getInitials(service.name)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                  </div>
                  <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModalOpen(service);
                  }}
                  className="flex items-center justify-center gap-2 flex-1 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-[#013365] hover:bg-blue-300"
                >
                   View Details
                </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="py-12 text-center">
                <div className="text-gray-500 dark:text-gray-400">No services found matching your criteria.</div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                  <span className="ml-2">({totalDocs} total services)</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Service Detail Modal */}
      {showModal && selectedService && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Service's Category Details
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex gap-6">
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedService.name.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      ).join(' ')}
                    </h4>
                    <div className="mt-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        selectedService.status === 'active'
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {selectedService.status === 'active' ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{selectedService.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-blue-100 text-[#013365] dark:bg-blue-900 dark:text-blue-300 overflow-hidden">
                      {selectedService.image && !modalImageError ? (
                        <img
                          src={selectedService.image}
                          alt={selectedService.name}
                          className="h-full w-full rounded-lg object-cover"
                          onError={handleModalImageError}
                        />
                      ) : (
                        <span className="text-3xl font-bold">
                          {getInitials(selectedService.name)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="mb-3 font-medium text-gray-900 dark:text-white">Subcategories</h5>
                  {selectedService.subCategories.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Description</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Duration</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Images</th>
                            <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">Price (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {selectedService.subCategories.map((s) => (
                            <tr key={s.id} className="bg-white dark:bg-gray-800">
                              <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                {s.name.split(' ').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                ).join(' ')}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                {expandedDescriptions[s.id]
                                  ? s.description
                                  : (s.description?.length > 30 ? s.description.slice(0, 30) + "..." : s.description)}
                                {s.description && s.description.length > 30 && (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedDescriptions(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                                    className="ml-2 text-xs text-[#013365] hover:underline dark:text-blue-400"
                                  >
                                    {expandedDescriptions[s.id] ? "Show less" : "Show more"}
                                  </button>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{s.duration}</td>
                              <td className="whitespace-nowrap px-4 py-2">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  s.status === 'active'
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}>
                                  {s.status === 'active' ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                {s.images && s.images.length > 0 ? (
                                  <div className="flex gap-1">
                                    {s.images.slice(0, 3).map((img, idx) => (
                                      <div key={idx} className="flex h-8 w-8 items-center justify-center rounded bg-blue-100 text-[#013365] dark:bg-blue-900 dark:text-blue-300 overflow-hidden">
                                        {!subcategoryImageErrors[`${s.id}-${idx}`] && img ? (
                                          <img 
                                            src={img} 
                                            alt={`${s.name} ${idx + 1}`} 
                                            className="h-full w-full rounded object-cover"
                                            onError={() => handleSubcategoryImageError(`${s.id}-${idx}`)}
                                          />
                                        ) : (
                                          <span className="text-xs font-bold">
                                            {getInitials(s.name)}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                    {s.images.length > 3 && (
                                      <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                                        +{s.images.length - 3}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100 text-[#013365] dark:bg-blue-900 dark:text-blue-300">
                                    <span className="text-xs font-bold">
                                      {getInitials(s.name)}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-900 dark:text-white">{s.price} (₹)</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-8 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Subcategories Available</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          This service doesn't have any subcategories yet. Add subcategories to organize different service variations and pricing.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
                </div>

            {/* Sticky Footer */}
            <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              <button onClick={() => { setShowModal(false); setShowEditModal(true); }} className="rounded-lg bg-[#013365] px-4 py-2 text-sm font-medium text-white hover:bg-[#013365]/90">Edit Service</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add New Service
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <AddEditServiceForm formId="add-service-form" onSubmit={async (payload) => {
                try {
                  const svc: any = {
                    name: payload.name,
                    description: payload.description,
                    status: payload.status,
                  };
                  if (payload.image) (svc as any).image = payload.image as any;
                  await apiService.createService(svc);
                  
                  await loadServices();
                  setShowAddModal(false);
                  await showSuccess('Service created');
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to create service');
                  console.error('Error creating service:', err);
                  await showError('Failed to create service');
                }
              }} />
            </div>

            {/* Sticky Footer */}
            <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
              <button onClick={() => setShowAddModal(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Close</button>
              <button form="add-service-form" type="submit" className="rounded-lg bg-[#013365] px-4 py-2 text-sm font-medium text-white hover:bg-[#013365]/90">Save</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedService && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Service</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold">✕</button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <AddEditServiceForm
                formId="edit-service-form"
                initial={selectedService}
                onSubmit={async (payload) => {
                  if (!selectedService) return;
                  try {
                    const svc: any = {
                      name: payload.name,
                      description: payload.description,
                      status: payload.status,
                    };
                    if (payload.image) (svc as any).image = payload.image as any;
                    await apiService.updateService(selectedService.id, svc);
                    
                    // Update subcategories separately if needed
                    // For now, we'll just update the service and reload
                    await loadServices();
                    setShowEditModal(false);
                    await showSuccess('Service updated');
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to update service');
                    console.error('Error updating service:', err);
                    await showError('Failed to update service');
                  }
                }}
              />
            </div>

            {/* Sticky Footer */}
            <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
              <button onClick={() => setShowEditModal(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Close</button>
              <button form="edit-service-form" type="submit" className="rounded-lg bg-[#013365] px-4 py-2 text-sm font-medium text-white hover:bg-[#013365]/90">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type ServiceFormPayload = {
  name: string;
  description: string;
  status: Status;
  image?: File | string;
};

function AddEditServiceForm({ initial, onSubmit, formId }: { initial?: ServiceUI; onSubmit: (payload: ServiceFormPayload) => void; formId?: string; }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [status, setStatus] = useState<Status>(initial?.status || "active");
  const [serviceImage, setServiceImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState(false);

  // Generate initials from name
  const getInitials = (name: string) => {
    const cleanName = name.trim();
    
    // Remove email domain if it's an email
    const nameWithoutEmail = cleanName.includes("@") ? cleanName.split("@")[0] : cleanName;
    
    // Split by spaces and filter out empty strings
    const parts = nameWithoutEmail.split(" ").filter(Boolean);
    
    if (parts.length >= 2) {
      // If we have at least 2 words, take first letter of first two words
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1) {
      // If we have only one word, take first two letters
      const word = parts[0];
      return word.length >= 2 ? word.slice(0, 2).toUpperCase() : (word[0] + "A").toUpperCase();
    }
    
    // Fallback
    return "AD";
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    // Pass File directly if selected so API can use multipart; otherwise omit to keep existing
    const imagePayload: File | string | undefined = serviceImage ? serviceImage : (initial?.image || undefined);
    onSubmit({ name: name.trim(), description: description.trim(), status, image: imagePayload });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="h-full">
      <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Enter service name" />
                </div>
                <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Enter service description" />
              </div>

                <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service Image (Optional)</label>
          <div className="mt-1">
            {(initial?.image && !serviceImage) || serviceImage ? (
              <div className="mb-2">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-blue-100 text-[#013365] dark:bg-blue-900 dark:text-blue-300">
                  {serviceImage ? (
                    <img 
                      src={URL.createObjectURL(serviceImage)} 
                      alt="New service image" 
                      className="h-full w-full rounded-lg object-cover"
                      onError={handleImageError}
                    />
                  ) : initial?.image && !imageError ? (
                    <img 
                      src={initial.image} 
                      alt="Current service image" 
                      className="h-full w-full rounded-lg object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <span className="text-xl font-bold">
                      {getInitials(name || initial?.name || "Service")}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-2">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-blue-100 text-[#013365] dark:bg-blue-900 dark:text-blue-300">
                  <span className="text-xl font-bold">
                    {getInitials(name || initial?.name || "Service")}
                  </span>
                </div>
              </div>
            )}
                  <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setServiceImage(file);
                  setImageError(false); // Reset error when new image is selected
                }
              }}
              className="w-full rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
        </div>
    </form>
  );
}
