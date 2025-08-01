import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from 'react-modal';

interface TeamMember {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile?: string;
  department?: string;
}

interface Client {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  project_name: string;
  project_description: string;
  project_technology: string;
  client: Client;
  team_members: TeamMember[];
  project_start_date: string;
  project_end_date?: string;
  status: 'active' | 'inactive';
  created_by: {
    _id: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

// Profile Image Component
const ProfileImage: React.FC<{
  profile?: string;
  firstName: string;
  lastName: string;
  className?: string;
}> = ({ profile, firstName, lastName, className = "w-8 h-8 rounded-full object-cover" }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('ProfileImage debug:', { profile, firstName, lastName });
    
    if (profile && profile.startsWith('http')) {
      console.log('Using full URL:', profile);
      setImageSrc(profile);
    } else if (profile) {
      // Handle both relative paths (starting with /) and just filenames
      const profilePath = profile.startsWith('/') 
        ? `${import.meta.env.VITE_BASE_URL}${profile}`
        : `${import.meta.env.VITE_BASE_URL}/uploads/profiles/${profile}`;
      console.log('Using profile path:', profilePath);
      setImageSrc(profilePath);
    } else {
      const initialsUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${firstName} ${lastName}`)}&background=6366f1&color=fff&size=32`;
      console.log('Using initials URL:', initialsUrl);
      setImageSrc(initialsUrl);
    }
  }, [profile, firstName, lastName]);

  const handleError = () => {
    console.log('ProfileImage error for:', { profile, firstName, lastName, currentSrc: imageSrc });
    if (!hasError) {
      setHasError(true);
      const initialsUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${firstName} ${lastName}`)}&background=6366f1&color=fff&size=32`;
      console.log('Falling back to initials URL:', initialsUrl);
      setImageSrc(initialsUrl);
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

const ProjectList: React.FC = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    project_name: '',
    project_description: '',
    project_technology: '',
    client: '',
    team_members: [] as string[],
    project_start_date: '',
    project_end_date: '',
    status: 'active' as 'active' | 'inactive'
  });
  
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      setError('Error fetching projects');
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients for dropdown
  const fetchClients = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/projects/dropdown/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  // Fetch employees for team selection
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/projects/dropdown/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchClients();
    fetchEmployees();
  }, [token]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle team member selection
  const handleTeamMemberChange = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.includes(employeeId)
        ? prev.team_members.filter(id => id !== employeeId)
        : [...prev.team_members, employeeId]
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.project_name.trim()) errors.project_name = 'Project name is required';
    if (!formData.project_description.trim()) errors.project_description = 'Project description is required';
    if (!formData.project_technology.trim()) errors.project_technology = 'Project technology is required';
    if (!formData.client) errors.client = 'Client is required';
    if (formData.team_members.length === 0) errors.team_members = 'At least one team member is required';
    if (!formData.project_start_date) errors.project_start_date = 'Project start date is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open add modal
  const openAddModal = () => {
    setFormData({
      project_name: '',
      project_description: '',
      project_technology: '',
      client: '',
      team_members: [],
      project_start_date: '',
      project_end_date: '',
      status: 'active'
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = (project: Project) => {
    setFormData({
      project_name: project.project_name,
      project_description: project.project_description,
      project_technology: project.project_technology,
      client: project.client._id,
      team_members: project.team_members.map(member => member._id),
      project_start_date: project.project_start_date.split('T')[0],
      project_end_date: project.project_end_date ? project.project_end_date.split('T')[0] : '',
      status: project.status
    });
    setFormErrors({});
    setSelectedProject(project);
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = (project: Project) => {
    setSelectedProject(project);
    setShowViewModal(true);
  };

  // Open delete modal
  const openDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  // Submit form (add/edit)
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const url = showEditModal && selectedProject 
        ? `${import.meta.env.VITE_BASE_URL}/api/projects/${selectedProject._id}`
        : `${import.meta.env.VITE_BASE_URL}/api/projects`;
      
      const method = showEditModal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(showEditModal ? 'Project updated successfully' : 'Project added successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        fetchProjects();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Operation failed');
      }
    } catch (err) {
      setError('Error saving project');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete project
  const handleDelete = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/projects/${selectedProject._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSuccess('Project deleted successfully');
        setShowDeleteModal(false);
        fetchProjects();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete project');
      }
    } catch (err) {
      setError('Error deleting project');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Toggle dropdown
  const toggleDropdown = (projectId: string) => {
    setDropdownOpen(dropdownOpen === projectId ? null : projectId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project List</h1>
          <p className="text-gray-600">Manage projects and team assignments</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800 transition flex items-center gap-2"
        >
          <span>+</span>
          Add Project
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
  {loading ? (
    <div className="col-span-full flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  ) : projects.length > 0 ? (
    projects.map((project) => (
      <div
        key={project._id}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative"
      >
        {/* Status Badge */}
        <div className="absolute top-0 left-0 z-10">
          <div className={`px-3 py-1 text-xs font-bold rounded-br-lg shadow-md relative transform -rotate-1 ${getStatusColor(project.status)}`}>
            <span className="relative z-10 drop-shadow-sm capitalize">{project.status}</span>
          </div>
        </div>

        {/* 3-Dot Dropdown */}
        <div className="absolute top-2 right-2 z-20 dropdown-container">
          <button
            onClick={() => toggleDropdown(project._id)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="More options"
          >
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {dropdownOpen === project._id && (
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30">
              <button
                onClick={() => {
                  openEditModal(project);
                  setDropdownOpen(null);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => {
                  openDeleteModal(project);
                  setDropdownOpen(null);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Project Card */}
        <div className="p-4 sm:p-6 w-full max-w-lg mx-auto bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 break-words">
              {project.project_name}
            </h3>
            <p className="text-gray-600 text-sm break-all px-2 mb-2">
              {project.project_description.length > 100
                ? `${project.project_description.substring(0, 100)}...`
                : project.project_description}
            </p>

            <div className="inline-flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full text-xs text-blue-600 mb-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>{project.project_technology}</span>
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{project.client.name}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Team:</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {project.team_members.slice(0, 3).map((member) => (
                <div key={member._id} className="relative">
                  <ProfileImage
                    profile={member.profile}
                    firstName={member.first_name}
                    lastName={member.last_name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                </div>
              ))}
              {project.team_members.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white shadow-sm">
                  +{project.team_members.length - 3}
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-xs text-gray-500">
              Started: {formatDate(project.project_start_date)}
            </p>
            {project.project_end_date && (
              <p className="text-xs text-gray-500">
                Ended: {formatDate(project.project_end_date)}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => openViewModal(project)}
              className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
        <h3 className="text-lg font-medium mb-2">No projects available</h3>
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
        contentLabel="Project Form"
        ariaHideApp={false}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto my-8 outline-none flex flex-col max-h-[calc(100vh-4rem)] z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-40"
      >
        {/* Fixed Header */}
        <div className="p-6 pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {showEditModal ? 'Edit Project' : 'Add New Project'}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  formErrors.project_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter project name"
              />
              {formErrors.project_name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.project_name}</p>
              )}
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Description *
              </label>
              <textarea
                name="project_description"
                value={formData.project_description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  formErrors.project_description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the project"
              />
              {formErrors.project_description && (
                <p className="text-red-500 text-sm mt-1">{formErrors.project_description}</p>
              )}
            </div>

            {/* Project Technology */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Technology *
              </label>
              <input
                type="text"
                name="project_technology"
                value={formData.project_technology}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  formErrors.project_technology ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., React, Node.js, MongoDB"
              />
              {formErrors.project_technology && (
                <p className="text-red-500 text-sm mt-1">{formErrors.project_technology}</p>
              )}
            </div>

            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Client *
              </label>
              <select
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  formErrors.client ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
              {formErrors.client && (
                <p className="text-red-500 text-sm mt-1">{formErrors.client}</p>
              )}
            </div>

            {/* Team Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Team Members *
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                {employees.map((employee) => (
                  <label key={employee._id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={formData.team_members.includes(employee._id)}
                      onChange={() => handleTeamMemberChange(employee._id)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">
                      {employee.first_name} {employee.last_name} ({employee.department || 'No Department'})
                    </span>
                  </label>
                ))}
              </div>
              {formErrors.team_members && (
                <p className="text-red-500 text-sm mt-1">{formErrors.team_members}</p>
              )}
            </div>

            {/* Project Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Start Date *
                </label>
                <input
                  type="date"
                  name="project_start_date"
                  value={formData.project_start_date}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.project_start_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.project_start_date && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.project_start_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project End Date (Optional)
                </label>
                <input
                  type="date"
                  name="project_end_date"
                  value={formData.project_end_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
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
                ? 'Saving...'
                : showEditModal
                ? 'Update Project'
                : 'Add Project'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onRequestClose={() => setShowViewModal(false)}
        contentLabel="View Project"
        ariaHideApp={false}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto my-8 outline-none flex flex-col max-h-[calc(100vh-4rem)] z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-40"
      >
        {selectedProject && (
          <>
            {/* Fixed Header */}
            <div className="p-6 pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">Project Details</h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {/* Project Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Project Name
                    </label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {selectedProject.project_name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Description
                    </label>
                    <p className="text-gray-900 mt-1">
                      {selectedProject.project_description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Technology
                    </label>
                    <span className="inline-flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full text-xs text-blue-600 mt-1">
                      {selectedProject.project_technology}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Client
                    </label>
                    <p className="text-gray-900 mt-1">{selectedProject.client.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedProject.status)}`}
                    >
                      {selectedProject.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Start Date
                      </label>
                      <p className="text-gray-900 mt-1">
                        {formatDate(selectedProject.project_start_date)}
                      </p>
                    </div>
                    {selectedProject.project_end_date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          End Date
                        </label>
                        <p className="text-gray-900 mt-1">
                          {formatDate(selectedProject.project_end_date)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Team Members
                  </label>
                  <div className="space-y-2">
                    {selectedProject.team_members.map((member) => (
                      <div key={member._id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <ProfileImage
                          profile={member.profile}
                          firstName={member.first_name}
                          lastName={member.last_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-6 pt-4 border-t border-gray-200 sticky bottom-0 bg-white z-10">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
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
        contentLabel="Delete Project"
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
                Delete Project
              </h3>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete{' '}
              <strong>{selectedProject?.project_name}</strong>? This action cannot be
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

export default ProjectList; 