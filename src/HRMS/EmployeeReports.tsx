import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from 'react-modal';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  profile?: string;
}

interface Report {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  todays_working_hours: string;
  todays_total_hours: string;
  report: string;
  note: string;
  start_time: string;
  end_time: string;
  break_duration_in_minutes: number;
}

const EmployeeReports: React.FC = () => {
  const { token, user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dateFilter, setDateFilter] = useState({
    from_date: '',
    to_date: ''
  });

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams({
        action: 'view',
        role: 'employee'
      });

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/get_employees.php?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          setEmployees(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch employees');
        }
      } else {
        setError('Failed to fetch employees data');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to fetch employees data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeReports = async (employeeId: string) => {
    if (!employeeId) return;

    setReportsLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'view',
        user_id: employeeId,
        ...(dateFilter.from_date && { from_date: dateFilter.from_date }),
        ...(dateFilter.to_date && { to_date: dateFilter.to_date })
      });

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/reports.php?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          setReports(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch reports');
          setReports([]);
        }
      } else {
        setError('Failed to fetch reports data');
        setReports([]);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports data');
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const employeeId = e.target.value;
    const selectedEmployee = employees.find(emp => emp.id === employeeId);
    
    setSelectedEmployeeId(employeeId);
    setSelectedEmployeeName(selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : '');
    
    if (employeeId) {
      fetchEmployeeReports(employeeId);
    } else {
      setReports([]);
    }
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyDateFilter = () => {
    if (selectedEmployeeId) {
      fetchEmployeeReports(selectedEmployeeId);
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPriorityColor = (hours: string) => {
    const hoursNum = parseFloat(hours?.split(':')[0] || '0');
    if (hoursNum < 4) return 'text-red-600';
    if (hoursNum >= 4 && hoursNum < 8) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Employee Reports</h1>
        <p className="text-gray-600">Search and view employee reports by name</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={selectedEmployeeId}
              onChange={handleEmployeeChange}
            >
              <option value="">Choose an employee...</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              name="from_date"
              value={dateFilter.from_date}
              onChange={handleDateFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              name="to_date"
              value={dateFilter.to_date}
              onChange={handleDateFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleApplyDateFilter}
              disabled={!selectedEmployeeId}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      {selectedEmployeeId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Reports for {selectedEmployeeName}
            </h2>
            {reports.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Showing {reports.length} report{reports.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {reportsLoading ? (
            <div className="p-8 text-center">
              <div className="loader mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading reports...</p>
            </div>
          ) : reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Working Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Break (min)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(report.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getPriorityColor(report.todays_working_hours)}`}>
                          {report.todays_working_hours}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.todays_total_hours}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(report.start_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(report.end_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.break_duration_in_minutes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="text-purple-600 hover:text-purple-900 transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No reports found for the selected employee and date range.</p>
            </div>
          )}
        </div>
      )}

      {/* Report Details Modal */}
      <Modal
        isOpen={showReportModal}
        onRequestClose={() => setShowReportModal(false)}
        contentLabel="Report Details"
        ariaHideApp={false}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-auto mt-24 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      >
        {selectedReport && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedReport.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee</label>
                  <p className="text-sm text-gray-900">{selectedReport.first_name} {selectedReport.last_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Working Hours</label>
                  <p className={`text-sm font-medium ${getPriorityColor(selectedReport.todays_working_hours)}`}>
                    {selectedReport.todays_working_hours}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Hours</label>
                  <p className="text-sm text-gray-900">{selectedReport.todays_total_hours}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <p className="text-sm text-gray-900">{formatTime(selectedReport.start_time)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <p className="text-sm text-gray-900">{formatTime(selectedReport.end_time)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Break Duration</label>
                  <p className="text-sm text-gray-900">{selectedReport.break_duration_in_minutes} minutes</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report</label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedReport.report}</p>
                </div>
              </div>

              {selectedReport.note && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedReport.note}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeReports; 