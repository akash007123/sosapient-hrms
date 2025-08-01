import React, { useEffect } from 'react';

interface AlertMessagesProps {
  showSuccess: boolean;
  successMessage: string;
  showError: boolean;
  errorMessage: string;
  setShowSuccess: (show: boolean) => void;
  setShowError: (show: boolean) => void;
}

const AlertMessages: React.FC<AlertMessagesProps> = ({
  showSuccess,
  successMessage,
  showError,
  errorMessage,
  setShowSuccess,
  setShowError
}) => {
  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, setShowSuccess]);

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showError, setShowError]);

  return (
    <>
      {/* Success Alert */}
      {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fa fa-check-circle mr-2"></i>
          {successMessage}
          <button
            type="button"
            className="close"
            onClick={() => setShowSuccess(false)}
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}

      {/* Error Alert */}
      {showError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fa fa-exclamation-circle mr-2"></i>
          {errorMessage}
          <button
            type="button"
            className="close"
            onClick={() => setShowError(false)}
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}
    </>
  );
};

export default AlertMessages; 