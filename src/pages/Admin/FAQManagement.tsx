import { useState, useEffect } from "react";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import faqService from "../../services/faq";
import Swal from "sweetalert2";

// FAQ interface
interface FAQ {
  _id: string;
  question: string;
  answer: string;
  type: 'user' | 'vendor';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "user" | "vendor">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [formLoading, setFormLoading] = useState(false);

  // Add FAQ Form State
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    type: "user" as 'user' | 'vendor'
  });

  // Edit FAQ Form State
  const [editFormData, setEditFormData] = useState({
    faqId: "",
    question: "",
    answer: "",
    type: "user" as 'user' | 'vendor',
    isActive: true
  });

  // Fetch FAQs
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await faqService.getAllFAQs();

      if (response.data) {
        setFaqs(response.data);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      Swal.fire('Error', 'Failed to fetch FAQs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  // Filter FAQs based on search and filters
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || faq.type === filterType;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && faq.isActive) ||
                         (filterStatus === "inactive" && !faq.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle status toggle
  const handleToggle = async (faq: FAQ) => {
    try {
      const nextStatus = !faq.isActive;
      await faqService.updateFAQ({
        faqId: faq._id,
        isActive: nextStatus
      });
      setFaqs(prev =>
        prev.map(f =>
          f._id === faq._id ? { ...f, isActive: nextStatus } : f
        )
      );
      Swal.fire('Success', `FAQ ${nextStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      console.error("Error updating FAQ status:", error);
      Swal.fire('Error', 'Failed to update FAQ status', 'error');
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (faqId: string) => {
    const result = await Swal.fire({
      title: 'Delete FAQ?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await faqService.deleteFAQ(faqId);
        await Swal.fire('Deleted', 'FAQ removed successfully', 'success');
        fetchFAQs();
      } catch (error) {
        console.error("Error deleting FAQ:", error);
        Swal.fire('Error', 'Failed to delete FAQ', 'error');
      }
    }
  };

  // Handle Add FAQ
  const handleAddFAQ = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setFormLoading(true);
    
    try {
      await faqService.createFAQ(formData);
      setShowAddModal(false);
      setFormData({
        question: "",
        answer: "",
        type: "user"
      });
      await Swal.fire('Saved', 'FAQ created successfully', 'success');
      fetchFAQs();
    } catch (error: any) {
      console.error("Error creating FAQ:", error);
      Swal.fire('Error', error.message || 'Failed to create FAQ', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (faq: FAQ) => {
    setEditFormData({
      faqId: faq._id,
      question: faq.question,
      answer: faq.answer,
      type: faq.type,
      isActive: faq.isActive
    });
    setShowEditModal(true);
  };

  // Handle Edit FAQ
  const handleEditFAQ = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setFormLoading(true);
    
    try {
      await faqService.updateFAQ(editFormData);
      setShowEditModal(false);
      await Swal.fire('Saved', 'FAQ updated successfully', 'success');
      fetchFAQs();
    } catch (error: any) {
      console.error("Error updating FAQ:", error);
      Swal.fire('Error', error.message || 'Failed to update FAQ', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusBadge = (faq: FAQ) => {
    return (
      <span
        onClick={() => handleToggle(faq)}
        className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
          faq.isActive
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        {faq.isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const getTypeBadge = (type: 'user' | 'vendor') => {
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
        type === 'user'
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
          : "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
      }`}>
        {type === 'user' ? 'Customer' : 'Service Partner'}
      </span>
    );
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">FAQ Management</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Total FAQs: <span className="font-semibold">{filteredFAQs.length}</span>
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 hover:text-white dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 dark:hover:text-blue-200 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search FAQs by question or answer..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">All Types</option>
            <option value="user">Customer</option>
            <option value="vendor">Service Partner</option>
          </select>
          <select
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Question</th>
                <th scope="col" className="px-6 py-3">Answer</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Created</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-6 text-center">Loading...</td></tr>
              ) : (
                filteredFAQs.map((faq) => (
                  <tr key={faq._id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {faq.question}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900 dark:text-white truncate">
                          {faq.answer}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(faq.type)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(faq)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(faq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedFAQ(faq);
                            setShowModal(true);
                          }}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(faq)}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-primary hover:bg-blue-200 hover:text-primary/80 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 transition-colors duration-200"
                          title="Edit FAQ"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(faq._id)}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800 dark:hover:text-red-300 border border-red-300 dark:border-red-700 transition-colors duration-200"
                          title="Delete FAQ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredFAQs.length === 0 && !loading && (
          <div className="py-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">No FAQs found.</div>
          </div>
        )}
      </div>

      {/* Add FAQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New FAQ</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold">✕</button>
            </div>
            <form onSubmit={handleAddFAQ} className="flex-1 overflow-y-auto p-6" id="add-faq-form">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'user' | 'vendor' })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="user">Customer</option>
                    <option value="vendor">Service Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Question</label>
                  <input
                    type="text"
                    required
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter FAQ question"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Answer</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter FAQ answer"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {formLoading ? "Creating..." : "Create FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit FAQ Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit FAQ</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold">✕</button>
            </div>
            <form onSubmit={handleEditFAQ} className="flex-1 overflow-y-auto p-6" id="edit-faq-form">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <select
                    required
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as 'user' | 'vendor' })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="user">Customer</option>
                    <option value="vendor">Service Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Question</label>
                  <input
                    type="text"
                    required
                    value={editFormData.question}
                    onChange={(e) => setEditFormData({ ...editFormData, question: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter FAQ question"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Answer</label>
                  <textarea
                    required
                    rows={4}
                    value={editFormData.answer}
                    onChange={(e) => setEditFormData({ ...editFormData, answer: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter FAQ answer"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {formLoading ? "Updating..." : "Update FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Detail Modal */}
      {showModal && selectedFAQ && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">FAQ Details</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 dark:bg-white/10 dark:text-white/80">
                    <span className="text-xs font-semibold">Q</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">FAQ Information</h4>
                    <div className="mt-1 flex gap-2">
                      {getStatusBadge(selectedFAQ)}
                      {getTypeBadge(selectedFAQ.type)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Question</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedFAQ.question}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Answer</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedFAQ.answer}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Type</label>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedFAQ.type === 'user' ? 'Customer' : 'Service Partner'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedFAQ.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Created Date</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedFAQ.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Last Updated</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedFAQ.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
