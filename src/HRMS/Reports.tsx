import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from 'react-modal';

interface Report {
  id: string;
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

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}

const Reports: React.FC = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  console.log('Reports component - token:', token);
  console.log('Reports component - localStorage userRole:', localStorage.getItem('userRole'));
  console.log('Reports component - localStorage userId:', localStorage.getItem('userId'));
  
  // Filter states
  const [fromDate, setFromDate] = useState<Date | null>(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [buttonLoading, setButtonLoading] = useState(false);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // Form states
  const [report, setReport] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [breakDuration, setBreakDuration] = useState(0);
  const [workingHours, setWorkingHours] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [note, setNote] = useState('');
  // Submission form states
  const [submitReport, setSubmitReport] = useState('');
  const [submitStartTime, setSubmitStartTime] = useState<Date | null>(null);
  const [submitEndTime, setSubmitEndTime] = useState<Date | null>(null);
  const [submitBreakDuration, setSubmitBreakDuration] = useState(0);
  const [submitNote, setSubmitNote] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [dataPerPage] = useState(10);

  // Timing calculation functions
  const calculateWorkingHours = (start: Date | null, end: Date | null, breakMinutes: number): string => {
    if (!start || !end) return '';
    
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const workingMinutes = diffMinutes - breakMinutes;
    
    if (workingMinutes < 0) return '00:00';
    
    const hours = Math.floor(workingMinutes / 60);
    const minutes = workingMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const calculateTotalHours = (start: Date | null, end: Date | null): string => {
    if (!start || !end) return '';
    
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 0) return '00:00';
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Update calculated times for edit modal
  useEffect(() => {
    const working = calculateWorkingHours(startTime, endTime, breakDuration);
    const total = calculateTotalHours(startTime, endTime);
    setWorkingHours(working);
    setTotalHours(total);
  }, [startTime, endTime, breakDuration]);

  // Update calculated times for submit modal
  useEffect(() => {
    const working = calculateWorkingHours(submitStartTime, submitEndTime, submitBreakDuration);
    const total = calculateTotalHours(submitStartTime, submitEndTime);
    // These will be used when submitting the report
  }, [submitStartTime, submitEndTime, submitBreakDuration]);

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const formatDate = (date: Date | null) => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
      };

      // Build query parameters
      const params = new URLSearchParams({
        from_date: formatDate(fromDate),
        to_date: formatDate(toDate)
      });

      // Only add employee_id parameter for non-employee users (admins)
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'employee' && selectedEmployee) {
        params.append('employee_id', selectedEmployee);
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        setError('Failed to fetch reports');
      }
    } catch (err) {
      setError('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/employees`, {
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
    fetchEmployees();
    fetchReports();
  }, [token]);

  // Apply filters
  const handleApplyFilters = () => {
    setButtonLoading(true);
    fetchReports();
    setButtonLoading(false);
  };

  // Open view modal
  const openViewModal = (report: Report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  // Open edit modal
  const openEditModal = (report: Report) => {
    setSelectedReport(report);
    setReport(report.report || '');
    setStartTime(report.start_time ? new Date(report.start_time) : null);
    setEndTime(report.end_time ? new Date(report.end_time) : null);
    setBreakDuration(report.break_duration_in_minutes || 0);
    setWorkingHours(report.todays_working_hours || '');
    setTotalHours(report.todays_total_hours || '');
    setNote(report.note || '');
    setShowEditModal(true);
  };

  // Update report
  const updateReport = async () => {
    if (!selectedReport) return;

    try {
      // Calculate working hours and total hours
      const calculatedWorkingHours = calculateWorkingHours(startTime, endTime, breakDuration);
      const calculatedTotalHours = calculateTotalHours(startTime, endTime);
      
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/reports/${selectedReport.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report,
          start_time: startTime?.toISOString(),
          end_time: endTime?.toISOString(),
          break_duration_in_minutes: breakDuration,
          todays_working_hours: calculatedWorkingHours,
          todays_total_hours: calculatedTotalHours,
          note,
        }),
      });

      if (response.ok) {
        setSuccess('Report updated successfully');
        setShowEditModal(false);
        fetchReports();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update report');
      }
    } catch (err) {
      setError('Error updating report');
    }
  };

  // Format time
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Check if user can edit report (today's report for employees, any for admins)
  const canEditReport = (report: Report) => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin' || userRole === 'super_admin') return true;
    
    const reportDate = new Date(report.created_at);
    const today = new Date();
    return reportDate.toDateString() === today.toDateString();
  };

  // Check if employee has already submitted a report for today
  const userRole = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');
  const today = new Date().toISOString().split('T')[0];
  const hasSubmittedToday = reports.some(r => r.employee_id === userId && r.created_at && r.created_at.startsWith(today));

  // Submit new report (employee)
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      console.log('Token being used:', token); 
      console.log('Authorization header:', `Bearer ${token}`); 
      
      // Calculate working hours and total hours
      const calculatedWorkingHours = calculateWorkingHours(submitStartTime, submitEndTime, submitBreakDuration);
      const calculatedTotalHours = calculateTotalHours(submitStartTime, submitEndTime);
      
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report: submitReport,
          start_time: submitStartTime?.toISOString(),
          end_time: submitEndTime?.toISOString(),
          break_duration_in_minutes: submitBreakDuration,
          todays_working_hours: calculatedWorkingHours,
          todays_total_hours: calculatedTotalHours,
          note: submitNote,
        }),
      });
      console.log('Response status:', res.status); 
      if (res.ok) {
        setShowSubmitModal(false);
        setSubmitReport('');
        setSubmitStartTime(null);
        setSubmitEndTime(null);
        setSubmitBreakDuration(0);
        setSubmitNote('');
        fetchReports();
        setSuccess('Report submitted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await res.json();
        console.log('Error response:', errorData); 
        setError('Failed to submit report');
      }
    } catch (err) {
      console.error('Submit report error:', err); 
      setError('Error submitting report');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Pagination
  const indexOfLastReport = currentPage * dataPerPage;
  const indexOfFirstReport = indexOfLastReport - dataPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / dataPerPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">View and manage employee reports</p>
        </div>
        {userRole === 'employee' && (
          <button
            className="px-4 py-2 rounded bg-purple-700 text-white font-semibold hover:bg-purple-800 transition disabled:opacity-50"
            onClick={() => setShowSubmitModal(true)}
            disabled={hasSubmittedToday}
          >
            {hasSubmittedToday ? 'Report Submitted' : 'Submit Report'}
          </button>
        )}
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <DatePicker
              selected={fromDate ?? undefined}
              onChange={(date) => setFromDate(date)}
              className="w-full border rounded px-3 py-2"
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <DatePicker
              selected={toDate ?? undefined}
              onChange={(date) => setToDate(date)}
              className="w-full border rounded px-3 py-2"
              dateFormat="yyyy-MM-dd"
              minDate={fromDate ?? undefined}
              maxDate={new Date()}
            />
          </div>
          {localStorage.getItem('userRole') !== 'employee' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              disabled={buttonLoading}
              className="w-full px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 disabled:opacity-50"
            >
              {buttonLoading ? 'Loading...' : 'Apply Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
            {currentReports.length > 0 && (
              <div className="flex space-x-4 text-sm">
                <div className="bg-green-50 px-3 py-1 rounded-full">
                  <span className="font-medium text-green-700">
                    Total Working Hours: {currentReports.reduce((sum, report) => {
                      const hours = report.todays_working_hours || '00:00';
                      const [h, m] = hours.split(':').map(Number);
                      return sum + h + m / 60;
                    }, 0).toFixed(1)}h
                  </span>
                </div>
                <div className="bg-blue-50 px-3 py-1 rounded-full">
                  <span className="font-medium text-blue-700">
                    Total Hours: {currentReports.reduce((sum, report) => {
                      const hours = report.todays_total_hours || '00:00';
                      const [h, m] = hours.split(':').map(Number);
                      return sum + h + m / 60;
                    }, 0).toFixed(1)}h
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {localStorage.getItem('userRole') !== 'employee' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Break
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Working Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentReports.length > 0 ? (
                    currentReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        {localStorage.getItem('userRole') !== 'employee' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.full_name}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(report.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(report.start_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(report.end_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.break_duration_in_minutes} mins
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {report.todays_working_hours || '00:00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {report.todays_total_hours || '00:00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openViewModal(report)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View
                          </button>
                          {canEditReport(report) && (
                            <button
                              onClick={() => openEditModal(report)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={localStorage.getItem('userRole') === 'employee' ? 7 : 8} className="px-6 py-4 text-center text-gray-500">
                        No reports found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-2 border rounded ${
                      currentPage === i + 1 ? 'bg-purple-600 text-white' : ''
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* View Report Modal */}
      <Modal
  isOpen={showViewModal}
  onRequestClose={() => setShowViewModal(false)}
  contentLabel="View Report"
  ariaHideApp={false}
  className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-24 outline-none max-h-[90vh] flex flex-col"
  overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4"
>
  {selectedReport && (
    <div className="flex flex-col h-[90vh]">
      
      {/* Fixed Header */}
      <div className="p-6 pb-4 border-b bg-white z-10">
        <h2 className="text-xl font-bold mb-2">Report Details</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {localStorage.getItem('userRole') !== 'employee' && (
            <div>
              <strong>Employee:</strong> {selectedReport.full_name}
            </div>
          )}
          <div>
            <strong>Date:</strong> {formatDate(selectedReport.created_at)}
          </div>
          <div>
            <strong>Start Time:</strong> {formatTime(selectedReport.start_time)}
          </div>
          <div>
            <strong>End Time:</strong> {formatTime(selectedReport.end_time)}
          </div>
          <div>
            <strong>Break Duration:</strong> {selectedReport.break_duration_in_minutes} mins
          </div>
          <div>
            <strong>Working Hours:</strong> {selectedReport.todays_working_hours}
          </div>
          <div>
            <strong>Total Hours:</strong> {selectedReport.todays_total_hours}
          </div>
          <div>
            <strong>Report:</strong>
            <div className="mt-2 p-3 bg-gray-100 rounded" dangerouslySetInnerHTML={{ __html: selectedReport.report }} />
          </div>
          {selectedReport.note && (
            <div className="p-3 bg-red-100 border border-red-300 rounded">
              <strong>Note:</strong> {selectedReport.note}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="p-6 pt-4 border-t bg-gray-50 z-10">
        <div className="flex justify-end">
          <button
            onClick={() => setShowViewModal(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}
</Modal>


      {/* Edit Report Modal */}
      <Modal
        isOpen={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
        contentLabel="Edit Report"
        ariaHideApp={false}
        className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto mt-24 outline-none max-h-[90vh] flex flex-col"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 pb-4">
            <h2 className="text-xl font-bold mb-4">Edit Report</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report</label>
                <textarea
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                  className="w-full border rounded px-3 py-2 h-32"
                  placeholder="Enter report details..."
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <DatePicker
                    selected={startTime ?? undefined}
                    onChange={(date) => setStartTime(date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <DatePicker
                    selected={endTime ?? undefined}
                    onChange={(date) => setEndTime(date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Break Duration (minutes)</label>
                  <input
                    type="number"
                    value={breakDuration}
                    onChange={(e) => setBreakDuration(parseInt(e.target.value) || 0)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                {/* Calculated Timing Display */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Calculated Timing</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Working Hours:</span>
                      <span className="ml-2 font-semibold text-green-600">{workingHours || '00:00'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Total Hours:</span>
                      <span className="ml-2 font-semibold text-blue-600">{totalHours || '00:00'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    placeholder="Add a note..."
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 pt-4 border-t bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={updateReport}
                className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
              >
                Update Report
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Submit Report Modal (Employee) */}
      <Modal
        isOpen={showSubmitModal}
        onRequestClose={() => setShowSubmitModal(false)}
        contentLabel="Submit Report"
        ariaHideApp={false}
        className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-24 outline-none max-h-[90vh] flex flex-col"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 pb-4">
            <h2 className="text-xl font-bold mb-4">Submit Daily Report</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6">
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Report</label>
                <textarea
                  className="w-full border rounded px-3 py-2 h-32"
                  value={submitReport}
                  onChange={e => setSubmitReport(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Start Time</label>
                  <DatePicker
                    selected={submitStartTime ?? undefined}
                    onChange={date => setSubmitStartTime(date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">End Time</label>
                  <DatePicker
                    selected={submitEndTime ?? undefined}
                    onChange={date => setSubmitEndTime(date)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Break Duration (minutes)</label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={submitBreakDuration}
                    onChange={e => setSubmitBreakDuration(parseInt(e.target.value) || 0)}
                    min={0}
                    required
                  />
                </div>
              </div>
              
              {/* Calculated Timing Display */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Calculated Timing</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Working Hours:</span>
                    <span className="ml-2 font-semibold text-green-600">
                      {calculateWorkingHours(submitStartTime, submitEndTime, submitBreakDuration) || '00:00'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Total Hours:</span>
                    <span className="ml-2 font-semibold text-blue-600">
                      {calculateTotalHours(submitStartTime, submitEndTime) || '00:00'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Note (optional)</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={submitNote}
                  onChange={e => setSubmitNote(e.target.value)}
                  rows={2}
                />
              </div>
            </form>
          </div>
          <div className="p-6 pt-4 border-t bg-gray-50">
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 text-gray-700"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-purple-700 text-white font-semibold hover:bg-purple-800 transition"
                disabled={submitLoading}
                onClick={handleSubmitReport}
              >
                {submitLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reports;