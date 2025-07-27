import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "react-modal";

interface Client {
  id: string;
  name: string;
  email: string;
  about: string;
  country: string;
  state: string;
  city: string;
  status: "active" | "inactive";
  profile_pic?: string;
  created_at: string;
  updated_at: string;
}

// Profile Image Component
const ProfileImage: React.FC<{
  profile?: string;
  firstName: string;
  lastName: string;
  className?: string;
}> = ({ profile, firstName, lastName, className = "w-6 h-6 rounded-full object-cover" }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (profile && profile.startsWith('http')) {
      setImageSrc(profile);
    } else if (profile) {
      setImageSrc(`${import.meta.env.VITE_BASE_URL}/uploads/profiles/${profile}`);
    } else {
      setImageSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(`${firstName} ${lastName}`)}&background=6366f1&color=fff&size=24`);
    }
  }, [profile, firstName, lastName]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(`${firstName} ${lastName}`)}&background=6366f1&color=fff&size=24`);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={`${firstName} ${lastName}`}
      className={className}
      title={`${firstName} ${lastName}`}
      onError={handleError}
    />
  );
};

const Clients: React.FC = () => {
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    about: "",
    country: "",
    state: "",
    city: "",
    status: "active" as "active" | "inactive",
    profile_pic: null as File | null,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Projects state for view modal
  const [clientProjects, setClientProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState("");

  // Fetch clients
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      } else {
        setError("Failed to fetch clients");
      }
    } catch (err) {
      setError("Error fetching clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [token]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profile_pic: file,
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Email is invalid";
    if (!formData.country.trim()) errors.country = "Country is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.city.trim()) errors.city = "City is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open add modal
  const openAddModal = () => {
    setFormData({
      name: "",
      email: "",
      about: "",
      country: "",
      state: "",
      city: "",
      status: "active",
      profile_pic: null,
    });
    setFormErrors({});
    setProfilePreview(null);
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = (client: Client) => {
    setFormData({
      name: client.name,
      email: client.email,
      about: client.about,
      country: client.country,
      state: client.state,
      city: client.city,
      status: client.status,
      profile_pic: null,
    });
    setProfilePreview(client.profile_pic || null);
    setFormErrors({});
    setSelectedClient(client);
    setShowEditModal(true);
  };

  // Fetch projects for a client
  const fetchClientProjects = async (clientId: string) => {
    setLoadingProjects(true);
    setProjectError("");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/projects/client/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClientProjects(data.projects || []);
      } else {
        setProjectError("Failed to fetch projects");
      }
    } catch (error) {
      setProjectError("Error fetching projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  // Open view modal
  const openViewModal = (client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
    // Fetch projects for this client
    fetchClientProjects(client.id);
  };

  // Open delete modal
  const openDeleteModal = (client: Client) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  // Submit form (add/edit)
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("about", formData.about);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("status", formData.status);

      if (formData.profile_pic) {
        formDataToSend.append("profile_pic", formData.profile_pic);
      }

      const url =
        showEditModal && selectedClient
          ? `${import.meta.env.VITE_BASE_URL}/api/clients/${selectedClient.id}`
          : `${import.meta.env.VITE_BASE_URL}/api/clients`;

      const method = showEditModal ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        setSuccess(
          showEditModal
            ? "Client updated successfully"
            : "Client added successfully"
        );
        setShowAddModal(false);
        setShowEditModal(false);
        fetchClients();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Operation failed");
      }
    } catch (err) {
      setError("Error saving client");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete client
  const handleDelete = async () => {
    if (!selectedClient) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/clients/${selectedClient.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setSuccess("Client deleted successfully");
        setShowDeleteModal(false);
        fetchClients();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to delete client");
      }
    } catch (err) {
      setError("Error deleting client");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status color for projects
  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Toggle dropdown
  const toggleDropdown = (clientId: string) => {
    setDropdownOpen(dropdownOpen === clientId ? null : clientId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownOpen &&
        !(event.target as Element).closest(".dropdown-container")
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Clients</h1>
          <p className="text-gray-600">
            Manage client information and profiles
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800 transition flex items-center gap-2"
        >
          <span>+</span>
          Add Client
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : clients.length > 0 ? (
          clients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative"
            >
              {/* Country Badge */}
              {client.country && (
                <div className="absolute top-0 left-0 z-10">
                  <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg shadow-md relative transform -rotate-1">
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                      </svg>
                      <span className="relative z-10 drop-shadow-sm">
                        {client.country}
                      </span>
                    </div>
                    {/* Ribbon tail effect */}
                    <div className="absolute top-0 right-0 w-0 h-0 border-l-6 border-l-green-500 border-t-6 border-t-transparent transform rotate-45"></div>
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 bg-green-300 rounded-br-lg opacity-20 blur-sm"></div>
                  </div>
                </div>
              )}

              {/* 3-Dot Dropdown */}
              <div className="absolute top-2 right-2 z-20 dropdown-container">
                <button
                  onClick={() => toggleDropdown(client.id)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="More options"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen === client.id && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30">
                    <button
                      onClick={() => {
                        openEditModal(client);
                        setDropdownOpen(null);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        openDeleteModal(client);
                        setDropdownOpen(null);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Client Card */}
              <div className="p-4 sm:p-6 w-full max-w-sm mx-auto bg-white rounded-lg shadow-sm border border-gray-100">
                {/* Profile Picture */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <img
                      src={client.profile_pic || "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg"}
                      alt={client.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                      onError={(e) => {
                        e.currentTarget.src = "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg";
                      }}
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                        client.status === "active"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Client Info */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 break-words">
                    {client.name}
                  </h3>
                  <p className="text-gray-600 text-sm break-all px-2">
                    {client.email}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {client.status}
                    </span>
                  </div>
                </div>

                {/* View Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => openViewModal(client)}
                    className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-medium mb-2">No clients found</h3>
              <p className="text-gray-400">
                Get started by adding your first client.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onRequestClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        contentLabel="Client Form"
        ariaHideApp={false}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto my-8 outline-none flex flex-col max-h-[calc(100vh-4rem)] z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-40"
      >
        {/* Fixed Header */}
        <div className="p-6 pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {showEditModal ? "Edit Client" : "Add New Client"}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Profile Picture */}
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={profilePreview || "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg"}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                />
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer border-2 border-gray-200 hover:border-gray-300">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter client name"
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter client email"
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* About */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About
              </label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Tell us about the client"
              />
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.country ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Country"
                />
                {formErrors.country && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.country}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.state ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="State"
                />
                {formErrors.state && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.state}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.city ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="City"
                />
                {formErrors.city && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 pt-4 border-t border-gray-200 sticky bottom-0 bg-white z-10">
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : showEditModal
                ? "Update Client"
                : "Add Client"}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
  isOpen={showViewModal}
  onRequestClose={() => {
    setShowViewModal(false);
    setClientProjects([]);
    setLoadingProjects(false);
    setProjectError("");
  }}
  contentLabel="View Client"
  ariaHideApp={false}
  className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto my-8 outline-none flex flex-col max-h-[calc(100vh-4rem)] z-50"
  overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-40"
>
  {selectedClient && (
    <>
      {/* Fixed Header */}
      <div className="p-6 pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold text-gray-800">Client Details</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <img
              src={selectedClient.profile_pic || "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg"}
              alt={selectedClient.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
            />
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Name
              </label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {selectedClient.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Email
              </label>
              <p className="text-gray-900 mt-1">{selectedClient.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                About
              </label>
              <p className="text-gray-900 mt-1">
                {selectedClient.about || "No description available"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Country
                </label>
                <p className="text-gray-900 mt-1">{selectedClient.country}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  State
                </label>
                <p className="text-gray-900 mt-1">{selectedClient.state}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  City
                </label>
                <p className="text-gray-900 mt-1">{selectedClient.city}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Status
              </label>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  selectedClient.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {selectedClient.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div>
                <label className="block text-sm font-medium text-gray-500">
                  Created
                </label>
                <p className="text-gray-900 mt-1">
                  {formatDate(selectedClient.created_at)}
                </p>
              </div> */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="text-gray-900 mt-1">
                  {formatDate(selectedClient.updated_at)}
                </p>
              </div> */}
            </div>
          </div>

          {/* Projects Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Projects ({clientProjects.length})
            </h3>
            
            {loadingProjects ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading projects...</p>
              </div>
            ) : projectError ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">{projectError}</p>
              </div>
            ) : clientProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientProjects.map((project) => (
                  <div
                    key={project._id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Project Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {project.project_name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>

                    {/* Project Description */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {project.project_description.length > 100
                        ? `${project.project_description.substring(0, 100)}...`
                        : project.project_description}
                    </p>

                    {/* Technology */}
                    <div className="mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        {project.project_technology}
                      </span>
                    </div>

                    {/* Project Dates */}
                    <div className="text-xs text-gray-500 mb-3">
                      <div><strong>Start:</strong> {formatDate(project.project_start_date)}</div>
                      {project.project_end_date && (
                        <div><strong>End:</strong> {formatDate(project.project_end_date)}</div>
                      )}
                    </div>

                    {/* Team Members */}
                    <div>
                      <div className="text-xs text-gray-500 mb-2">
                        <strong>Team Members:</strong>
                      </div>
                      <div className="flex items-center">
                        {project.team_members && project.team_members.length > 0 ? (
                          <>
                            {project.team_members.slice(0, 3).map((member: any, idx: number) => (
                              <ProfileImage
                                key={member._id}
                                profile={member.profile}
                                firstName={member.first_name}
                                lastName={member.last_name}
                                className="w-6 h-6 rounded-full border-2 border-white object-cover"
                              />
                            ))}
                            {project.team_members.length > 3 && (
                              <span className="text-xs text-gray-500 ml-1">
                                +{project.team_members.length - 3} more
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">No team members assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📁</div>
                <p className="text-gray-500">No projects found for this client</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="p-6 pt-4 border-t border-gray-200 sticky bottom-0 bg-white z-10">
        <div className="flex justify-end">
          <button
            onClick={() => {
              setShowViewModal(false);
              setClientProjects([]);
              setLoadingProjects(false);
              setProjectError("");
            }}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )}
</Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        contentLabel="Delete Client"
        ariaHideApp={false}
        className="bg-white rounded-lg shadow-lg max-w-md mx-auto mt-24 outline-none z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-40"
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Client
              </h3>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete{" "}
              <strong>{selectedClient?.name}</strong>? This action cannot be
              undone.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Clients;
