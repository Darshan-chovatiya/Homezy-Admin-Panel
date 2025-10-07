import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

type Status = "active" | "inactive";

interface Subcategory {
  id: string;
  name: string;
  description: string;
  duration: string;
  status: Status;
  price: number;
  images?: string[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  status: Status;
  subCategories: Subcategory[];
  image?: string;
}

const dummyServices: Service[] = [
  {
    id: "1",
    name: "House Cleaning",
    description: "Professional cleaning for homes, including bedrooms, kitchen, and bathrooms.",
    status: "active",
    image: "/images/product/product-01.jpg",
    subCategories: [
      { id: "1-1", name: "Basic Cleaning", description: "Quick clean of all rooms.", duration: "2 hours", status: "active", price: 799, images: ["/images/product/product-01.jpg", "/images/product/product-02.jpg"] },
      { id: "1-2", name: "Deep Cleaning", description: "Detailed cleaning with appliances.", duration: "4 hours", status: "inactive", price: 1499, images: ["/images/product/product-03.jpg"] },
      { id: "1-3", name: "Kitchen Focus", description: "Deep clean of kitchen.", duration: "2 hours", status: "active", price: 899, images: ["/images/product/product-04.jpg", "/images/product/product-05.jpg", "/images/product/product-01.jpg"] },
    ],
  },
  {
    id: "2",
    name: "Plumbing Services",
    description: "Repairs for leaks, clogs, and fitting replacements.",
    status: "active",
    image: "/images/product/product-02.jpg",
    subCategories: [
      { id: "2-1", name: "Leak Fix", description: "Pipe and tap leak resolution.", duration: "1 hour", status: "active", price: 499, images: ["/images/product/product-02.jpg"] },
      { id: "2-2", name: "Clog Removal", description: "Drain and pipe clog removal.", duration: "1.5 hours", status: "inactive", price: 799, images: ["/images/product/product-03.jpg", "/images/product/product-04.jpg"] },
    ],
  },
  {
    id: "3",
    name: "Electrical Work",
    description: "Safe electrical repairs, installations, and maintenance.",
    status: "inactive",
    image: "/images/product/product-03.jpg",
    subCategories: [
      { id: "3-1", name: "Switch Installation", description: "Install/replace switches.", duration: "45 mins", status: "active", price: 299, images: ["/images/product/product-05.jpg", "/images/product/product-01.jpg", "/images/product/product-02.jpg", "/images/product/product-03.jpg", "/images/product/product-04.jpg"] },
      { id: "3-2", name: "Fan Installation", description: "Ceiling/Wall fan install.", duration: "1.5 hours", status: "inactive", price: 999 },
      { id: "3-3", name: "Wiring Repair", description: "Minor wiring fixes.", duration: "2 hours", status: "active", price: 1299, images: ["/images/product/product-04.jpg"] },
      { id: "3-4", name: "MCB Replacement", description: "MCB diagnosis & replace.", duration: "1 hour", status: "active", price: 799, images: ["/images/product/product-05.jpg", "/images/product/product-01.jpg"] },
    ],
  },
];

// Removed global categories; services now contain multiple subcategories

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>(dummyServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredServices = services.filter((service) => {
    const text = searchTerm.toLowerCase();
    const matchesServiceText =
      service.name.toLowerCase().includes(text) ||
      service.description.toLowerCase().includes(text);

    const matchesSubText = service.subCategories.some(
      (s) => s.name.toLowerCase().includes(text) || s.description.toLowerCase().includes(text)
    );

    const matchesText = matchesServiceText || matchesSubText;

    const matchesStatus =
      filterStatus === "all" ||
      service.status === filterStatus ||
      service.subCategories.some((s) => s.status === filterStatus);

    return matchesText && matchesStatus;
  });

  const handleStatusChange = (serviceId: string, newStatus: Status) => {
    setServices(services.map(service => 
      service.id === serviceId ? { ...service, status: newStatus } : service
    ));
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

  // Category badges removed in new structure

  return (
    <>
      <PageMeta
        title="Service Management | Homezy Admin Panel"
        description="Manage service categories and pricing on the Homezy platform"
      />
      <PageBreadcrumb pageTitle="Service Management" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Service Management
          </h3>
          <div className="flex gap-2">
            <button className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">
              Export Services
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
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
                    {service.name}
                  </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{service.description}</p>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{service.subCategories.length} Subcategories</div>
                  </div>
              {service.image && (
                <div className="ml-4 flex-shrink-0">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                </div>
              )}
                <div className="text-right" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={service.status}
                    onChange={(e) => handleStatusChange(service.id, e.target.value as Status)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedService(service);
                    setShowModal(true);
                  }}
                  className="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
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
      </div>

      {/* Service Detail Modal */}
      {showModal && selectedService && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Service Details
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
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedService.name}</h4>
                    <div className="mt-2 flex items-center gap-2">
                      {getStatusBadge(selectedService.status)}
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{selectedService.description}</p>
                  </div>
                  {selectedService.image && (
                    <div className="flex-shrink-0">
                <img
                  src={selectedService.image}
                  alt={selectedService.name}
                  className="h-32 w-32 rounded-lg object-cover"
                />
                    </div>
                  )}
                </div>

                <div>
                  <h5 className="mb-3 font-medium text-gray-900 dark:text-white">Subcategories</h5>
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
                            <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{s.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{s.description}</td>
                            <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{s.duration}</td>
                            <td className="whitespace-nowrap px-4 py-2">{getStatusBadge(s.status)}</td>
                            <td className="px-4 py-2">
                              {s.images && s.images.length > 0 ? (
                                <div className="flex gap-1">
                                  {s.images.slice(0, 3).map((img, idx) => (
                                    <img key={idx} src={img} alt={`${s.name} ${idx + 1}`} className="h-8 w-8 rounded object-cover" />
                                  ))}
                                  {s.images.length > 3 && (
                                    <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                                      +{s.images.length - 3}
                    </div>
                                  )}
                    </div>
                              ) : (
                                <span className="text-gray-400 text-xs">No images</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-900 dark:text-white">{s.price} (₹)</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
              <button onClick={() => { setShowModal(false); setShowEditModal(true); }} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">Edit Service</button>
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
              <AddEditServiceForm formId="add-service-form" onSubmit={(payload) => {
                const newService: Service = {
                  id: String(Date.now()),
                  name: payload.name,
                  description: payload.description,
                  status: payload.status as Status,
                  subCategories: payload.subCategories,
                  image: payload.image,
                };
                setServices((prev) => [newService, ...prev]);
                setShowAddModal(false);
              }} />
            </div>

            {/* Sticky Footer */}
            <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
              <button onClick={() => setShowAddModal(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Close</button>
              <button form="add-service-form" type="submit" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">Save</button>
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
                onSubmit={(payload) => {
                  setServices((prev) => prev.map((s) => (s.id === selectedService.id ? {
                    id: selectedService.id,
                    name: payload.name,
                    description: payload.description,
                    status: payload.status as Status,
                    subCategories: payload.subCategories,
                    image: payload.image,
                  } : s)));
                  setShowEditModal(false);
                }}
              />
            </div>

            {/* Sticky Footer */}
            <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
              <button onClick={() => setShowEditModal(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Close</button>
              <button form="edit-service-form" type="submit" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90">Save</button>
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
  subCategories: Subcategory[];
  image?: string;
};

function AddEditServiceForm({ initial, onSubmit, formId }: { initial?: Service; onSubmit: (payload: ServiceFormPayload) => void; formId?: string; }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [status, setStatus] = useState<Status>(initial?.status || "active");
  const [serviceImage, setServiceImage] = useState<File | null>(null);
  const [subCategories, setSubCategories] = useState<Subcategory[]>(initial?.subCategories || [
    { id: String(Date.now()), name: "", description: "", duration: "", status: "active", price: 0 }
  ]);

  const addSub = () => {
    setSubCategories(prev => [...prev, { id: String(Date.now() + Math.random()), name: "", description: "", duration: "", status: "active", price: 0, images: [] }]);
  };

  const removeSub = (id: string) => {
    setSubCategories(prev => prev.filter(s => s.id !== id));
  };

  const updateSub = (id: string, patch: Partial<Subcategory>) => {
    setSubCategories(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const addSubImage = (subId: string, file: File) => {
    const sub = subCategories.find(s => s.id === subId);
    if (sub && (!sub.images || sub.images.length < 5)) {
      const imageUrl = URL.createObjectURL(file);
      updateSub(subId, { images: [...(sub.images || []), imageUrl] });
    }
  };

  const removeSubImage = (subId: string, imageIndex: number) => {
    const sub = subCategories.find(s => s.id === subId);
    if (sub && sub.images) {
      const newImages = sub.images.filter((_, idx) => idx !== imageIndex);
      updateSub(subId, { images: newImages });
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    const validSubs = subCategories.filter(s => s.name.trim() && s.description.trim() && s.price >= 0);
    const serviceImageUrl = serviceImage ? URL.createObjectURL(serviceImage) : initial?.image;
    onSubmit({ name: name.trim(), description: description.trim(), status, subCategories: validSubs, image: serviceImageUrl });
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
            {initial?.image && !serviceImage && (
              <div className="mb-2">
                <img src={initial.image} alt="Current service image" className="h-20 w-20 rounded-lg object-cover" />
                </div>
            )}
            {serviceImage && (
              <div className="mb-2">
                <img src={URL.createObjectURL(serviceImage)} alt="New service image" className="h-20 w-20 rounded-lg object-cover" />
                </div>
            )}
                  <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setServiceImage(file);
              }}
              className="w-full rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

        <fieldset className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <legend className="px-1 text-sm font-medium text-gray-800 dark:text-gray-200">Subcategories</legend>
          <div className="space-y-3">
            {subCategories.map((s) => (
              <div key={s.id} className="space-y-2">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input value={s.name} onChange={(e) => updateSub(s.id, { name: e.target.value })} type="text" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <input value={s.description} onChange={(e) => updateSub(s.id, { description: e.target.value })} type="text" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Duration</label>
                    <input value={s.duration} onChange={(e) => updateSub(s.id, { duration: e.target.value })} type="text" placeholder="e.g., 2 hours" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select value={s.status} onChange={(e) => updateSub(s.id, { status: e.target.value as Status })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Price (₹)</label>
                    <input value={s.price} onChange={(e) => updateSub(s.id, { price: Number(e.target.value) })} type="number" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div className="col-span-1 flex items-end">
                    <button type="button" onClick={() => removeSub(s.id)} className="h-9 w-full rounded-md bg-red-600 text-xs font-medium text-white hover:bg-red-700">Del</button>
                  </div>
              </div>

                {/* Subcategory Images */}
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Images (Optional, max 5)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {s.images?.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={img} alt={`${s.name} ${idx + 1}`} className="h-12 w-12 rounded object-cover" />
                <button
                  type="button"
                          onClick={() => removeSubImage(s.id, idx)}
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                >
                          ×
                </button>
                      </div>
                    ))}
                  </div>
                  {(!s.images || s.images.length < 5) && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) addSubImage(s.id, file);
                      }}
                      className="w-full rounded-lg border border-dashed border-gray-300 bg-white px-2 py-1 text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  )}
                </div>
              </div>
            ))}
            <div>
              <button type="button" onClick={addSub} className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">+ Add Subcategory</button>
            </div>
          </div>
        </fieldset>
        </div>
    </form>
  );
}
