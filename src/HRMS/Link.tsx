import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LinkTable from './Link/LinkTable';
import LinkModal from './Link/LinkModal';
import DeleteModal from './Link/DeleteModal';

interface LinkItem {
  _id: string;
  title: string;
  link?: string;
  file?: string;
  tab: 'Git' | 'Excel' | 'Codebase';
  created_at: string;
  updated_at: string;
}

interface FormData {
  title: string;
  link: string;
  file?: File | null;
  tab: 'Git' | 'Excel' | 'Codebase';
}

const Link: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'Git' | 'Excel' | 'Codebase'>('Git');
  const [gitLinks, setGitLinks] = useState<LinkItem[]>([]);
  const [excelLinks, setExcelLinks] = useState<LinkItem[]>([]);
  const [codebaseLinks, setCodebaseLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    link: '',
    file: null,
    tab: 'Git'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTab, setDeleteTab] = useState<'Git' | 'Excel' | 'Codebase' | null>(null);
  
  // Success/Error messages
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Pagination state
  const [currentPageGit, setCurrentPageGit] = useState(1);
  const [currentPageExcel, setCurrentPageExcel] = useState(1);
  const [currentPageCodebase, setCurrentPageCodebase] = useState(1);
  const [dataPerPage] = useState(10);

  // Fetch links data
  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/links`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle both possible response structures
        const links = data.links || data;
        const gitLinks = links.filter((l: LinkItem) => l.tab === 'Git') || [];
        const excelLinks = links.filter((l: LinkItem) => l.tab === 'Excel') || [];
        const codebaseLinks = links.filter((l: LinkItem) => l.tab === 'Codebase') || [];
        
        setGitLinks(gitLinks);
        setExcelLinks(excelLinks);
        setCodebaseLinks(codebaseLinks);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.message || 'Failed to fetch links');
        setShowError(true);
      }
    } catch (err) {
      setErrorMessage('Error fetching links');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [token]);

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'Git': return gitLinks;
      case 'Excel': return excelLinks;
      case 'Codebase': return codebaseLinks;
      default: return [];
    }
  };

  // Get current page based on active tab
  const getCurrentPage = () => {
    switch (activeTab) {
      case 'Git': return currentPageGit;
      case 'Excel': return currentPageExcel;
      case 'Codebase': return currentPageCodebase;
      default: return 1;
    }
  };

  // Set current page based on active tab
  const setCurrentPage = (page: number) => {
    switch (activeTab) {
      case 'Git': setCurrentPageGit(page); break;
      case 'Excel': setCurrentPageExcel(page); break;
      case 'Codebase': setCurrentPageCodebase(page); break;
    }
  };

  // Pagination logic
  const currentData = getCurrentData();
  const currentPage = getCurrentPage();
  const indexOfLastItem = currentPage * dataPerPage;
  const indexOfFirstItem = indexOfLastItem - dataPerPage;
  const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentData.length / dataPerPage);

  const handleTabChange = (tab: 'Git' | 'Excel' | 'Codebase') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const handleAddClick = () => {
    setFormData({
      title: '',
      link: '',
      file: null,
      tab: activeTab
    });
    setErrors({});
    setIsEdit(false);
    setEditId(null);
    setShowModal(true);
  };

  const handleEdit = (tab: 'Git' | 'Excel' | 'Codebase', id: string) => {
    const data = getCurrentData();
    const item = data.find((row) => row._id === id);
    if (item) {
      setFormData({
        title: item.title,
        link: item.link || '',
        file: null,
        tab: item.tab
      });
      setErrors({});
      setIsEdit(true);
      setEditId(id);
      setShowModal(true);
    }
  };

  const handleDelete = (tab: 'Git' | 'Excel' | 'Codebase', id: string) => {
    setDeleteId(id);
    setDeleteTab(tab);
    setShowDeleteModal(true);
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
    setDeleteTab(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/links/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setDeleteId(null);
        setDeleteTab(null);
        setSuccessMessage('Link deleted successfully!');
        setShowSuccess(true);
        fetchLinks();
      } else {
        setErrorMessage('Failed to delete link');
        setShowError(true);
      }
    } catch (err) {
      setErrorMessage('Error deleting link');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const files = (e.target as HTMLInputElement).files;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? (files ? files[0] : null) : value,
    }));
    
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleModalClose = () => {
    setShowModal(false);
    setIsEdit(false);
    setFormData({
      title: '',
      link: '',
      file: null,
      tab: 'Git'
    });
    setErrors({});
    setEditId(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Title is required.';
    }
    
    if (activeTab === 'Git') {
      if (!formData.link || !formData.link.trim()) {
        newErrors.link = 'Link is required.';
      }
    } else if (activeTab === 'Excel' || activeTab === 'Codebase') {
      const hasLink = formData.link && formData.link.trim();
      const hasFile = !!formData.file;
      if (!hasLink && !hasFile) {
        newErrors.link = 'Either Link or File is required.';
        newErrors.file = 'Either Link or File is required.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleModalSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('tab', activeTab);
      submitData.append('title', formData.title);
      submitData.append('link', formData.link || '');
      
      if (activeTab === 'Excel' || activeTab === 'Codebase') {
        if (formData.file instanceof File) {
          submitData.append('file', formData.file);
        }
      }
      
      const url = isEdit 
        ? `${import.meta.env.VITE_BASE_URL}/api/links/${editId}`
        : `${import.meta.env.VITE_BASE_URL}/api/links`;
      
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        setShowModal(false);
        setIsEdit(false);
        setFormData({
          title: '',
          link: '',
          file: null,
          tab: 'Git'
        });
        setErrors({});
        setEditId(null);
        setSuccessMessage(isEdit ? 'Link updated successfully!' : 'Link added successfully!');
        setShowSuccess(true);
        fetchLinks();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to save link');
        setShowError(true);
      }
    } catch (err) {
      setErrorMessage('Error saving link');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <nav aria-label="Page navigation" className="mt-4">
        <ul className="flex justify-end space-x-1">
          <li>
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          
          {currentPage > 3 && (
            <>
              <li>
                <button
                  className="px-3 py-2 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                  onClick={() => handlePageChange(1)}
                >
                  1
                </button>
              </li>
              {currentPage > 4 && (
                <li className="px-3 py-2 text-sm text-gray-500">...</li>
              )}
            </>
          )}
          
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(pageNum => pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            .map(pageNum => (
              <li key={pageNum}>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === pageNum
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              </li>
            ))}
          
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && (
                <li className="px-3 py-2 text-sm text-gray-500">...</li>
              )}
              <li>
                <button
                  className="px-3 py-2 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              </li>
            </>
          )}
          
          <li>
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  // Auto-dismiss messages
  useEffect(() => {
    if (showSuccess || showError) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setShowError(false);
        setSuccessMessage('');
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, showError]);

  if (loading && !currentItems.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Link Management</h1>
        <p className="text-gray-600">Manage Git, Excel, and Codebase links</p>
      </div>

      {/* Success/Error Messages */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400">✓</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {showError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs and Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex space-x-1">
            {(['Git', 'Excel', 'Codebase'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={handleAddClick}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2"
          >
            <span>+</span>
            Add {activeTab}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <LinkTable
            data={currentItems}
            tab={activeTab}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {renderPagination()}
        </div>
      </div>

      {/* Modals */}
      <LinkModal
        isEdit={isEdit}
        show={showModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        onChange={handleInputChange}
        formData={formData}
        errors={errors}
        loading={loading}
        activeTab={activeTab}
      />

      <DeleteModal
        show={showDeleteModal}
        onConfirm={confirmDelete}
        onClose={handleDeleteModalClose}
        isLoading={loading}
        deleteBody="Are you sure you want to delete this link?"
      />
    </div>
  );
};

export default Link; 