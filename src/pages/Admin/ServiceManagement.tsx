import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  duration: string;
  status: "active" | "inactive" | "pending";
  image: string;
  features: string[];
  requirements: string[];
  totalBookings: number;
  averageRating: number;
  createdAt: string;
}

const dummyServices: Service[] = [
  {
    id: "1",
    name: "House Cleaning",
    category: "Cleaning",
    description: "Professional house cleaning service including dusting, vacuuming, and sanitizing",
    basePrice: 80,
    priceRange: { min: 60, max: 120 },
    duration: "2-4 hours",
    status: "active",
    image: "/images/product/product-01.jpg",
    features: ["Deep cleaning", "Eco-friendly products", "Insurance covered"],
    requirements: ["Access to all rooms", "Water supply"],
    totalBookings: 245,
    averageRating: 4.7,
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Plumbing Repair",
    category: "Plumbing",
    description: "Expert plumbing services for leaks, clogs, and installations",
    basePrice: 120,
    priceRange: { min: 80, max: 200 },
    duration: "1-3 hours",
    status: "active",
    image: "/images/product/product-02.jpg",
    features: ["24/7 emergency", "Licensed plumbers", "Warranty included"],
    requirements: ["Clear access to pipes", "Water shut-off"],
    totalBookings: 189,
    averageRating: 4.8,
    createdAt: "2024-01-20"
  },
  {
    id: "3",
    name: "Electrical Work",
    category: "Electrical",
    description: "Safe electrical repairs, installations, and maintenance",
    basePrice: 150,
    priceRange: { min: 100, max: 300 },
    duration: "2-5 hours",
    status: "active",
    image: "/images/product/product-03.jpg",
    features: ["Licensed electricians", "Safety certified", "Code compliant"],
    requirements: ["Power access", "Clear work area"],
    totalBookings: 156,
    averageRating: 4.9,
    createdAt: "2024-02-01"
  },
  {
    id: "4",
    name: "Landscaping",
    category: "Gardening",
    description: "Complete landscaping services including design and maintenance",
    basePrice: 200,
    priceRange: { min: 150, max: 500 },
    duration: "4-8 hours",
    status: "pending",
    image: "/images/product/product-04.jpg",
    features: ["Design consultation", "Seasonal maintenance", "Plant warranty"],
    requirements: ["Outdoor access", "Water source"],
    totalBookings: 67,
    averageRating: 4.6,
    createdAt: "2024-03-10"
  },
  {
    id: "5",
    name: "HVAC Service",
    category: "HVAC",
    description: "Heating, ventilation, and air conditioning maintenance and repair",
    basePrice: 180,
    priceRange: { min: 120, max: 350 },
    duration: "2-4 hours",
    status: "inactive",
    image: "/images/product/product-05.jpg",
    features: ["System inspection", "Filter replacement", "Energy efficiency"],
    requirements: ["System access", "Clear workspace"],
    totalBookings: 98,
    averageRating: 4.5,
    createdAt: "2024-02-15"
  }
];

const categories = ["All", "Cleaning", "Plumbing", "Electrical", "Gardening", "HVAC", "Carpentry", "Painting"];

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>(dummyServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "pending">("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
    const matchesStatus = filterStatus === "all" || service.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleStatusChange = (serviceId: string, newStatus: Service["status"]) => {
    setServices(services.map(service => 
      service.id === serviceId ? { ...service, status: newStatus } : service
    ));
  };

  const getStatusBadge = (status: Service["status"]) => {
    const statusClasses = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      Cleaning: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Plumbing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Electrical: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Gardening: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      HVAC: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Carpentry: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Painting: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryColors[category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>
        {category}
      </span>
    );
  };

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
            <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
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
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <div key={service.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4">
                <img
                  src={service.image}
                  alt={service.name}
                  className="h-48 w-full rounded-lg object-cover"
                />
              </div>
              
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {service.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getCategoryBadge(service.category)}
                    {getStatusBadge(service.status)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    ${service.basePrice}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ${service.priceRange.min} - ${service.priceRange.max}
                  </div>
                </div>
              </div>

              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {service.description}
              </p>

              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Duration: {service.duration}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {service.averageRating} ({service.totalBookings} bookings)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedService(service);
                    setShowModal(true);
                  }}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                >
                  View Details
                </button>
                <select
                  value={service.status}
                  onChange={(e) => handleStatusChange(service.id, e.target.value as Service["status"])}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-3xl rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Service Details
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-6">
                <img
                  src={selectedService.image}
                  alt={selectedService.name}
                  className="h-32 w-32 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedService.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    {getCategoryBadge(selectedService.category)}
                    {getStatusBadge(selectedService.status)}
                  </div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {selectedService.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="mb-2 font-medium text-gray-900 dark:text-white">Pricing</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Base Price:</span>
                      <span className="font-medium text-gray-900 dark:text-white">${selectedService.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Price Range:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${selectedService.priceRange.min} - ${selectedService.priceRange.max}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedService.duration}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="mb-2 font-medium text-gray-900 dark:text-white">Statistics</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Bookings:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedService.totalBookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Average Rating:</span>
                      <span className="font-medium text-gray-900 dark:text-white">⭐ {selectedService.averageRating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Created:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedService.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="mb-2 font-medium text-gray-900 dark:text-white">Features</h5>
                  <ul className="space-y-1">
                    {selectedService.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="mr-2 text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="mb-2 font-medium text-gray-900 dark:text-white">Requirements</h5>
                  <ul className="space-y-1">
                    {selectedService.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="mr-2 text-blue-500">•</span>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                  Edit Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add New Service
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Service Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter service name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter service description"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Min Price ($)
                  </label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duration
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 2-4 hours"
                />
              </div>

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
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
