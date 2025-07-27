import React from 'react';
import Modal from 'react-modal';

interface Report {
  _id: string;
  employee_id: string;
  full_name: string;
  report: string;
  start_time: string;
  end_time: string;
  break_duration_in_minutes: number;
  todays_working_hours: string;
  todays_total_hours: string;
  created_at: string;
  note?: string;
}

interface ReportModalProps {
  isOpen: boolean;
  report: Report | null;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, report, onClose }) => {
  if (!report) return null;

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getWorkingHoursColor = (workingHours: string) => {
    const hours = parseFloat(workingHours.split(':')[0]) + parseFloat(workingHours.split(':')[1]) / 60;
    
    if (hours < 4) return 'text-red-600';
    if (hours < 8) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Report Details"
      ariaHideApp={false}
      className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-24 outline-none max-h-[90vh] flex flex-col"
      overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Information</h3>
              <p className="text-gray-700">{report.full_name}</p>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                <p className="text-gray-900">{formatDate(report.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Start Time</label>
                <p className="text-gray-900">{formatTime(report.start_time)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">End Time</label>
                <p className="text-gray-900">{formatTime(report.end_time)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Break Duration</label>
                <p className="text-gray-900">{report.break_duration_in_minutes} minutes</p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Working Hours</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Working Hours</label>
                  <p className={`text-lg font-bold ${getWorkingHoursColor(report.todays_working_hours)}`}>
                    {report.todays_working_hours}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Total Hours</label>
                  <p className="text-lg font-bold text-blue-600">{report.todays_total_hours}</p>
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Report</label>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div 
                  className="text-gray-900 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: report.report }}
                />
              </div>
            </div>

            {/* Note */}
            {report.note && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Note</label>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800">{report.note}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-200 sticky bottom-0 bg-white z-10">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReportModal; 