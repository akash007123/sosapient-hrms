import React from 'react';

interface DeleteModalProps {
  show: boolean;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
  deleteBody: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  show,
  onConfirm,
  onClose,
  isLoading,
  deleteBody
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-xl">
          <h3 className="text-xl font-bold text-white">Delete Link</h3>
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-medium text-gray-900">Confirm Deletion</h4>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            {deleteBody}
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              Delete Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal; 