import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import apiService, { Service, Subcategory } from "../../services/api";

type Status = "active" | "inactive";

interface SubcategoryUI {
  id: string;
  name: string;
  description: string;
  duration: string;
  status: Status;
  price: number;
  images?: string[];
  serviceId: string;
  serviceName: string;
}

// Helper function to convert API data to UI format
const convertSubcategoryToUI = (subcategory: Subcategory, services: Service[]): SubcategoryUI => {
  const service = services.find(s => s._id === subcategory.category);
  return {
    id: subcategory._id,
    name: subcategory.name,
    description: subcategory.description,
    duration: `${Math.floor(subcategory.duration / 60)}h ${subcategory.duration % 60}m`,
    status: subcategory.isActive ? "active" : "inactive",
    price: subcategory.basePrice,
    images: subcategory.images || [],
    serviceId: subcategory.category,
    serviceName: service?.name || 'Unknown Service'
  };
};

// Helper function to parse duration string to minutes
const parseDurationToMinutes = (duration: string): number => {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)m/);
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
  return hours * 60 + minutes;
};

export default function Subcategories() {
  const [subcategories, setSubcategories] = useState<SubcategoryUI[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [filterService, setFilterService] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubcategoryUI | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load services and subcategories in parallel
      const [servicesResponse, subcategoriesResponse] = await Promise.all([
        apiService.getServices({ page: 1, limit: 100 }),
        loadAllSubcategories()
      ]);
      
      setServices(servicesResponse.data.docs);
      
      // Convert subcategories to UI format
      const uiSubcategories = subcategoriesResponse.map(sub => 
        convertSubcategoryToUI(sub, servicesResponse.data.docs)
      );
      setSubcategories(uiSubcategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllSubcategories = async (): Promise<Subcategory[]> => {
    const allSubcategories: Subcategory[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        // We need to get subcategories through services since there's no direct endpoint
        const servicesResponse = await apiService.getServices({ page, limit: 50 });
        const services = servicesResponse.data.docs;
        
        for (const service of services) {
          const serviceWithSubs = await apiService.getService(service._id);
          if (serviceWithSubs.data.subCategories) {
            allSubcategories.push(...serviceWithSubs.data.subCategories);
          }
        }
        
        hasMore = services.length === 50;
        page++;
      } catch (err) {
        console.error('Error loading subcategories:', err);
        break;
      }
    }

    return allSubcategories;
  };

  const filteredSubcategories = subcategories.filter((subcategory) => {
    const text = searchTerm.toLowerCase();
    const matchesText =
      subcategory.name.toLowerCase().includes(text) ||
      subcategory.description.toLowerCase().includes(text) ||
      subcategory.serviceName.toLowerCase().includes(text);

    const matchesStatus =
      filterStatus === "all" || subcategory.status === filterStatus;

    const matchesService =
      filterService === "all" || subcategory.serviceId === filterService;

    return matchesText && matchesStatus && matchesService;
  });

  const handleStatusChange = async (subcategoryId: string, newStatus: Status) => {
    try {
      await apiService.updateSubcategoryStatus(subcategoryId, newStatus);
      setSubcategories(subcategories.map(subcategory => 
        subcategory.id === subcategoryId ? { ...subcategory, status: newStatus } : subcategory
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subcategory status');
      console.error('Error updating subcategory status:', err);
    }
  };

  const handleDelete = async (subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    
    try {
      await apiService.deleteSubcategory(subcategoryId);
      setSubcategories(subcategories.filter(s => s.id !== subcategoryId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subcategory');
      console.error('Error deleting subcategory:', err);
    }
  };

  const getStatusBadge = (status: Status) => {
    const statusClasses = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <>
      <PageMeta
        title="Subcategories Management | Homezy Admin Panel"
        description="Manage service subcategories and pricing on the Homezy platform"
      />
      <PageBreadcrumb pageTitle="Subcategories Management" />
      
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
            Subcategories Management
          </h3>
          <div className="flex gap-2">
            <button className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">
              Export Subcategories
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Add Subcategory
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search subcategories by name, description, or service..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
            >
              <option value="all">All Services</option>
              {services.map(service => (
                <option key={service._id} value={service._id}>
                  {service.name}
                </option>
              ))}
            </select>
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

        {/* Subcategories Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400">Loading subcategories...</div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Images
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubcategories.map((subcategory) => (
                  <tr key={subcategory.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {subcategory.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {subcategory.serviceName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {subcategory.description}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {subcategory.duration}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      ₹{subcategory.price}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={subcategory.status === 'active'}
                          onChange={(e) => handleStatusChange(subcategory.id, e.target.checked ? 'active' : 'inactive')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                          {subcategory.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      {subcategory.images && subcategory.images.length > 0 ? (
                        <div className="flex gap-1">
                          {subcategory.images.slice(0, 3).map((img, idx) => (
                            <img key={idx} src={img} alt={`${subcategory.name} ${idx + 1}`} className="h-8 w-8 rounded object-cover" />
                          ))}
                          {subcategory.images.length > 3 && (
                            <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                              +{subcategory.images.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No images</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setSelectedSubcategory(subcategory);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSubcategory(subcategory);
                            setShowEditModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subcategory.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
        )}

        {!loading && filteredSubcategories.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">No subcategories found matching your criteria.</div>
          </div>
        )}
      </div>

      {/* Subcategory Detail Modal */}
      {showModal && selectedSubcategory && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Subcategory Details
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="flex gap-6">
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedSubcategory.name}</h4>
                    <div className="mt-2 flex items-center gap-2">
                      {getStatusBadge(selectedSubcategory.status)}
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{selectedSubcategory.description}</p>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <strong>Service:</strong> {selectedSubcategory.serviceName}
                    </div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <strong>Duration:</strong> {selectedSubcategory.duration}
                    </div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <strong>Price:</strong> ₹{selectedSubcategory.price}
                    </div>
                  </div>
                </div>

                {selectedSubcategory.images && selectedSubcategory.images.length > 0 && (
                  <div>
                    <h5 className="mb-3 font-medium text-gray-900 dark:text-white">Images</h5>
                    <div className="grid grid-cols-4 gap-4">
                      {selectedSubcategory.images.map((img, idx) => (
                        <img key={idx} src={img} alt={`${selectedSubcategory.name} ${idx + 1}`} className="h-24 w-24 rounded-lg object-cover" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button 
                onClick={() => { setShowModal(false); setShowEditModal(true); }} 
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
              >
                Edit Subcategory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add New Subcategory
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <AddEditSubcategoryForm 
                formId="add-subcategory-form" 
                services={services}
                onSubmit={async (payload) => {
                  try {
                    await apiService.createSubcategory(payload.serviceId, {
                      name: payload.name,
                      description: payload.description,
                      price: payload.price,
                      duration: parseDurationToMinutes(payload.duration),
                      status: payload.status,
                      images: payload.images || []
                    });
                    
                    await loadData();
                    setShowAddModal(false);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to create subcategory');
                    console.error('Error creating subcategory:', err);
                  }
                }} 
              />
            </div>

            <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
              <button onClick={() => setShowAddModal(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Close</button>
              <button form="add-subcategory-form" type="submit" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subcategory Modal */}
      {showEditModal && selectedSubcategory && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Subcategory</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <AddEditSubcategoryForm
                formId="edit-subcategory-form"
                services={services}
                initial={selectedSubcategory}
                onSubmit={async (payload) => {
                  if (!selectedSubcategory) return;
                  try {
                    await apiService.updateSubcategory(selectedSubcategory.id, {
                      name: payload.name,
                      description: payload.description,
                      price: payload.price,
                      duration: parseDurationToMinutes(payload.duration),
                      status: payload.status,
                      images: payload.images || []
                    });
                    
                    await loadData();
                    setShowEditModal(false);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to update subcategory');
                    console.error('Error updating subcategory:', err);
                  }
                }}
              />
            </div>

            <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
              <button onClick={() => setShowEditModal(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Close</button>
              <button form="edit-subcategory-form" type="submit" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type SubcategoryFormPayload = {
  serviceId: string;
  name: string;
  description: string;
  duration: string;
  status: Status;
  price: number;
  images?: string[];
};

function AddEditSubcategoryForm({ 
  initial, 
  onSubmit, 
  formId, 
  services 
}: { 
  initial?: SubcategoryUI; 
  onSubmit: (payload: SubcategoryFormPayload) => void; 
  formId?: string; 
  services: Service[];
}) {
  const [serviceId, setServiceId] = useState(initial?.serviceId || "");
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [duration, setDuration] = useState(initial?.duration || "");
  const [status, setStatus] = useState<Status>(initial?.status || "active");
  const [price, setPrice] = useState(initial?.price || 0);
  const [images, setImages] = useState<string[]>(initial?.images || []);

  const addImage = (file: File) => {
    if (images.length < 5) {
      const imageUrl = URL.createObjectURL(file);
      setImages(prev => [...prev, imageUrl]);
    }
  };

  const removeImage = (imageIndex: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== imageIndex));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !serviceId) return;
    
    onSubmit({ 
      serviceId, 
      name: name.trim(), 
      description: description.trim(), 
      duration, 
      status, 
      price, 
      images 
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="h-full">
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service *</label>
            <select 
              value={serviceId} 
              onChange={(e) => setServiceId(e.target.value)} 
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select a service</option>
              {services.map(service => (
                <option key={service._id} value={service._id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value as Status)} 
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subcategory Name *</label>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            type="text" 
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
            placeholder="Enter subcategory name" 
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows={3} 
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
            placeholder="Enter subcategory description" 
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
            <input 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
              type="text" 
              placeholder="e.g., 2h 30m" 
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (₹)</label>
            <input 
              value={price} 
              onChange={(e) => setPrice(Number(e.target.value))} 
              type="number" 
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Images (Optional, max 5)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative">
                <img src={img} alt={`Subcategory ${idx + 1}`} className="h-16 w-16 rounded object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {images.length < 5 && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) addImage(file);
              }}
              className="w-full rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          )}
        </div>
      </div>
    </form>
  );
}
