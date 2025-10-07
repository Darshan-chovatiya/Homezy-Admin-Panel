import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "customer" | "service_partner";
  status: "active" | "inactive" | "pending" | "suspended";
  joinDate: string;
  totalBookings?: number;
  totalEarnings?: number;
  rating?: number;
  profileImage?: string;
  address?: string;
  skills?: string[];
  documents?: string[];
}

const dummyUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    type: "customer",
    status: "active",
    joinDate: "2024-01-15",
    totalBookings: 12,
    rating: 4.8,
    profileImage: "/images/user/user-01.jpg",
    address: "123 Main St, New York, NY 10001"
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 234-5678",
    type: "service_partner",
    status: "active",
    joinDate: "2024-02-20",
    totalBookings: 45,
    totalEarnings: 12500,
    rating: 4.9,
    profileImage: "/images/user/user-02.jpg",
    address: "456 Oak Ave, Los Angeles, CA 90210",
    skills: ["Plumbing", "Electrical", "HVAC"],
    documents: ["License", "Insurance", "Certification"]
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike.wilson@email.com",
    phone: "+1 (555) 345-6789",
    type: "service_partner",
    status: "pending",
    joinDate: "2024-03-10",
    totalBookings: 0,
    totalEarnings: 0,
    rating: 0,
    profileImage: "/images/user/user-03.jpg",
    address: "789 Pine St, Chicago, IL 60601",
    skills: ["Cleaning", "Carpentry"],
    documents: ["License"]
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    phone: "+1 (555) 456-7890",
    type: "customer",
    status: "active",
    joinDate: "2024-01-28",
    totalBookings: 8,
    rating: 4.7,
    profileImage: "/images/user/user-04.jpg",
    address: "321 Elm St, Houston, TX 77001"
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@email.com",
    phone: "+1 (555) 567-8901",
    type: "service_partner",
    status: "suspended",
    joinDate: "2024-02-05",
    totalBookings: 23,
    totalEarnings: 8500,
    rating: 3.2,
    profileImage: "/images/user/user-05.jpg",
    address: "654 Maple Dr, Phoenix, AZ 85001",
    skills: ["Landscaping", "Painting"],
    documents: ["License", "Insurance"]
  }
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(dummyUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "customer" | "service_partner">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "pending" | "suspended">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesType = filterType === "all" || user.type === filterType;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleStatusChange = (userId: string, newStatus: User["status"]) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const getStatusBadge = (status: User["status"]) => {
    const statusClasses = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: User["type"]) => {
    const typeClasses = {
      customer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      service_partner: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeClasses[type]}`}>
        {type === "service_partner" ? "Service Partner" : "Customer"}
      </span>
    );
  };

  return (
    <>
      <PageMeta
        title="User Management | Homezy Admin Panel"
        description="Manage customers and service partners on the Homezy platform"
      />
      <PageBreadcrumb pageTitle="User Management" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            User Management
          </h3>
          <div className="flex gap-2">
            <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
              Export Users
            </button>
            <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              Add User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">All Types</option>
              <option value="customer">Customers</option>
              <option value="service_partner">Service Partners</option>
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
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Contact</th>
                <th scope="col" className="px-6 py-3">Join Date</th>
                <th scope="col" className="px-6 py-3">Activity</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.profileImage || "/images/user/user-01.jpg"}
                          alt={user.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getTypeBadge(user.type)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{user.phone}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {user.type === "customer" ? (
                        `${user.totalBookings} bookings`
                      ) : (
                        <div>
                          <div>{user.totalBookings} jobs</div>
                          <div className="text-xs text-gray-500">${user.totalEarnings?.toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                    {user.rating && user.rating > 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ⭐ {user.rating}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="text-primary hover:text-primary/80"
                      >
                        View
                      </button>
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value as User["status"])}
                        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">No users found matching your criteria.</div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Details
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={selectedUser.profileImage || "/images/user/user-01.jpg"}
                  alt={selectedUser.name}
                />
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    {getTypeBadge(selectedUser.type)}
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Join Date
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedUser.joinDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedUser.address}</p>
                </div>
                {selectedUser.rating && selectedUser.rating > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rating
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">⭐ {selectedUser.rating}</p>
                  </div>
                )}
              </div>

              {selectedUser.type === "service_partner" && selectedUser.skills && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedUser.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.type === "service_partner" && selectedUser.documents && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Documents
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedUser.documents.map((doc, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
