import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import vendorService, { Vendor, CreateVendorFormData, UpdateVendorFormData } from "../../services/vendor";
import apiService, { Service, Subcategory } from "../../services/api";
import { IMAGE_BASE_URL } from "../../services/api";
import Swal from "sweetalert2";
export default function VendorManagement() {
  // Helper function to resolve image URLs with base URL
  const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) return path;
    if (path.startsWith('/')) return `${IMAGE_BASE_URL}${path}`;
    return `${IMAGE_BASE_URL}/${path}`;
  };

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
  
  // Services and Subcategories
  const [services, setServices] = useState<Service[]>([]);
  const [subcategories, setSubcategories] = useState<{ [serviceId: string]: Subcategory[] }>({});

  // Steps for the multi-step forms
  const addFormSteps = [
    "Personal Info",
    "Business Details",
    "Professional Info",
    "Services",
    "Business Address",
    "Verification Details",
    "Bank Details",
    "Availability"
  ];
  const editFormSteps = [
    "Personal Info",
    "Business Details",
    "Professional Info",
    "Services",
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

  // Fetch services and subcategories
  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        setLoadingServices(true);
        const response = await apiService.getServices({ page: 1, limit: 100 });
        if (response.data) {
          setServices(response.data.docs);
          // Fetch subcategories for each service
          const subcatsMap: { [serviceId: string]: Subcategory[] } = {};
          for (const service of response.data.docs) {
            try {
              const serviceResponse = await apiService.getService(service._id);
              if (serviceResponse.data && serviceResponse.data.subCategories) {
                subcatsMap[service._id] = serviceResponse.data.subCategories;
              }
            } catch (err) {
              console.error(`Error fetching subcategories for service ${service._id}:`, err);
            }
          }
          setSubcategories(subcatsMap);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoadingServices(false);
      }
    };
    if (mode === 'add' || mode === 'edit') {
      fetchServicesData();
    }
  }, [mode]);
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
  const validateForm = (data: any, showAlert: boolean = false) => {
    const newErrors: { [key: string]: string } = {};
    const missingFields: string[] = [];
    
    if (!data.name) {
      newErrors.name = "Name is required";
      missingFields.push("Name");
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Valid email is required";
      if (!data.email) missingFields.push("Email");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) missingFields.push("Valid Email");
    }
    if (!data.phone) {
      newErrors.phone = "Phone number is required";
      missingFields.push("Phone");
    } else if (!/^\d{10}$/.test(data.phone)) {
      if (data.phone.length > 10) {
        newErrors.phone = "Phone number must be exactly 10 digits (not more than 10)";
        missingFields.push("Valid Phone (max 10 digits)");
      } else {
        newErrors.phone = "Phone number must be exactly 10 digits";
        missingFields.push("Valid Phone (10 digits)");
      }
    }
    if (!data.businessName) {
      newErrors.businessName = "Business name is required";
      missingFields.push("Business Name");
    }
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
    // Validate services - ensure category and subcategory are selected
    if (data.services && Array.isArray(data.services) && data.services.length > 0) {
      data.services.forEach((service: any, index: number) => {
        if (!service.category || service.category === "") {
          newErrors[`service_${index}_category`] = `Service ${index + 1}: Category is required`;
          missingFields.push(`Service ${index + 1} - Category`);
        } else {
          // Check if category has subcategories
          const categorySubcats = subcategories[service.category];
          // Always require subcategory if category is selected (backend requirement)
          if (!service.subcategory || service.subcategory === "") {
            if (categorySubcats && categorySubcats.length > 0) {
              newErrors[`service_${index}_subcategory`] = `Service ${index + 1}: Subcategory is required`;
              missingFields.push(`Service ${index + 1} - Subcategory`);
            } else {
              // If category has no subcategories, we still need to handle it
              // For now, we'll require subcategory anyway as backend requires it
              newErrors[`service_${index}_subcategory`] = `Service ${index + 1}: Subcategory is required (This category may not have subcategories available)`;
              missingFields.push(`Service ${index + 1} - Subcategory`);
            }
          }
        }
      });
    }
    
    setErrors(newErrors);
    
    // Show SweetAlert with missing required fields
    if (showAlert && missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Fields Missing',
        html: `
          <div class="text-left">
            <p class="mb-3 font-semibold">Please fill in the following required fields:</p>
            <ul class="list-disc list-inside space-y-1">
              ${missingFields.map(field => `<li class="text-sm">${field}</li>`).join('')}
            </ul>
          </div>
        `,
        confirmButtonColor: '#013365',
        confirmButtonText: 'OK'
      });
    }
    
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
    if (!validateForm(formData, true)) return;
    
    // Filter out services without category or subcategory before sending
    // Backend requires subcategory, so we must have it
    const validServices = formData.services
      .filter((service: any) => 
        service.category && 
        service.category !== "" && 
        service.subcategory && 
        service.subcategory !== ""
      )
      .map((service: any) => ({
        category: service.category,
        subcategory: service.subcategory, // Ensure it's a string ID
        basePrice: Number(service.basePrice) || 0,
        priceType: service.priceType || 'fixed',
        description: service.description || "",
        duration: Number(service.duration) || 60,
        isActive: service.isActive !== undefined ? service.isActive : true,
      }));
    
    if (formData.services.length > 0 && validServices.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Services Validation Failed',
        html: 'Please ensure all services have both <strong>Category</strong> and <strong>Subcategory</strong> selected before submitting.',
        confirmButtonColor: '#013365'
      });
      // Go to services step
      setAddFormStep(3);
      return;
    }
    
    const dataToSend = {
      ...formData,
      services: validServices
    };
    
    setFormLoading(true);
    try {
      await vendorService.createVendor(dataToSend);
      setMode('list');
      resetAddForm();
      fetchVendors();
    } catch (error: any) {
      console.error("Error creating vendor:", error);
      // Show error message if backend validation fails
      const errorMessage = error?.message || 'An error occurred while creating the vendor';
      if (errorMessage.includes('subcategory') || errorMessage.includes('validation failed')) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          html: `
            <div class="text-left">
              <p class="mb-2">Please ensure all services have both <strong>Category</strong> and <strong>Subcategory</strong> selected.</p>
              <p class="text-sm text-gray-600">Error: ${errorMessage}</p>
            </div>
          `,
          confirmButtonColor: '#013365'
        });
        // Go to services step
        setAddFormStep(3);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#013365'
        });
      }
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
  const loadEditVendor = async (vendor: any) => {
    try {
      console.log("Loading vendor for edit:", vendor);
      
      // Map services to use IDs instead of objects
      // Filter out services with null subcategory - they need to be re-selected
      const mappedServices = (vendor.services || [])
        .filter((service: any) => {
          // Keep services that have a valid subcategory (not null)
          const subcatId = typeof service.subcategory === 'object' ? service.subcategory?._id : service.subcategory;
          return subcatId && subcatId !== null && subcatId !== "";
        })
        .map((service: any) => ({
          category: typeof service.category === 'object' ? service.category._id : service.category,
          subcategory: typeof service.subcategory === 'object' ? service.subcategory._id : service.subcategory,
          basePrice: service.basePrice || 0,
          priceType: service.priceType || 'fixed',
          description: service.description || "",
          duration: service.duration || 60,
          isActive: service.isActive !== undefined ? service.isActive : true,
        }));
      
      // If some services were filtered out (had null subcategory), show a warning
      const filteredCount = (vendor.services || []).length - mappedServices.length;
      if (filteredCount > 0) {
        Swal.fire({
          icon: 'info',
          title: 'Services Updated',
          html: `${filteredCount} service(s) had missing subcategories and were removed. Please add them again with proper subcategory selection.`,
          confirmButtonColor: '#013365'
        });
      }
      
      // Set form data first
      setEditFormData({
        vendorId: vendor._id,
        name: vendor.name || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        businessName: vendor.businessName || "",
        businessDescription: vendor.businessDescription || "",
        professionalInfo: vendor.professionalInfo || { experience: 0, skills: [], certifications: [], bio: "" },
        services: mappedServices,
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
      
      // Set image previews with base URL
      setEditImagePreview(getImageUrl(vendor.image));
      setEditBusinessLogoPreview(getImageUrl(vendor.businessLogo));
      setEditBusinessBannerPreview(getImageUrl(vendor.businessBanner));
      setEditAadhaarFrontPreview(getImageUrl(vendor.verification?.aadhaarFront));
      setEditAadhaarBackPreview(getImageUrl(vendor.verification?.aadhaarBack));
      setEditPanImagePreview(getImageUrl(vendor.verification?.panImage));
      setEditPoliceVerificationPreview(getImageUrl(vendor.verification?.policeVerification));
      
      // Reset form step
      setEditFormStep(0);
      
      // Fetch services and subcategories if not already loaded (don't await - do it in background)
      if (services.length === 0) {
        // Don't block modal opening - fetch in background
        apiService.getServices({ page: 1, limit: 100 })
          .then((response) => {
            if (response.data) {
              setServices(response.data.docs);
              // Fetch subcategories for each service
              const subcatsMap: { [serviceId: string]: Subcategory[] } = {};
              const fetchPromises = response.data.docs.map(async (service: any) => {
                try {
                  const serviceResponse = await apiService.getService(service._id);
                  if (serviceResponse.data && serviceResponse.data.subCategories) {
                    subcatsMap[service._id] = serviceResponse.data.subCategories;
                  }
                } catch (err) {
                  console.error(`Error fetching subcategories for service ${service._id}:`, err);
                }
              });
              Promise.all(fetchPromises).then(() => {
                setSubcategories(subcatsMap);
              });
            }
          })
          .catch((error) => {
            console.error("Error fetching services:", error);
          })
          .finally(() => {
            setLoadingServices(false);
          });
      }
      
      // Set mode to edit - this opens the modal (do this last)
      console.log("Setting mode to edit");
      setMode('edit');
    } catch (error) {
      console.error("Error loading vendor for edit:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load vendor data. Please try again.',
        confirmButtonColor: '#013365'
      });
    }
  };
  // Handle Edit Vendor
  const handleEditVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only submit if we're on the last step (step 7 - Availability)
    if (editFormStep !== editFormSteps.length - 1) {
      // If not on last step, prevent submission completely
      console.log("Submission blocked - not on last step. Current:", editFormStep, "Required:", editFormSteps.length - 1);
      return;
    }
    
    if (!validateForm(editFormData, true)) return;
    
    // Filter out services without category or subcategory before sending
    // Backend requires subcategory, so we must have it
    const validServices = (editFormData.services || [])
      .filter((service: any) => 
        service.category && 
        service.category !== "" && 
        service.subcategory && 
        service.subcategory !== ""
      )
      .map((service: any) => ({
        category: typeof service.category === 'object' ? service.category._id : service.category,
        subcategory: typeof service.subcategory === 'object' ? service.subcategory._id : service.subcategory,
        basePrice: Number(service.basePrice) || 0,
        priceType: service.priceType || 'fixed',
        description: service.description || "",
        duration: Number(service.duration) || 60,
        isActive: service.isActive !== undefined ? service.isActive : true,
      }));
    
    if ((editFormData.services || []).length > 0 && validServices.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Services Validation Failed',
        html: 'Please ensure all services have both <strong>Category</strong> and <strong>Subcategory</strong> selected before submitting.',
        confirmButtonColor: '#013365'
      });
      // Go to services step
      setEditFormStep(3);
      return;
    }
    
    const dataToSend = {
      ...editFormData,
      services: validServices
    };
    
    setFormLoading(true);
    try {
      await vendorService.updateVendor(dataToSend);
      setMode('list');
      fetchVendors();
    } catch (error: any) {
      console.error("Error updating vendor:", error);
      // Show error message if backend validation fails
      const errorMessage = error?.message || 'An error occurred while updating the vendor';
      if (errorMessage.includes('subcategory') || errorMessage.includes('validation failed')) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          html: `
            <div class="text-left">
              <p class="mb-2">Please ensure all services have both <strong>Category</strong> and <strong>Subcategory</strong> selected.</p>
              <p class="text-sm text-gray-600">Error: ${errorMessage}</p>
            </div>
          `,
          confirmButtonColor: '#013365'
        });
        // Go to services step
        setEditFormStep(3);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#013365'
        });
      }
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
  const handleEditNextStep = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (editFormStep < editFormSteps.length - 1) {
      setEditFormStep(editFormStep + 1);
    }
  };

  const handleEditPrevStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    if (value.length <= 10) {
                      setFormData({ ...formData, phone: value });
                      // Clear error when user types
                      if (errors.phone) {
                        const newErrors = { ...errors };
                        delete newErrors.phone;
                        setErrors(newErrors);
                      }
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter 10 digit phone number"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                {formData.phone && formData.phone.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.phone.length}/10 digits
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "image")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  value={formData.professionalInfo.experience === 0 ? "" : formData.professionalInfo.experience}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setFormData({ ...formData, professionalInfo: { ...formData.professionalInfo, experience: 0 } });
                    } else {
                      setFormData({ ...formData, professionalInfo: { ...formData.professionalInfo, experience: Number(value) || 0 } });
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter bio"
                />
              </div>
            </div>
          </div>
        );
      case 3: // Services
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Services</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Add services that this partner offers. Select category and subcategory for each service.
            </p>
            {formData.services.map((service, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="mb-4 flex items-center justify-between">
                  <h5 className="font-semibold text-gray-900 dark:text-white">Service {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => {
                      const newServices = formData.services.filter((_, i) => i !== index);
                      setFormData({ ...formData, services: newServices });
                    }}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={service.category || ""}
                      onChange={(e) => {
                        const newServices = [...formData.services];
                        newServices[index] = {
                          ...newServices[index],
                          category: e.target.value,
                          subcategory: "" // Reset subcategory when category changes
                        };
                        setFormData({ ...formData, services: newServices });
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Category</option>
                      {services.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {errors[`service_${index}_category`] && (
                      <p className="mt-1 text-xs text-red-500">{errors[`service_${index}_category`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Subcategory <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={service.subcategory || ""}
                      onChange={(e) => {
                        const newServices = [...formData.services];
                        newServices[index] = { ...newServices[index], subcategory: e.target.value };
                        setFormData({ ...formData, services: newServices });
                        // Clear error when subcategory is selected
                        if (errors[`service_${index}_subcategory`]) {
                          const newErrors = { ...errors };
                          delete newErrors[`service_${index}_subcategory`];
                          setErrors(newErrors);
                        }
                      }}
                      disabled={!service.category}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:bg-gray-700 dark:text-white ${
                        errors[`service_${index}_subcategory`] 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:border-[#013365] dark:border-gray-600'
                      } ${!service.category ? 'bg-gray-100 cursor-not-allowed dark:bg-gray-800' : 'bg-white'}`}
                    >
                      <option value="">{service.category ? "Select Subcategory" : "Select category first"}</option>
                      {service.category && subcategories[service.category]?.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                      {service.category && (!subcategories[service.category] || subcategories[service.category].length === 0) && (
                        <option value="">No subcategories available</option>
                      )}
                    </select>
                    {errors[`service_${index}_subcategory`] && (
                      <p className="mt-1 text-xs text-red-500">{errors[`service_${index}_subcategory`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Base Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={service.basePrice || ""}
                      onChange={(e) => {
                        const newServices = [...formData.services];
                        newServices[index] = { ...newServices[index], basePrice: Number(e.target.value) || 0 };
                        setFormData({ ...formData, services: newServices });
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter base price"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Price Type
                    </label>
                    <select
                      value={service.priceType || "fixed"}
                      onChange={(e) => {
                        const newServices = [...formData.services];
                        newServices[index] = { ...newServices[index], priceType: e.target.value as any };
                        setFormData({ ...formData, services: newServices });
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="hourly">Hourly</option>
                      <option value="sqft">Per Sqft</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={service.duration || ""}
                      onChange={(e) => {
                        const newServices = [...formData.services];
                        newServices[index] = { ...newServices[index], duration: Number(e.target.value) || 60 };
                        setFormData({ ...formData, services: newServices });
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Duration in minutes"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <input
                      type="text"
                      value={service.description || ""}
                      onChange={(e) => {
                        const newServices = [...formData.services];
                        newServices[index] = { ...newServices[index], description: e.target.value };
                        setFormData({ ...formData, services: newServices });
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Service description"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  services: [
                    ...formData.services,
                    { category: "", subcategory: "", basePrice: 0, priceType: "fixed", description: "", duration: 60, isActive: true }
                  ]
                });
              }}
              className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-[#013365] hover:bg-[#013365]/5 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-[#013365]"
            >
              + Add Service
            </button>
          </div>
        );
      case 4: // Business Address
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter longitude"
                />
              </div>
            </div>
          </div>
        );
      case 5: // Verification Details
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {policeVerificationPreview && (
                  <img src={policeVerificationPreview} alt="Police Verification Preview" className="mt-2 h-24 w-36 object-cover rounded-lg" />
                )}
              </div>
            </div>
          </div>
        );
      case 6: // Bank Details
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter bank name"
                />
              </div>
            </div>
          </div>
        );
      case 7: // Availability
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Availability</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Working Days
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <label key={day} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.availability.workingDays.includes(day)}
                        onChange={(e) => {
                          const newDays = e.target.checked
                            ? [...formData.availability.workingDays, day]
                            : formData.availability.workingDays.filter(d => d !== day);
                          setFormData({ ...formData, availability: { ...formData.availability, workingDays: newDays } });
                        }}
                        className="h-4 w-4 text-[#013365] focus:ring-[#013365] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.availability.workingHours.start}
                  onChange={(e) => setFormData({ ...formData, availability: { ...formData.availability, workingHours: { ...formData.availability.workingHours, start: e.target.value } } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  maxLength={10}
                  value={editFormData.phone || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    if (value.length <= 10) {
                      setEditFormData({ ...editFormData, phone: value });
                      // Clear error when user types
                      if (errors.phone) {
                        const newErrors = { ...errors };
                        delete newErrors.phone;
                        setErrors(newErrors);
                      }
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter 10 digit phone number"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                {editFormData.phone && editFormData.phone.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {editFormData.phone.length}/10 digits
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleEditFileChange(e, "image")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  value={(editFormData.professionalInfo?.experience || 0) === 0 ? "" : (editFormData.professionalInfo?.experience || 0)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setEditFormData({ ...editFormData, professionalInfo: { ...editFormData.professionalInfo, experience: 0 } });
                    } else {
                      setEditFormData({ ...editFormData, professionalInfo: { ...editFormData.professionalInfo, experience: Number(value) || 0 } });
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter bio"
                />
              </div>
            </div>
          </div>
        );
      case 3: // Services
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Services</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Add services that this partner offers. Select category and subcategory for each service.
            </p>
            {(editFormData.services || []).map((service, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="mb-4 flex items-center justify-between">
                  <h5 className="font-semibold text-gray-900 dark:text-white">Service {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => {
                      const newServices = (editFormData.services || []).filter((_, i) => i !== index);
                      setEditFormData({ ...editFormData, services: newServices });
                    }}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={service.category || ""}
                      onChange={(e) => {
                        const newServices = [...(editFormData.services || [])];
                        newServices[index] = {
                          ...newServices[index],
                          category: e.target.value,
                          subcategory: "" // Reset subcategory when category changes
                        };
                        setEditFormData({ ...editFormData, services: newServices });
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Category</option>
                      {services.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {errors[`service_${index}_category`] && (
                      <p className="mt-1 text-xs text-red-500">{errors[`service_${index}_category`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Subcategory <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={service.subcategory || ""}
                      onChange={(e) => {
                        const newServices = [...(editFormData.services || [])];
                        newServices[index] = { ...newServices[index], subcategory: e.target.value };
                        setEditFormData({ ...editFormData, services: newServices });
                        // Clear error when subcategory is selected
                        if (errors[`service_${index}_subcategory`]) {
                          const newErrors = { ...errors };
                          delete newErrors[`service_${index}_subcategory`];
                          setErrors(newErrors);
                        }
                      }}
                      disabled={!service.category}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:bg-gray-700 dark:text-white ${
                        errors[`service_${index}_subcategory`] 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:border-[#013365] dark:border-gray-600'
                      } ${!service.category ? 'bg-gray-100 cursor-not-allowed dark:bg-gray-800' : 'bg-white'}`}
                    >
                      <option value="">{service.category ? "Select Subcategory" : "Select category first"}</option>
                      {service.category && subcategories[service.category]?.map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                      {service.category && (!subcategories[service.category] || subcategories[service.category].length === 0) && (
                        <option value="">No subcategories available</option>
                      )}
                    </select>
                    {errors[`service_${index}_subcategory`] && (
                      <p className="mt-1 text-xs text-red-500">{errors[`service_${index}_subcategory`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Base Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={service.basePrice || ""}
                      onChange={(e) => {
                        const newServices = [...(editFormData.services || [])];
                        newServices[index] = { ...newServices[index], basePrice: Number(e.target.value) || 0 };
                        setEditFormData({ ...editFormData, services: newServices });
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter base price"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Price Type
                    </label>
                    <select
                      value={service.priceType || "fixed"}
                      onChange={(e) => {
                        const newServices = [...(editFormData.services || [])];
                        newServices[index] = { ...newServices[index], priceType: e.target.value as any };
                        setEditFormData({ ...editFormData, services: newServices });
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="hourly">Hourly</option>
                      <option value="sqft">Per Sqft</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={service.duration || ""}
                      onChange={(e) => {
                        const newServices = [...(editFormData.services || [])];
                        newServices[index] = { ...newServices[index], duration: Number(e.target.value) || 60 };
                        setEditFormData({ ...editFormData, services: newServices });
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Duration in minutes"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <input
                      type="text"
                      value={service.description || ""}
                      onChange={(e) => {
                        const newServices = [...(editFormData.services || [])];
                        newServices[index] = { ...newServices[index], description: e.target.value };
                        setEditFormData({ ...editFormData, services: newServices });
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Service description"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setEditFormData({
                  ...editFormData,
                  services: [
                    ...(editFormData.services || []),
                    { category: "", subcategory: "", basePrice: 0, priceType: "fixed", description: "", duration: 60, isActive: true }
                  ]
                });
              }}
              className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-[#013365] hover:bg-[#013365]/5 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-[#013365]"
            >
              + Add Service
            </button>
          </div>
        );
      case 4: // Business Address
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter longitude"
                />
              </div>
            </div>
          </div>
        );
      case 5: // Verification Details
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="h-4 w-4 text-[#013365] focus:ring-[#013365] border-gray-300 rounded"
                />
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Verified
                </label>
              </div>
            </div>
          </div>
        );
      case 6: // Bank Details
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editFormStep < editFormSteps.length - 1) {
                      e.preventDefault();
                      handleEditNextStep();
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editFormStep < editFormSteps.length - 1) {
                      e.preventDefault();
                      handleEditNextStep();
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editFormStep < editFormSteps.length - 1) {
                      e.preventDefault();
                      handleEditNextStep();
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editFormStep < editFormSteps.length - 1) {
                      e.preventDefault();
                      handleEditNextStep();
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter bank name"
                />
              </div>
            </div>
          </div>
        );
      case 7: // Availability
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Availability</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Working Days
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <label key={day} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(editFormData.availability?.workingDays || []).includes(day)}
                        onChange={(e) => {
                          const currentDays = editFormData.availability?.workingDays || [];
                          const newDays = e.target.checked
                            ? [...currentDays, day]
                            : currentDays.filter(d => d !== day);
                          setEditFormData({ ...editFormData, availability: { ...editFormData.availability, workingDays: newDays } });
                        }}
                        className="h-4 w-4 text-[#013365] focus:ring-[#013365] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Start Time
                </label>
                <input
                  type="time"
                  value={editFormData.availability?.workingHours.start || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, availability: { ...editFormData.availability, workingHours: { ...editFormData.availability.workingHours, start: e.target.value } } })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editFormData.availability?.isOnline || false}
                  onChange={(e) => setEditFormData({ ...editFormData, availability: { ...editFormData.availability, isOnline: e.target.checked } })}
                  className="h-4 w-4 text-[#013365] focus:ring-[#013365] border-gray-300 rounded"
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
                  className="h-4 w-4 text-[#013365] focus:ring-[#013365] border-gray-300 rounded"
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
                  className="h-4 w-4 text-[#013365] focus:ring-[#013365] border-gray-300 rounded"
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#013365] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#013365]/30 transition-all hover:shadow-xl hover:shadow-[#013365]/40 hover:-translate-y-0.5"
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
                  className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-[#013365]"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <select
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-[#013365] focus:outline-none focus:ring-2 focus:ring-[#013365]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#013365] border-r-transparent"></div>
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
                        <th scope="col" className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {vendors.map((vendor) => (
                        <tr key={vendor._id} className="bg-white transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 dark:bg-white/10 dark:text-white/80">
                                <span className="text-xs font-semibold">{vendor.name.charAt(0).toUpperCase()}</span>
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
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  setShowModal(true);
                                }}
                                className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-[#013365] hover:bg-blue-200 hover:text-[#013365]/80 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 transition-colors duration-200"
                                title="View Details"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => loadEditVendor(vendor)}
                                className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-blue-100 text-[#013365] hover:bg-blue-200 hover:text-[#013365]/80 dark:bg-blue-900 dark:text-blue-400 dark:hover:bg-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 transition-colors duration-200"
                                title="Edit Service Partner"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(vendor._id)}
                                className="flex items-center justify-center w-[30px] h-[30px] rounded-md bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800 dark:hover:text-red-300 border border-red-300 dark:border-red-700 transition-colors duration-200"
                                title="Delete"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {/* </div> */}
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
                        index <= addFormStep ? 'text-[#013365] dark:text-[#013365]' : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          index <= addFormStep 
                            ? 'bg-[#013365] text-white' 
                            : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      {step}
                      {index < addFormSteps.length - 1 && (
                        <div className={`h-1 mt-2 mx-2 ${
                          index < addFormStep ? 'bg-[#013365]' : 'bg-gray-200 dark:bg-gray-700'
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
                      className="rounded-lg bg-[#013365] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="rounded-lg bg-[#013365] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
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
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Only allow submission on last step (step 7 - Availability)
                if (editFormStep === editFormSteps.length - 1) {
                  handleEditVendor(e);
                } else {
                  // If not on last step, prevent any submission
                  console.log("Form submission prevented - not on last step. Current step:", editFormStep, "Last step:", editFormSteps.length - 1);
                }
              }} 
              onKeyDown={(e) => {
                // Prevent form submission on Enter key unless on last step
                if (e.key === 'Enter') {
                  if (editFormStep < editFormSteps.length - 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Go to next step instead
                    handleEditNextStep(e);
                  }
                  // If on last step, allow Enter to submit
                }
              }}
              className="space-y-6"
            >
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between mb-4">
                  {editFormSteps.map((step, index) => (
                    <div
                      key={step}
                      className={`flex-1 text-center text-sm font-medium ${
                        index <= editFormStep ? 'text-[#013365] dark:text-[#013365]' : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          index <= editFormStep 
                            ? 'bg-[#013365] text-white' 
                            : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      {step}
                      {index < editFormSteps.length - 1 && (
                        <div className={`h-1 mt-2 mx-2 ${
                          index < editFormStep ? 'bg-[#013365]' : 'bg-gray-200 dark:bg-gray-700'
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditPrevStep(e);
                  }}
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditNextStep(e);
                      }}
                      className="rounded-lg bg-[#013365] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={formLoading}
                      onClick={(e) => {
                        // Only submit if we're on the last step
                        if (editFormStep === editFormSteps.length - 1) {
                          // Let form submission handle it
                          return;
                        }
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="rounded-lg bg-[#013365] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl bg-white shadow-2xl dark:bg-gray-800 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700 flex-shrink-0">
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
              <div className="overflow-y-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 rounded-xl bg-[#013365]/10 p-6 dark:bg-[#013365]/20">
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-[#013365] shadow-lg">
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

                {/* Basic Info */}
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

                {/* Professional Info */}
                {selectedVendor.professionalInfo && (
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h5 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Professional Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Experience
                        </label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedVendor.professionalInfo.experience || 0} years
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Skills
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(selectedVendor.professionalInfo.skills || []).map((skill, idx) => (
                            <span key={idx} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      {selectedVendor.professionalInfo.bio && (
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Bio
                          </label>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {selectedVendor.professionalInfo.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Services */}
                {selectedVendor.services && selectedVendor.services.length > 0 && (
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h5 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Services ({selectedVendor.services.length})</h5>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedVendor.services.map((service: any, idx: number) => (
                        <div key={idx} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {service.category?.name || 'Unknown Category'}
                              </p>
                              {service.subcategory && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  Subcategory: {service.subcategory.name}
                                </p>
                              )}
                              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Price: ₹{service.basePrice || 0} ({service.priceType || 'fixed'})
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  Duration: {service.duration || 60} min
                                </span>
                                {service.description && (
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {service.description}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${
                              service.isActive 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Business Address */}
                {selectedVendor.businessAddress && (
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h5 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Business Address</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Address
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedVendor.businessAddress.address || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          City
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedVendor.businessAddress.city || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          State
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedVendor.businessAddress.state || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Pincode
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedVendor.businessAddress.pincode || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Availability */}
                {selectedVendor.availability && (
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h5 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Availability</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Working Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(selectedVendor.availability.workingDays || []).length > 0 ? (
                            (selectedVendor.availability.workingDays || []).map((day: string, idx: number) => (
                              <span key={idx} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                                {day}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">No working days set</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Working Hours
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedVendor.availability.workingHours?.start || 'N/A'} - {selectedVendor.availability.workingHours?.end || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Online Status
                        </label>
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          selectedVendor.availability.isOnline 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {selectedVendor.availability.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Weekly Slots */}
                {selectedVendor.weeklySlots && (
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h5 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Weekly Time Slots</h5>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => {
                        const daySlots = selectedVendor.weeklySlots?.[day] || [];
                        if (daySlots.length === 0) return null;
                        return (
                          <div key={day} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                            <p className="mb-2 font-semibold text-gray-900 dark:text-white capitalize">{day}</p>
                            <div className="flex flex-wrap gap-2">
                              {daySlots.map((slot: any, idx: number) => (
                                <span key={idx} className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  slot.isAvailable 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bank Details */}
                {selectedVendor.bankDetails && (
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h5 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Bank Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Account Holder Name
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedVendor.bankDetails.accountHolderName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Bank Name
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedVendor.bankDetails.bankName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          IFSC Code
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedVendor.bankDetails.ifscCode || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification */}
                {selectedVendor.verification && (
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h5 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Verification Status</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Verification Status
                        </label>
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          selectedVendor.verification.isVerified 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {selectedVendor.verification.verificationStatus || (selectedVendor.verification.isVerified ? 'Verified' : 'Pending')}
                        </span>
                      </div>
                      {selectedVendor.verification.rejectionReason && (
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Rejection Reason
                          </label>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {selectedVendor.verification.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-700 flex-shrink-0">
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
      )}
    </>
  );
}