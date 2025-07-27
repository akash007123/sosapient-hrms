import React from 'react';

interface FormData {
  title: string;
  link: string;
  file?: File | null;
  tab: 'Git' | 'Excel' | 'Codebase';
}

interface LinkModalProps {
  isEdit: boolean;
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  formData: FormData;
  errors: Record<string, string>;
  loading: boolean;
  activeTab: 'Git' | 'Excel' | 'Codebase';
}

const LinkModal: React.FC<LinkModalProps> = ({
  isEdit = false,
  show,
  onClose,
  onSubmit,
  onChange,
  formData = { title: '', link: '', file: null, tab: 'Git' },
  errors = {},
  loading = false,
  activeTab
}) => {
  const { title = '', link = '', file = null } = formData;

  // Show file input for Excel and Codebase tabs
  const showFileInput = activeTab === 'Excel' || activeTab === 'Codebase';

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-t-xl">
          <h3 className="text-xl font-bold text-white">
            {isEdit ? `Edit ${activeTab}` : `Add ${activeTab}`}
          </h3>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={onChange}
                className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-200 transition-all duration-200 ${
                  errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                }`}
                placeholder="Enter title"
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Link {activeTab === 'Git' ? '*' : '(Optional)'}
              </label>
              <input
                type="text"
                name="link"
                value={link}
                onChange={onChange}
                className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-200 transition-all duration-200 ${
                  errors.link ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                }`}
                placeholder="Enter link URL"
                required={activeTab === 'Git'}
              />
              {errors.link && (
                <p className="mt-1 text-sm text-red-600">{errors.link}</p>
              )}
            </div>

            {showFileInput && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  File (Optional)
                </label>
                <input
                  type="file"
                  name="file"
                  onChange={onChange}
                  className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-200 transition-all duration-200 ${
                    errors.file ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                  }`}
                  accept=".xlsx,.xls,.pdf,.doc,.docx,.txt"
                />
                {errors.file && (
                  <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: Excel, PDF, Word, Text files
                </p>
              </div>
            )}

            {showFileInput && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> For {activeTab} links, you can provide either a link URL or upload a file. At least one is required.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2"
              disabled={loading}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isEdit ? 'Update Link' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkModal;


