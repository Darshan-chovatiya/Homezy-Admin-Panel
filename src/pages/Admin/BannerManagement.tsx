import { useState, useEffect } from "react";
import { Eye, Edit, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import bannerService, { Banner, CreateBannerData, UpdateBannerData, PaginationParams } from "../../services/banner";
import Swal from "sweetalert2";

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [limit] = useState(10);
  
  const [formLoading, setFormLoading] = useState(false);

  // Add Banner Form State
  const [formData, setFormData] = useState<CreateBannerData & { imagePreview?: string }>({
    link: "",
    image: undefined,
    imagePreview: undefined
  });

  // Edit Banner Form State
  const [editFormData, setEditFormData] = useState<UpdateBannerData & { imagePreview?: string }>({
    bannerId: "",
    link: "",
    image: undefined,
    isActive: true,
    imagePreview: undefined
  });

  // Fetch Banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const params: PaginationParams = {
        page: currentPage,
        limit: limit,
        ...(filterStatus !== "all" && { isActive: filterStatus === "active" })
      };
      
      const response = await bannerService.getAllBanners(params);

      if (response.data) {
        setBanners(response.data.docs || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalDocs(response.data.totalDocs || 0);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      Swal.fire('Error', 'Failed to fetch banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [currentPage, filterStatus]);

  // Filter Banners based on search
  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.link.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Handle status toggle
  const handleToggle = async (banner: Banner) => {
    try {
      const nextStatus = !banner.isActive;
      await bannerService.toggleBannerStatus(banner._id, nextStatus);
      setBanners(prev =>
        prev.map(b =>
          b._id === banner._id ? { ...b, isActive: nextStatus } : b
        )
      );
      Swal.fire('Success', `Banner ${nextStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      console.error("Error updating banner status:", error);
      Swal.fire('Error', 'Failed to update banner status', 'error');
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (bannerId: string) => {
    const result = await Swal.fire({
      title: 'Delete Banner?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await bannerService.deleteBanner(bannerId);
        await Swal.fire('Deleted', 'Banner removed successfully', 'success');
        fetchBanners();
      } catch (error) {
        console.error("Error deleting banner:", error);
        Swal.fire('Error', 'Failed to delete banner', 'error');
      }
    }
  };

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditFormData({
            ...editFormData,
            image: file,
            imagePreview: reader.result as string
          });
        } else {
          setFormData({
            ...formData,
            image: file,
            imagePreview: reader.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Add Banner
  const handleAddBanner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!formData.link.trim()) {
      Swal.fire('Error', 'Banner link is required', 'error');
      return;
    }

    setFormLoading(true);
    
    try {
      await bannerService.createBanner({
        link: formData.link.trim(),
        image: formData.image
      });
      setShowAddModal(false);
      setFormData({
        link: "",
        image: undefined,
        imagePreview: undefined
      });
      await Swal.fire('Saved', 'Banner created successfully', 'success');
      fetchBanners();
    } catch (error: any) {
      console.error("Error creating banner:", error);
      Swal.fire('Error', error.message || 'Failed to create banner', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (banner: Banner) => {
    setEditFormData({
      bannerId: banner._id,
      link: banner.link,
      isActive: banner.isActive,
      image: undefined,
      imagePreview: banner.image ? bannerService.resolveImageUrl(banner.image) : undefined
    });
    setShowEditModal(true);
  };

  // Handle Edit Banner
  const handleEditBanner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!editFormData.link?.trim()) {
      Swal.fire('Error', 'Banner link is required', 'error');
      return;
    }

    setFormLoading(true);
    
    try {
      await bannerService.updateBanner({
        bannerId: editFormData.bannerId,
        link: editFormData.link.trim(),
        image: editFormData.image,
        isActive: editFormData.isActive
      });
      setShowEditModal(false);
      await Swal.fire('Saved', 'Banner updated successfully', 'success');
      fetchBanners();
    } catch (error: any) {
      console.error("Error updating banner:", error);
      Swal.fire('Error', error.message || 'Failed to update banner', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusBadge = (banner: Banner) => {
    return (
      <span
        onClick={() => handleToggle(banner)}
        className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
          banner.isActive
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        {banner.isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Banner Management</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center rounded-lg border border-blue-300 bg-[#013365] px-4 py-2 text-sm font-medium text-white hover:bg-[#013365]/90 hover:text-white dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 dark:hover:text-blue-200 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search banners by link..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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

        <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Link</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-6 text-center">Loading...</td></tr>
              ) : filteredBanners.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-6 text-center">No banners found.</td></tr>
              ) : (
                filteredBanners.map((banner) => (
                  <tr key={banner._id} className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600">
                    <td className="px-6 py-4">
                      {banner.image ? (
                        <img
                          src={bannerService.resolveImageUrl(banner.image)}
                          alt="Banner"
                          className="h-16 w-32 object-cover rounded border border-gray-200 dark:border-gray-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="64" viewBox="0 0 128 64"%3E%3Crect fill="%23ddd" width="128" height="64"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="h-16 w-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white max-w-md truncate">
                        <a 
                          href={banner.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {banner.link.length > 50 ? `${banner.link.substring(0, 50)}...` : banner.link}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(banner)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(banner.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedBanner(banner);
                            setShowModal(true);
                          }}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-[#013365] hover:bg-blue-200 hover:text-[#013365]/80 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(banner)}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-[#013365] hover:bg-blue-200 hover:text-[#013365]/80 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 transition-colors duration-200"
                          title="Edit Banner"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800 dark:hover:text-red-300 border border-red-300 dark:border-red-700 transition-colors duration-200"
                          title="Delete Banner"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalDocs)} of {totalDocs} banners
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Banner</h3>
              <button onClick={() => {
                setShowAddModal(false);
                setFormData({ link: "", image: undefined, imagePreview: undefined });
              }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold">✕</button>
            </div>
            <form onSubmit={handleAddBanner} className="flex-1 overflow-y-auto p-6" id="add-banner-form">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banner Link *</label>
                  <input
                    type="url"
                    required
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, false)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  {formData.imagePreview && (
                    <div className="mt-2">
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded border border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ link: "", image: undefined, imagePreview: undefined });
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-[#013365] px-4 py-2 text-sm font-medium text-white hover:bg-[#013365]/90 disabled:opacity-50"
                >
                  {formLoading ? "Creating..." : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Banner Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Banner</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold">✕</button>
            </div>
            <form onSubmit={handleEditBanner} className="flex-1 overflow-y-auto p-6" id="edit-banner-form">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banner Link *</label>
                  <input
                    type="url"
                    required
                    value={editFormData.link}
                    onChange={(e) => setEditFormData({ ...editFormData, link: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, true)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  {editFormData.imagePreview && (
                    <div className="mt-2">
                      <img
                        src={editFormData.imagePreview}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded border border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editFormData.isActive}
                      onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-[#013365] focus:ring-[#013365]"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                  </label>
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
                  className="rounded-lg bg-[#013365] px-4 py-2 text-sm font-medium text-white hover:bg-[#013365]/90 disabled:opacity-50"
                >
                  {formLoading ? "Updating..." : "Update Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Detail Modal */}
      {showModal && selectedBanner && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Banner Details</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl font-bold">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 dark:bg-white/10 dark:text-white/80">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Banner Information</h4>
                    <div className="mt-1">
                      {getStatusBadge(selectedBanner)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {selectedBanner.image && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Banner Image</label>
                      <img
                        src={bannerService.resolveImageUrl(selectedBanner.image)}
                        alt="Banner"
                        className="w-full h-48 object-cover rounded border border-gray-200 dark:border-gray-600"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect fill="%23ddd" width="400" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Banner Link</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1 break-all">
                      <a 
                        href={selectedBanner.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {selectedBanner.link}
                      </a>
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <p className="text-sm text-gray-900 dark:text-white capitalize mt-1">{selectedBanner.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Created Date</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {new Date(selectedBanner.createdAt).toLocaleDateString('en-IN', {
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
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {new Date(selectedBanner.updatedAt).toLocaleDateString('en-IN', {
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

