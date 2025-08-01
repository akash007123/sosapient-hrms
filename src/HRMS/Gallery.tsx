import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getService } from '../services/getService';
import AlertMessages from '../components/common/AlertMessages';
import DeleteModal from './Link/DeleteModal';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}

interface GalleryImage {
  id: string;
  url: string;
  created_at: string;
  employee_id: string;
}

interface GalleryProps {
  fixNavbar?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ fixNavbar = false }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage] = useState(8);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch employees if user is admin
      if (user?.role === 'admin') {
        const employeesResponse = await getService.getCall('get_employees.php', {
          action: 'view',
          role: 'employee',
        });

        if (employeesResponse.status === 'success') {
          setEmployees(employeesResponse.data || []);
        }
      }

      // Fetch gallery images
      const params = user?.role === 'employee' ? user.id : null;
      const galleryResponse = await getService.getCall('gallery.php', {
        action: 'view',
        employee_id: params,
      });

      if (galleryResponse.status === 'success') {
        const sortedImages = sortImages(galleryResponse.data || [], sortOrder);
        setImages(sortedImages);
        setFilteredImages(sortedImages);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Failed to fetch data');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const sortImages = (images: GalleryImage[], order: 'asc' | 'desc'): GalleryImage[] => {
    return [...images].sort((a, b) => {
      return order === 'asc'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImages([]);
    setErrorMessage('');
    setShowError(false);
    setErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);

    if (fileInputRef.current) {
      if (updatedImages.length > 0) {
        const dataTransfer = new DataTransfer();
        updatedImages.forEach((file) => dataTransfer.items.add(file));
        fileInputRef.current.files = dataTransfer.files;
      } else {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedImages(files);
    setErrors({ ...errors, selectedImages: '' });
  };

  const handleEmployeeSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmployeeId(e.target.value);
    setErrors({ ...errors, selectedEmployeeId: '' });
  };

  const submitImages = async () => {
    let errors: Record<string, string> = {};
    let isValid = true;

    // Determine employee_id based on role
    let employeeIdToSend = '';

    if (user?.role === 'admin') {
      if (!selectedEmployeeId) {
        errors.selectedEmployeeId = 'Please select an employee.';
        isValid = false;
      } else {
        employeeIdToSend = selectedEmployeeId;
      }
    } else if (user?.role === 'employee') {
      employeeIdToSend = user.id;
    }

    if (selectedImages.length === 0) {
      errors.selectedImages = 'Please select at least one image.';
      isValid = false;
    }

    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const invalidFiles = selectedImages.filter(file => !validImageTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      errors.selectedImages = 'Only image files (JPG, PNG, WEBP) are allowed.';
      isValid = false;
    }

    if (!isValid) {
      setErrors(errors);
      return;
    }

    const uploadImageData = new FormData();
    uploadImageData.append('employee_id', employeeIdToSend);
    uploadImageData.append('created_by', user?.id || '');

    selectedImages.forEach((image) => {
      if (validImageTypes.includes(image.type)) {
        uploadImageData.append('images[]', image);
      }
    });

    setButtonLoading(true);

    try {
      const response = await getService.addCall('gallery.php', 'add', uploadImageData);

      if (response.status === 'success') {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        const updatedImages = [...images, ...(response.data || [])];
        const sortedImages = sortImages(updatedImages, sortOrder);

        setSuccessMessage(response.message || 'Images uploaded successfully');
        setShowSuccess(true);
        setSelectedImages([]);
        setSelectedEmployeeId('');
        setImages(sortedImages);
        setFilteredImages(sortedImages);

        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage(response.message || 'Upload failed. Please try again.');
        setShowError(true);
        setTimeout(() => {
          setShowError(false);
          setErrorMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred during the image upload.');
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 3000);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOrder = event.target.value as 'asc' | 'desc';
    setSortOrder(newSortOrder);
    setFilteredImages(sortImages(images, newSortOrder));
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = images.filter(image => {
      const fileName = image.url.split('/').pop()?.toLowerCase() || '';
      return fileName.includes(query);
    });
    setFilteredImages(filtered);
  };

  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const openDeleteModal = (image: GalleryImage) => {
    setShowDeleteModal(true);
    setImageToDelete(image);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setImageToDelete(null);
    setDeleteLoading(false);
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;

    setDeleteLoading(true);

    try {
      const response = await getService.deleteCall('gallery.php', 'delete', imageToDelete.id);

      if (response.status === 'success') {
        const updatedImages = images.filter(img => img.id !== imageToDelete.id);
        const updatedFiltered = filteredImages.filter(img => img.id !== imageToDelete.id);

        setImages(updatedImages);
        setFilteredImages(updatedFiltered);
        setShowDeleteModal(false);
        setImageToDelete(null);
        setSuccessMessage(response.message || 'Image deleted successfully');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage(response.message || 'Failed to delete image.');
        setShowError(true);
        setTimeout(() => {
          setShowError(false);
          setErrorMessage('');
        }, 3000);
      }
    } catch (error) {
      setErrorMessage('An error occurred while deleting the image.');
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Pagination Logic
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);

  return (
    <>
      <AlertMessages
        showSuccess={showSuccess}
        successMessage={successMessage}
        showError={showError}
        errorMessage={errorMessage}
        setShowSuccess={setShowSuccess}
        setShowError={setShowError}
      />

             <DeleteModal
         show={showDeleteModal}
         onConfirm={confirmDeleteImage}
         isLoading={deleteLoading}
         onClose={closeDeleteModal}
         deleteBody={
           imageToDelete ? 'Are you sure you want to delete this image?' : ''
         }
       />

      <div className={`section-body ${fixNavbar ? 'marginTop' : ''} mt-3`}>
        <div className="container-fluid">
          <div className="row row-cards">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <div className="page-subtitle ml-0">
                    {filteredImages.length > 0
                      ? `${indexOfFirstImage + 1} - ${Math.min(indexOfLastImage, filteredImages.length)} of ${filteredImages.length} photos`
                      : <span className="text-muted">Image not available</span>}
                  </div>
                  <div className="page-options d-flex">
                    <select 
                      className="form-control custom-select w-auto" 
                      onChange={handleSortChange} 
                      value={sortOrder}
                    >
                      <option value="asc">Newest</option>
                      <option value="desc">Oldest</option>
                    </select>
                    <div className="input-icon ml-2">
                      <span className="input-icon-addon">
                        <i className="fe fe-search" />
                      </span>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search photo" 
                        value={searchQuery} 
                        onChange={handleSearch}
                      />
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-primary ml-2" 
                      onClick={openModal}
                    >
                      Upload New
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Modal */}
          {isModalOpen && (
            <div
              className="modal fade show"
              id="uploadImageModal"
              tabIndex={-1}
              role="dialog"
              aria-labelledby="uploadImageModalLabel"
              aria-hidden={false}
              style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="uploadImageModalLabel">
                      Upload Images
                    </h5>
                    <button 
                      type="button" 
                      className="close" 
                      aria-label="Close" 
                      onClick={closeModal}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    {/* Employee Selection Section */}
                    {user?.role === 'admin' && (
                      <div className="mt-3">
                        <label htmlFor="employeeSelect" className="form-label">Select Employee</label>
                        <select
                          id="employeeSelect"
                          className="form-control"
                          value={selectedEmployeeId}
                          onChange={handleEmployeeSelection}
                        >
                          <option value="">Select an Employee</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.first_name} {employee.last_name}
                            </option>
                          ))}
                        </select>
                        {errors.selectedEmployeeId && (
                          <small className={`invalid-feedback ${errors.selectedEmployeeId ? 'd-block' : ''}`}>
                            {errors.selectedEmployeeId}
                          </small>
                        )}
                      </div>
                    )}

                    {/* File Input */}
                    <div className="mt-3">
                      <label htmlFor="image" className="form-label">Select Image</label>
                      <input
                        type="file"
                        onChange={handleImageSelection}
                        className="form-control"
                        multiple
                        ref={fileInputRef}
                      />
                    </div>
                    {errors.selectedImages && (
                      <small className={`invalid-feedback ${errors.selectedImages ? 'd-block' : ''}`}>
                        {errors.selectedImages}
                      </small>
                    )}

                    {/* Preview Section */}
                    {selectedImages.length > 0 && (
                      <div className="mt-3">
                        <p>Selected Images:</p>
                        <div className="d-flex flex-wrap">
                          {selectedImages.map((image, index) => (
                            <div key={index} className="position-relative m-2">
                              <img
                                src={URL.createObjectURL(image)}
                                alt="Preview"
                                className="img-thumbnail"
                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                              />
                              <button
                                className="btn btn-danger btn-sm position-absolute"
                                style={{ top: '-5px', right: '-5px', borderRadius: '50%' }}
                                onClick={() => removeImage(index)}
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={submitImages} 
                      disabled={buttonLoading}
                    >
                      {buttonLoading && (
                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                      )}
                      Upload Images
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Images listing */}
          <div className="row row-cards">
            {loading && (
              <div className="col-12">
                <div className="card p-3 d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                  <div className="dimmer active">
                    <div className="loader" />
                  </div>
                </div>
              </div>
            )}

            {!loading && filteredImages.length > 0 && (
              currentImages.map((image, index) => (
                <div className="col-sm-6 col-lg-3" key={image.id || index}>
                  <div className="card p-3 position-relative">
                    {/* Delete Icon */}
                    <button
                      type="button"
                      className="btn btn-link p-0 position-absolute"
                      style={{ top: '1px', right: '4px', zIndex: 2 }}
                      title="Delete Image"
                      onClick={() => openDeleteModal(image)}
                    >
                      <i className="fa fa-trash-o" style={{ fontSize: '1.2rem', color: '#fd5c63' }}></i>
                    </button>
                    <img 
                      src={`${import.meta.env.VITE_BASE_URL}/${image.url}`} 
                      alt="Gallery" 
                      className="rounded" 
                    />
                  </div>
                </div>
              ))
            )}

            {!loading && filteredImages.length === 0 && (
              <div className="col-12">
                <div className="card p-3 d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                  <span>Image not available</span>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredImages.length > 0 && totalPages > 1 && (
            <nav aria-label="Page navigation">
              <ul className="pagination mb-0 justify-content-end">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </>
  );
};

export default Gallery;