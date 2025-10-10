import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import vendorService, { Vendor, CreateVendorFormData, UpdateVendorFormData } from "../../services/vendor";
import Swal from "sweetalert2";
export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const [addFormStep, setAddFormStep] = useState(0); // State for add form step
  const [editFormStep, setEditFormStep] = useState(0); // State for edit form step
  // Form state for creating vendor
  const [formData, setFormData] = useState<CreateVendorFormData>({
    name: "",
    email: "",
    phone: "",
    image: undefined,
    businessName: "",
    businessDescription: "",
    businessLogo: undefined,
    businessBanner: undefined,
    professionalInfo: { experience: 0, skills: [], certifications: [], bio: "" },
    services: [],
    businessAddress: { address: "", pincode: "", city: "", state: "", latitude: undefined, longitude: undefined },
    verification: { aadhaarNumber: "", aadhaarFront: undefined, aadhaarBack: undefined, panNumber: "", panImage: undefined, policeVerification: undefined },
    bankDetails: { accountNumber: "", accountHolderName: "", ifscCode: "", bankName: "" },
    availability: { workingDays: [], workingHours: { start: "09:00", end: "18:00" } },
    isActive: true,
    isApproved: false,
  });
  // Edit Vendor Form State
  const [editFormData, setEditFormData] = useState<UpdateVendorFormData>({
    vendorId: "",
    name: "",
    email: "",
    phone: "",
    image: undefined,
    businessName: "",
    businessDescription: "",
    businessLogo: undefined,
    businessBanner: undefined,
    professionalInfo: { experience: 0, skills: [], certifications: [], bio: "" },
    services: [],
    businessAddress: { address: "", pincode: "", city: "", state: "", latitude: undefined, longitude: undefined },
    verification: { aadhaarNumber: "", aadhaarFront: undefined, aadhaarBack: undefined, panNumber: "", panImage: undefined, policeVerification: undefined },
    bankDetails: { accountNumber: "", accountHolderName: "", ifscCode: "", bankName: "" },
    availability: { isOnline: false, workingDays: [], workingHours: { start: "09:00", end: "18:00" } },
    overallRating: undefined,
    totalRatings: undefined,
    completedJobs: undefined,
    responseRate: undefined,
    isActive: true,
    isApproved: false,
  });
  // Image previews for add
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [businessLogoPreview, setBusinessLogoPreview] = useState<string | null>(null);
  const [businessBannerPreview, setBusinessBannerPreview] = useState<string | null>(null);
  const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState<string | null>(null);
  const [aadhaarBackPreview, setAadhaarBackPreview] = useState<string | null>(null);
  const [panImagePreview, setPanImagePreview] = useState<string | null>(null);
  const [policeVerificationPreview, setPoliceVerificationPreview] = useState<string | null>(null);
  // Image previews for edit
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editBusinessLogoPreview, setEditBusinessLogoPreview] = useState<string | null>(null);
  const [editBusinessBannerPreview, setEditBusinessBannerPreview] = useState<string | null>(null);
  const [editAadhaarFrontPreview, setEditAadhaarFrontPreview] = useState<string | null>(null);
  const [editAadhaarBackPreview, setEditAadhaarBackPreview] = useState<string | null>(null);
  const [editPanImagePreview, setEditPanImagePreview] = useState<string | null>(null);
  const [editPoliceVerificationPreview, setEditPoliceVerificationPreview] = useState<string | null>(null);
  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Steps for the multi-step forms
  const addFormSteps = [
    "Personal Info",
    "Business Details",
    "Professional Info",
    "Business Address",
    "Verification Details",
    "Bank Details",
    "Availability"
  ];
  const editFormSteps = [
    "Personal Info",
    "Business Details",
    "Professional Info",
    "Business Address",
    "Verification Details",
    "Bank Details",
    "Availability"
  ];
  // Fetch vendors
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getAllVendors({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        isActive: filterStatus === "all" ? undefined : filterStatus === "active",
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
      await vendorService.updateVendor({ vendorId, isActive });
      fetchVendors();
    } catch (error) {
      console.error("Error updating vendor status:", error);
    }
  };
  // Handle delete with confirmation
  const handleDelete = async (vendorId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        await vendorService.deleteVendor(vendorId);
        fetchVendors();
      } catch (error) {
        console.error("Error deleting vendor:", error);
      }
    }
  };
  // Validate form
  const validateForm = (data: any) => {
    const newErrors: { [key: string]: string } = {};
    if (!data.name) newErrors.name = "Name is required";
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = "Valid email is required";
    if (!data.phone || !/^\d{10}$/.test(data.phone)) newErrors.phone = "Phone number must be 10 digits";
    if (!data.businessName) newErrors.businessName = "Business name is required";
    if (data.verification?.aadhaarNumber && !/^\d{12}$/.test(data.verification.aadhaarNumber)) {
      newErrors.aadhaarNumber = "Aadhaar number must be 12 digits";
    }
    if (data.verification?.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.verification.panNumber)) {
      newErrors.panNumber = "Invalid PAN format (e.g., ABCDE1234F)";
    }
    if (data.businessAddress?.pincode && !/^\d{6}$/.test(data.businessAddress.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    if (data.bankDetails?.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.bankDetails.ifscCode)) {
      newErrors.ifscCode = "Invalid IFSC code format (e.g., SBIN0001234)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Handle file change for add
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        switch (field) {
          case "image":
            setImagePreview(reader.result as string);
            setFormData({ ...formData, image: file });
            break;
          case "businessLogo":
            setBusinessLogoPreview(reader.result as string);
            setFormData({ ...formData, businessLogo: file });
            break;
          case "businessBanner":
            setBusinessBannerPreview(reader.result as string);
            setFormData({ ...formData, businessBanner: file });
            break;
          case "aadhaarFront":
            setAadhaarFrontPreview(reader.result as string);
            setFormData({ ...formData, verification: { ...formData.verification, aadhaarFront: file } });
            break;
          case "aadhaarBack":
            setAadhaarBackPreview(reader.result as string);
            setFormData({ ...formData, verification: { ...formData.verification, aadhaarBack: file } });
            break;
          case "panImage":
            setPanImagePreview(reader.result as string);
            setFormData({ ...formData, verification: { ...formData.verification, panImage: file } });
            break;
          case "policeVerification":
            setPoliceVerificationPreview(reader.result as string);
            setFormData({ ...formData, verification: { ...formData.verification, policeVerification: file } });
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  };
  // Handle file change for edit
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        switch (field) {
          case "image":
            setEditImagePreview(reader.result as string);
            setEditFormData({ ...editFormData, image: file });
            break;
          case "businessLogo":
            setEditBusinessLogoPreview(reader.result as string);
            setEditFormData({ ...editFormData, businessLogo: file });
            break;
          case "businessBanner":
            setEditBusinessBannerPreview(reader.result as string);
            setEditFormData({ ...editFormData, businessBanner: file });
            break;
          case "aadhaarFront":
            setEditAadhaarFrontPreview(reader.result as string);
            setEditFormData({ ...editFormData, verification: { ...editFormData.verification, aadhaarFront: file } });
            break;
          case "aadhaarBack":
            setEditAadhaarBackPreview(reader.result as string);
            setEditFormData({ ...editFormData, verification: { ...editFormData.verification, aadhaarBack: file } });
            break;
          case "panImage":
            setEditPanImagePreview(reader.result as string);
            setEditFormData({ ...editFormData, verification: { ...editFormData.verification, panImage: file } });
            break;
          case "policeVerification":
            setEditPoliceVerificationPreview(reader.result as string);
            setEditFormData({ ...editFormData, verification: { ...editFormData.verification, policeVerification: file } });
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  };
  // Handle add vendor
  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(formData)) return;
    setFormLoading(true);
    try {
      await vendorService.createVendor(formData);
      setMode('list');
      resetAddForm();
      fetchVendors();
    } catch (error) {
      console.error("Error creating vendor:", error);
    } finally {
      setFormLoading(false);
    }
  };
  const resetAddForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      image: undefined,
      businessName: "",
      businessDescription: "",
      businessLogo: undefined,
      businessBanner: undefined,
      professionalInfo: { experience: 0, skills: [], certifications: [], bio: "" },
      services: [],
      businessAddress: { address: "", pincode: "", city: "", state: "", latitude: undefined, longitude: undefined },
      verification: { aadhaarNumber: "", aadhaarFront: undefined, aadhaarBack: undefined, panNumber: "", panImage: undefined, policeVerification: undefined },
      bankDetails: { accountNumber: "", accountHolderName: "", ifscCode: "", bankName: "" },
      availability: { workingDays: [], workingHours: { start: "09:00", end: "18:00" } },
      isActive: true,
      isApproved: false,
    });
    setImagePreview(null);
    setBusinessLogoPreview(null);
    setBusinessBannerPreview(null);
    setAadhaarFrontPreview(null);
    setAadhaarBackPreview(null);
    setPanImagePreview(null);
    setPoliceVerificationPreview(null);
    setAddFormStep(0); // Reset step
  };
  // Load Edit Data
  const loadEditVendor = (vendor: any) => {
    setEditFormData({
      vendorId: vendor._id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      businessName: vendor.businessName,
      businessDescription: vendor.businessDescription || "",
      professionalInfo: vendor.professionalInfo || { experience: 0, skills: [], certifications: [], bio: "" },
      services: vendor.services || [],
      businessAddress: vendor.businessAddress || { address: "", pincode: "", city: "", state: "", latitude: undefined, longitude: undefined },
      verification: vendor.verification || { aadhaarNumber: "", panNumber: "", isVerified: false },
      bankDetails: vendor.bankDetails || { accountNumber: "", accountHolderName: "", ifscCode: "", bankName: "" },
      availability: vendor.availability || { isOnline: false, workingDays: [], workingHours: { start: "09:00", end: "18:00" } },
      overallRating: vendor.overallRating,
      totalRatings: vendor.totalRatings,
      completedJobs: vendor.completedJobs,
      responseRate: vendor.responseRate,
      isActive: vendor.isActive,
      isApproved: vendor.isApproved,
    });
    setEditImagePreview(vendor.image || null);
    setEditBusinessLogoPreview(vendor.businessLogo || null);
    setEditBusinessBannerPreview(vendor.businessBanner || null);
    setEditAadhaarFrontPreview(vendor.verification?.aadhaarFront || null);
    setEditAadhaarBackPreview(vendor.verification?.aadhaarBack || null);
    setEditPanImagePreview(vendor.verification?.panImage || null);
    setEditPoliceVerificationPreview(vendor.verification?.policeVerification || null);
    setMode('edit');
    setEditFormStep(0); // Reset step
  };
  // Handle Edit Vendor
  const handleEditVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(editFormData)) return;
    setFormLoading(true);
    try {
      await vendorService.updateVendor(editFormData);
      setMode('list');
      fetchVendors();
    } catch (error) {
      console.error("Error updating vendor:", error);
    } finally {
      setFormLoading(false);
    }
  };
  const getStatusBadge = (vendor: Vendor) => {
    return (
      <span
        onClick={() => handleStatusChange(vendor._id, !vendor.isActive)}
        className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
          vendor.isActive
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        {vendor.isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  // Navigation handlers for add form
  const handleAddNextStep = () => {
    if (addFormStep < addFormSteps.length - 1) {
      setAddFormStep(addFormStep + 1);
    }
  };

  const handleAddPrevStep = () => {
    if (addFormStep > 0) {
      setAddFormStep(addFormStep - 1);
    }
  };

  // Navigation handlers for edit form
  const handleEditNextStep = () => {
    if (editFormStep < editFormSteps.length - 1) {
      setEditFormStep(editFormStep + 1);
    }
  };

  const handleEditPrevStep = () => {
    if (editFormStep > 0) {
      setEditFormStep(editFormStep - 1);
    }
  };

  // Render form step content
  const renderAddFormStep = () => {
    switch (addFormStep) {
      case 0: // Personal Info
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter Service Partner name"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter email address"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "image")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Profile Preview" className="mt-2 h-24 w-24 object-cover rounded-lg" />
                )}
              </div>
            </div>
          </div>
        );
      case 1: // Business Details
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Business Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter business name"
                />
                {errors.businessName && <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Business Description
                </label>
                <textarea
                  rows={3}
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter business description (optional)"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Business Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "businessLogo")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {businessLogoPreview && (
                  <img src={businessLogoPreview} alt="Logo Preview" className="mt-2 h-24 w-24 object-cover rounded-lg" />
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Business Banner
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "businessBanner")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {businessBannerPreview && (
                  <img src={businessBannerPreview} alt="Banner Preview" className="mt-2 h-24 w-48 object-cover rounded-lg" />
                )}
              </div>
            </div>
          </div>
        );
      case 2: // Professional Info
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Professional Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Experience (years)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.professionalInfo.experience}
                  onChange={(e) => setFormData({ ...formData, professionalInfo: { ...formData.professionalInfo, experience: Number(e.target.value) } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter experience"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.professionalInfo.skills.join(', ')}
                  onChange={(e) => setFormData({ ...formData, professionalInfo: { ...formData.professionalInfo, skills: e.target.value.split(',').map(s => s.trim()) } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter skills"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={formData.professionalInfo.bio}
                  onChange={(e) => setFormData({ ...formData, professionalInfo: { ...formData.professionalInfo, bio: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter bio"
                />
              </div>
            </div>
          </div>
        );
      case 3: // Business Address
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Business Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.businessAddress.address}
                  onChange={(e) => setFormData({ ...formData, businessAddress: { ...formData.businessAddress, address: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter address"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.businessAddress.pincode}
                  onChange={(e) => setFormData({ ...formData, businessAddress: { ...formData.businessAddress, pincode: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter pincode"
                />
                {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  City
                </label>
                <input
                  type="text"
                  value={formData.businessAddress.city}
                  onChange={(e) => setFormData({ ...formData, businessAddress: { ...formData.businessAddress, city: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  State
                </label>
                <input
                  type="text"
                  value={formData.businessAddress.state}
                  onChange={(e) => setFormData({ ...formData, businessAddress: { ...formData.businessAddress, state: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.businessAddress.latitude || ""}
                  onChange={(e) => setFormData({ ...formData, businessAddress: { ...formData.businessAddress, latitude: Number(e.target.value) || undefined } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter latitude"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.businessAddress.longitude || ""}
                  onChange={(e) => setFormData({ ...formData, businessAddress: { ...formData.businessAddress, longitude: Number(e.target.value) || undefined } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter longitude"
                />
              </div>
            </div>
          </div>
        );
      case 4: // Verification Details
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Verification Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={formData.verification.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, verification: { ...formData.verification, aadhaarNumber: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter Aadhaar number"
                />
                {errors.aadhaarNumber && <p className="mt-1 text-xs text-red-500">{errors.aadhaarNumber}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.verification.panNumber}
                  onChange={(e) => setFormData({ ...formData, verification: { ...formData.verification, panNumber: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter PAN number"
                />
                {errors.panNumber && <p className="mt-1 text-xs text-red-500">{errors.panNumber}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Aadhaar Front
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "aadhaarFront")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {aadhaarFrontPreview && (
                  <img src={aadhaarFrontPreview} alt="Aadhaar Front Preview" className="mt-2 h-24 w-36 object-cover rounded-lg" />
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Aadhaar Back
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "aadhaarBack")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {aadhaarBackPreview && (
                  <img src={aadhaarBackPreview} alt="Aadhaar Back Preview" className="mt-2 h-24 w-36 object-cover rounded-lg" />
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  PAN Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "panImage")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {panImagePreview && (
                  <img src={panImagePreview} alt="PAN Image Preview" className="mt-2 h-24 w-36 object-cover rounded-lg" />
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Police Verification
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "policeVerification")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {policeVerificationPreview && (
                  <img src={policeVerificationPreview} alt="Police Verification Preview" className="mt-2 h-24 w-36 object-cover rounded-lg" />
                )}
              </div>
            </div>
          </div>
        );
      case 5: // Bank Details
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Bank Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.accountHolderName}
                  onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter account holder name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.ifscCode}
                  onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter IFSC code"
                />
                {errors.ifscCode && <p className="mt-1 text-xs text-red-500">{errors.ifscCode}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.bankName}
                  onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter bank name"
                />
              </div>
            </div>
          </div>
        );
      case 6: // Availability
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Availability</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Working Days (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.availability.workingDays.join(', ')}
                  onChange={(e) => setFormData({ ...formData, availability: { ...formData.availability, workingDays: e.target.value.split(',').map(s => s.trim().toLowerCase()) } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., monday, tuesday"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.availability.workingHours.start}
                  onChange={(e) => setFormData({ ...formData, availability: { ...formData.availability, workingHours: { ...formData.availability.workingHours, start: e.target.value } } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.availability.workingHours.end}
                  onChange={(e) => setFormData({ ...formData, availability: { ...formData.availability, workingHours: { ...formData.availability.workingHours, end: e.target.value } } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderEditFormStep = () => {
    switch (editFormStep) {
      case 0: // Personal Info
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter vendor name"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter email address"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={editFormData.phone || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEditFileChange(e, "image")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {editImagePreview && (
                  <img src={editImagePreview} alt="Profile Preview" className="mt-2 h-24 w-24 object-cover rounded-lg" />
                )}
              </div>
            </div>
          </div>
        );
      case 1: // Business Details
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Business Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.businessName || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, businessName: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter business name"
                />
                {errors.businessName && <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Business Description
                </label>
                <textarea
                  rows={3}
                  value={editFormData.businessDescription || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, businessDescription: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter business description (optional)"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Business Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEditFileChange(e, "businessLogo")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {editBusinessLogoPreview && (
                  <img src={editBusinessLogoPreview} alt="Logo Preview" className="mt-2 h-24 w-24 object-cover rounded-lg" />
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Business Banner
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEditFileChange(e, "businessBanner")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {editBusinessBannerPreview && (
                  <img src={editBusinessBannerPreview} alt="Banner Preview" className="mt-2 h-24 w-48 object-cover rounded-lg" />
                )}
              </div>
            </div>
          </div>
        );
      case 2: // Professional Info
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Professional Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Experience (years)
                </label>
                <input
                  type="number"
                  min={0}
                  value={editFormData.professionalInfo?.experience || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, professionalInfo: { ...editFormData.professionalInfo, experience: Number(e.target.value) } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter experience"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={editFormData.professionalInfo?.skills.join(', ') || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, professionalInfo: { ...editFormData.professionalInfo, skills: e.target.value.split(',').map(s => s.trim()) } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter skills"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={editFormData.professionalInfo?.bio || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, professionalInfo: { ...editFormData.professionalInfo, bio: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter bio"
                />
              </div>
            </div>
          </div>
        );
      case 3: // Business Address
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Business Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  value={editFormData.businessAddress?.address || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, businessAddress: { ...editFormData.businessAddress, address: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter address"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Pincode
                </label>
                <input
                  type="text"
                  value={editFormData.businessAddress?.pincode || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, businessAddress: { ...editFormData.businessAddress, pincode: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter pincode"
                />
                {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  City
                </label>
                <input
                  type="text"
                  value={editFormData.businessAddress?.city || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, businessAddress: { ...editFormData.businessAddress, city: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  State
                </label>
                <input
                  type="text"
                  value={editFormData.businessAddress?.state || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, businessAddress: { ...editFormData.businessAddress, state: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={editFormData.businessAddress?.latitude || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, businessAddress: { ...editFormData.businessAddress, latitude: Number(e.target.value) || undefined } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter latitude"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={editFormData.businessAddress?.longitude || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, businessAddress: { ...editFormData.businessAddress, longitude: Number(e.target.value) || undefined } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter longitude"
                />
              </div>
            </div>
          </div>
        );
      case 4: // Verification Details
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Verification Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={editFormData.verification?.aadhaarNumber || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, verification: { ...editFormData.verification, aadhaarNumber: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter Aadhaar number"
                />
                {errors.aadhaarNumber && <p className="mt-1 text-xs text-red-500">{errors.aadhaarNumber}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={editFormData.verification?.panNumber || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, verification: { ...editFormData.verification, panNumber: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter PAN number"
                />
                {errors.panNumber && <p className="mt-1 text-xs text-red-500">{errors.panNumber}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Aadhaar Front
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEditFileChange(e, "aadhaarFront")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {editAadhaarFrontPreview && (
                  <img src={editAadhaarFrontPreview} alt="Aadhaar Front Preview" className="mt-2 h-24 w-36 object-cover rounded-lg" />
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Aadhaar Back
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEditFileChange(e, "aadhaarBack")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {editAadhaarBackPreview && (
                  <img src={editAadhaarBackPreview} alt="Aadhaar Back Preview" className="mt-2 h-24 w-36 object-cover rounded-lg" />
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  PAN Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEditFileChange(e, "panImage")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {editPanImagePreview && (
                  <img src={editPanImagePreview} alt="PAN Image Preview" className="mt-2 h-24 w-36 object-cover rounded-lg" />
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Police Verification
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEditFileChange(e, "policeVerification")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {editPoliceVerificationPreview && (
                  <img src={editPoliceVerificationPreview} alt="Police Verification Preview" className="mt-2 h-24 w-36 object-cover rounded-lg" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editFormData.verification?.isVerified || false}
                  onChange={(e) => setEditFormData({ ...editFormData, verification: { ...editFormData.verification, isVerified: e.target.checked } })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Verified
                </label>
              </div>
            </div>
          </div>
        );
      case 5: // Bank Details
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Bank Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Account Number
                </label>
                <input
                  type="text"
                  value={editFormData.bankDetails?.accountNumber || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, bankDetails: { ...editFormData.bankDetails, accountNumber: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={editFormData.bankDetails?.accountHolderName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, bankDetails: { ...editFormData.bankDetails, accountHolderName: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter account holder name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={editFormData.bankDetails?.ifscCode || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, bankDetails: { ...editFormData.bankDetails, ifscCode: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter IFSC code"
                />
                {errors.ifscCode && <p className="mt-1 text-xs text-red-500">{errors.ifscCode}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={editFormData.bankDetails?.bankName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, bankDetails: { ...editFormData.bankDetails, bankName: e.target.value } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter bank name"
                />
              </div>
            </div>
          </div>
        );
      case 6: // Availability
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Availability</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Working Days (comma separated)
                </label>
                <input
                  type="text"
                  value={editFormData.availability?.workingDays.join(', ') || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, availability: { ...editFormData.availability, workingDays: e.target.value.split(',').map(s => s.trim().toLowerCase()) } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., monday, tuesday"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Start Time
                </label>
                <input
                  type="time"
                  value={editFormData.availability?.workingHours.start || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, availability: { ...editFormData.availability, workingHours: { ...editFormData.availability.workingHours, start: e.target.value } } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  End Time
                </label>
                <input
                  type="time"
                  value={editFormData.availability?.workingHours.end || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, availability: { ...editFormData.availability, workingHours: { ...editFormData.availability.workingHours, end: e.target.value } } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editFormData.availability?.isOnline || false}
                  onChange={(e) => setEditFormData({ ...editFormData, availability: { ...editFormData.availability, isOnline: e.target.checked } })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Is Online
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editFormData.isActive || false}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Active Status
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editFormData.isApproved || false}
                  onChange={(e) => setEditFormData({ ...editFormData, isApproved: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Approved
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <>
      <PageMeta title="Service Partner | Admin Panel" description="Manage vendors on the platform" />
      <PageBreadcrumb pageTitle="Service Partner" />
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:p-8">
        {mode === 'list' && (
          <>
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Service Partner</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Total Vendors: <span className="font-semibold text-gray-900 dark:text-white">{totalDocs}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  resetAddForm();
                  setMode('add');
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Service Partner
              </button>
            </div>
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search Service Partner by name, email, or phone..."
                  className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <select
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
              <div className="py-16 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Service Partner...</p>
              </div>
            ) : (
              <>
                {/* Vendors Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-xs font-semibold uppercase text-gray-700 dark:from-gray-700 dark:to-gray-750 dark:text-gray-300">
                      <tr>
                        <th scope="col" className="px-6 py-4">Service Partner</th>
                        <th scope="col" className="px-6 py-4">Business</th>
                        <th scope="col" className="px-6 py-4">Contact</th>
                        <th scope="col" className="px-6 py-4">Status</th>
                        <th scope="col" className="px-6 py-4">Performance</th>
                        <th scope="col" className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {vendors.map((vendor) => (
                        <tr key={vendor._id} className="bg-white transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                                <span className="text-lg font-bold text-white">
                                  {vendor.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {vendor.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {vendor.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {vendor.businessName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {vendor.businessDescription?.substring(0, 40) || 'No description'}
                              {vendor.businessDescription && vendor.businessDescription.length > 40 && '...'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white font-medium">
                              {vendor.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(vendor)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572 .955-4.756 4.635 1.123 6.545z"/>
                              </svg>
                              {vendor.overallRating ? Number(vendor.overallRating).toFixed(1) : '0.0'}
                              <span className="text-xs text-gray-500 dark:text-gray-400">({vendor.totalRatings || 0})</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {vendor.completedJobs || 0} jobs completed
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  setShowModal(true);
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white rounded-lg transition-colors"
                                title="View Details"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => loadEditVendor(vendor)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit Service Partner"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(vendor._id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
                  <div className="py-16 text-center">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-6.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Service Partners found</p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      No service partners match your search criteria. Try adjusting your filters.
                    </p>
                  </div>
                )}
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing page <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
        {mode === 'add' && (
          <div className="w-full max-w-4xl">
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Add New Service Partner
              </h3>
              <button
                onClick={() => setMode('list')}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddVendor} className="space-y-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between mb-4">
                  {addFormSteps.map((step, index) => (
                    <div
                      key={step}
                      className={`flex-1 text-center text-sm font-medium ${
                        index <= addFormStep ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          index <= addFormStep 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      {step}
                      {index < addFormSteps.length - 1 && (
                        <div className={`h-1 mt-2 mx-2 ${
                          index < addFormStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              {renderAddFormStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleAddPrevStep}
                  disabled={addFormStep === 0}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('list')}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  {addFormStep < addFormSteps.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleAddNextStep}
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {formLoading ? "Creating..." : "Create Service Partner"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
        {mode === 'edit' && (
          <div className="w-full max-w-4xl">
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Service Partner
              </h3>
              <button
                onClick={() => setMode('list')}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditVendor} className="space-y-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between mb-4">
                  {editFormSteps.map((step, index) => (
                    <div
                      key={step}
                      className={`flex-1 text-center text-sm font-medium ${
                        index <= editFormStep ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          index <= editFormStep 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      {step}
                      {index < editFormSteps.length - 1 && (
                        <div className={`h-1 mt-2 mx-2 ${
                          index < editFormStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              {renderEditFormStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleEditPrevStep}
                  disabled={editFormStep === 0}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('list')}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  {editFormStep < editFormSteps.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleEditNextStep}
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {formLoading ? "Updating..." : "Update Service Partner"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
      {/* Vendor Detail Modal */}
      {showModal && selectedVendor && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowModal(false)}
            ></div>
            <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
              <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Service Partner Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-6 dark:from-blue-900/20 dark:to-blue-800/20">
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {selectedVendor.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedVendor.name}
                    </h4>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedVendor.email}</p>
                    <div className="mt-3">
                      {getStatusBadge(selectedVendor)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Phone Number
                    </label>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedVendor.phone}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Business Name
                    </label>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedVendor.businessName}</p>
                  </div>
                  <div className="col-span-2 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Business Description
                    </label>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedVendor.businessDescription || 'No description available'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Rating
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-lg font-bold text-amber-600 dark:text-amber-400">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572 .955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                        {selectedVendor.overallRating ? Number(selectedVendor.overallRating).toFixed(1) : '0.0'} / 5
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({selectedVendor.totalRatings || 0} ratings)
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Completed Jobs
                    </label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedVendor.completedJobs || 0}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <button
                    onClick={() => setShowModal(false)}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}