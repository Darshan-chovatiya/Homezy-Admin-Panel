import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { EyeIcon, PencilIcon, TrashBinIcon } from "../../icons";
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
    try {
      const Swal = (await import('sweetalert2')).default;
      const result = await Swal.fire({
        title: 'Delete subcategory?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      });
      if (!result.isConfirmed) return;
    } catch {
      if (!confirm('Are you sure you want to delete this subcategory?')) return;
    }
    
    try {
      await apiService.deleteSubcategory(subcategoryId);
      setSubcategories(subcategories.filter(s => s.id !== subcategoryId));
      await showSuccess('Subcategory deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subcategory');
      console.error('Error deleting subcategory:', err);
      await showError('Failed to delete subcategory');
    }
  };

  const getStatusBadge = (status: Status) => {
    const statusClasses = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      inactive: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300",
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
      {/* <PageBreadcrumb pageTitle="Subcategories Management" /> */}
      
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
              Export
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Status
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
                      <div className="mt-0.5 text-xs font-normal text-gray-500 dark:text-gray-400">Duration: {subcategory.duration}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {subcategory.serviceName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {subcategory.description}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      ₹{subcategory.price}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        onClick={() => handleStatusChange(subcategory.id, subcategory.status === 'active' ? 'inactive' : 'active')}
                        className="cursor-pointer"
                      >
                        {getStatusBadge(subcategory.status)}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => {
                            setSelectedSubcategory(subcategory);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSubcategory(subcategory);
                            setShowEditModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(subcategory.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <TrashBinIcon className="h-4 w-4" />
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
                onSubmit={async (payload: any) => {
                  try {
                    const files: any[] = Array.isArray(payload.newImages) ? payload.newImages : [];
                    const combined: any[] = [...(payload.images || []), ...files];
                    await apiService.createSubcategory(payload.serviceId, {
                      name: payload.name,
                      description: payload.description,
                      price: payload.price,
                      duration: parseDurationToMinutes(payload.duration),
                      status: payload.status,
                      images: combined
                    });
                    
                    await loadData();
                    setShowAddModal(false);
                    await showSuccess('Subcategory created');
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to create subcategory');
                    console.error('Error creating subcategory:', err);
                    await showError('Failed to create subcategory');
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
                onSubmit={async (payload: any) => {
                  if (!selectedSubcategory) return;
                  try {
                    const files: any[] = Array.isArray(payload.newImages) ? payload.newImages : [];
                    const combined: any[] = [...(payload.images || []), ...files];
                    await apiService.updateSubcategory(selectedSubcategory.id, {
                      name: payload.name,
                      description: payload.description,
                      price: payload.price,
                      duration: parseDurationToMinutes(payload.duration),
                      status: payload.status,
                      images: combined
                    });
                    
                    await loadData();
                    setShowEditModal(false);
                    await showSuccess('Subcategory updated');
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to update subcategory');
                    console.error('Error updating subcategory:', err);
                    await showError('Failed to update subcategory');
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
  // Derived hour/minute selects from duration string like "2h 30m"
  const initialHours = (() => {
    const m = (initial?.duration || '').match(/(\d+)h/); return m ? parseInt(m[1]) : 0;
  })();
  const initialMinutesOnly = (() => {
    const m = (initial?.duration || '').match(/(\d+)m/); return m ? parseInt(m[1]) : 0;
  })();
  const [hoursPart, setHoursPart] = useState<number>(initialHours);
  const [minutesPart, setMinutesPart] = useState<number>(initialMinutesOnly);
  const [useCustomHours, setUseCustomHours] = useState<boolean>(false);
  const [useCustomMinutes, setUseCustomMinutes] = useState<boolean>(false);
  const [customHours, setCustomHours] = useState<number>(initialHours);
  const [customMinutes, setCustomMinutes] = useState<number>(initialMinutesOnly);

  const updateDurationString = (h: number, m: number) => {
    const str = `${h}h ${m}m`;
    setDuration(str);
  };
  const [status, setStatus] = useState<Status>(initial?.status || "active");
  const [price, setPrice] = useState(initial?.price || 0);
  // Existing images persisted in DB (string paths)
  const [existingImages, setExistingImages] = useState<string[]>(initial?.images || []);
  // New images selected in the form (File objects)
  const [newImages, setNewImages] = useState<File[]>([]);

  const addImage = (file: File) => {
    const totalCount = existingImages.length + newImages.length;
    if (totalCount >= 5) return;
    setNewImages(prev => [...prev, file]);
  };

  const removeExistingImage = (imageIndex: number) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== imageIndex));
  };

  const removeNewImage = (imageIndex: number) => {
    setNewImages(prev => prev.filter((_, idx) => idx !== imageIndex));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !serviceId) return;
    
    // We pass existingImages in payload so backend can merge it with uploaded new files
    const payload: any = {
      serviceId,
      name: name.trim(),
      description: description.trim(),
      duration,
      status,
      price,
      images: existingImages,
    };
    // Attach files via caller; api.ts will detect File(s) and send multipart
    // We temporarily add a marker property to be read by caller (same key name used)
    (payload as any).images = existingImages;
    (payload as any).image = undefined; // no single thumbnail here
    // We call onSubmit with a cast; the handler in parent will pass payload along with files
    (payload as any).newImages = newImages; // not serialized; parent will map to files param
    onSubmit(payload);
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
            <div className="mt-1 grid grid-cols-2 gap-2">
              <div className="relative">
                <select
                  value={useCustomHours ? 'custom' : String(hoursPart)}
                  onChange={(e) => {
                    if (e.target.value === 'custom') { setUseCustomHours(true); } else { const val = Number(e.target.value); setUseCustomHours(false); setHoursPart(val); updateDurationString(val, minutesPart); }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {Array.from({ length: 13 }).map((_, i) => (
                    <option key={i} value={i}>{i} h</option>
                  ))}
                  <option value="custom">Custom…</option>
                </select>
                {useCustomHours && (
                  <input
                    type="number"
                    min={0}
                    max={48}
                    value={customHours}
                    onChange={(e) => { const v = Math.max(0, Math.min(48, Number(e.target.value))); setCustomHours(v); setHoursPart(v); updateDurationString(v, minutesPart); }}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter hours"
                  />
                )}
              </div>
              <div className="relative">
                <select
                  value={useCustomMinutes ? 'custom' : String(minutesPart)}
                  onChange={(e) => {
                    if (e.target.value === 'custom') { setUseCustomMinutes(true); } else { const val = Number(e.target.value); setUseCustomMinutes(false); setMinutesPart(val); updateDurationString(hoursPart, val); }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const val = idx * 5; return <option key={val} value={val}>{val} m</option>;
                  })}
                  <option value="custom">Custom…</option>
                </select>
                {useCustomMinutes && (
                  <input
                    type="number"
                    min={0}
                    max={59}
                    step={1}
                    value={customMinutes}
                    onChange={(e) => { const v = Math.max(0, Math.min(59, Number(e.target.value))); setCustomMinutes(v); setMinutesPart(v); updateDurationString(hoursPart, v); }}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter minutes"
                  />
                )}
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Selected: {duration || `${hoursPart}h ${minutesPart}m`}</div>
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
            {existingImages.map((img, idx) => (
              <div key={`ex-${idx}`} className="relative">
                <img src={apiService.resolveImageUrl(img)} alt={`Existing ${idx + 1}`} className="h-16 w-16 rounded object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(idx)}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            {newImages.map((file, idx) => (
              <div key={`new-${idx}`} className="relative">
                <img src={URL.createObjectURL(file)} alt={`New ${idx + 1}`} className="h-16 w-16 rounded object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {existingImages.length + newImages.length < 5 && (
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
