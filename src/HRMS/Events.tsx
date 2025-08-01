import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';

interface EventItem {
  _id: string;
  title: string;
  date: string;
  type: 'holiday' | 'employee_birthday' | 'admin_birthday' | 'custom' | 'leave' | 'working_hours' | 'missing_report';
  display?: string;
  className?: string;
  allDay?: boolean;
  leaveData?: LeaveEvent;
}

interface LeaveEvent {
  _id: string;
  employee_id: {
    _id: string;
    first_name: string;
    last_name: string;
  };
  from_date: string;
  to_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  is_half_day: boolean;
}

interface Employee {
  _id: string;
  first_name: string;
  last_name: string;
  dob: string;
  role: string;
}

interface WorkingHoursReport {
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
  note: string;
}

const typeColors: Record<EventItem['type'], string> = {
  holiday: 'text-red-600',
  employee_birthday: 'text-blue-600',
  admin_birthday: 'text-purple-600',
  custom: 'text-green-600',
  leave: 'text-red-600',
  working_hours: 'text-green-600',
  missing_report: 'text-gray-600',
};

const typeLabels: Record<EventItem['type'], string> = {
  holiday: 'Holiday',
  employee_birthday: "Employee's Birthday",
  admin_birthday: "Admin's Birthday",
  custom: 'Custom Event',
  leave: 'Leave',
  working_hours: 'Working Hours',
  missing_report: 'Missing Report',
};

const Events: React.FC = () => {
  const { token, user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [leaves, setLeaves] = useState<LeaveEvent[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workingHoursReports, setWorkingHoursReports] = useState<WorkingHoursReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [filter, setFilter] = useState('all');
  const [reportFilter, setReportFilter] = useState('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [adding, setAdding] = useState(false);

  // Generate birthday events from employee DOB
  const generateBirthdayEvents = (employees: Employee[], targetYear: number): EventItem[] => {
    const birthdayEvents: EventItem[] = [];
    
    employees.forEach(employee => {
      if (employee.dob) {
        const dob = new Date(employee.dob);
        const birthday = new Date(targetYear, dob.getMonth(), dob.getDate());
        
        // Create birthday event
        const event: EventItem = {
          _id: `birthday_${employee._id}_${targetYear}`,
          title: `${employee.first_name} ${employee.last_name}'s Birthday`,
          date: birthday.toISOString().split('T')[0],
          type: employee.role === 'admin' ? 'admin_birthday' : 'employee_birthday'
        };
        
        birthdayEvents.push(event);
      }
    });
    
    return birthdayEvents;
  };

  // Fetch working hours reports for specific employee
  const fetchWorkingHoursReports = async (employeeId?: string) => {
    if (!employeeId && !selectedEmployeeId) {
      setWorkingHoursReports([]);
      return;
    }

    const targetEmployeeId = employeeId || selectedEmployeeId;
    
    // Use month-based date range like the reference code
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startDate = firstDay.toISOString().split('T')[0];
    const endDate = lastDay.toISOString().split('T')[0];

    try {
      const params = new URLSearchParams({
        action: 'view',
        from_date: startDate,
        to_date: endDate,
        user_id: targetEmployeeId
      });

      console.log('Fetching reports for employee:', targetEmployeeId);
      console.log('API URL:', `${import.meta.env.VITE_BASE_URL}/reports.php?${params.toString()}`);

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/reports.php?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Reports data:', data);
        // Use data.data structure like reference code
        setWorkingHoursReports(data.data || []);
      } else {
        console.error('Failed to fetch reports:', res.status, res.statusText);
        setWorkingHoursReports([]);
      }
    } catch (err) {
      console.error('Error fetching working hours reports:', err);
      setWorkingHoursReports([]);
    }
  };

  // Generate working hours events
  const generateWorkingHoursEvents = () => {
    console.log('Generating working hours events from reports:', workingHoursReports);
    return workingHoursReports.map((report) => {
      const hoursStr = report.todays_working_hours?.slice(0, 5);
      const hours = parseFloat(hoursStr || '0');
      
      let className = "daily-report";
      if (hours < 4) className = "red-event";
      else if (hours >= 4 && hours < 8) className = "half-day-leave-event";
      
      const event = {
        _id: report._id,
        title: `${hoursStr}`,
        date: report.created_at?.split(" ")[0] || '',
        type: 'working_hours' as EventItem['type'],
        className: className,
        display: "background",
        allDay: true
      };
      
      console.log('Generated working hours event:', event);
      return event;
    });
  };

  // Generate missing report events
  const generateMissingReportEvents = () => {
    const missingReportEvents: EventItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    let currentDate = new Date(startDate);

    while (currentDate < today && currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasReport = workingHoursReports.some((report) => 
        report.created_at?.split(" ")[0] === dateStr
      );
      
      if (!hasReport) {
        missingReportEvents.push({
          _id: `missing_${dateStr}`,
          title: '',
          date: dateStr,
          type: 'missing_report' as EventItem['type'],
          display: 'background',
          allDay: true,
          className: 'missing-report-day'
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('Generated missing report events:', missingReportEvents);
    return missingReportEvents;
  };

  // Fetch both HRMS events, custom events, leaves, and employees
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Fetch HRMS events (holidays, birthdays)
      const hrmsRes = await fetch(`${import.meta.env.VITE_BASE_URL}/api/hrms/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      let hrmsEvents = [];
      if (hrmsRes.ok) {
        const data = await hrmsRes.json();
        hrmsEvents = data.events || [];
      }
      
      // Fetch custom events
      const customRes = await fetch(`${import.meta.env.VITE_BASE_URL}/api/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      let customEvents = [];
      if (customRes.ok) {
        const data = await customRes.json();
        customEvents = (data.events || []).map((e: any) => ({ ...e, type: 'custom' }));
      }
      
      // Fetch employees for birthday generation
      const employeesRes = await fetch(`${import.meta.env.VITE_BASE_URL}/api/hrms/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      let employeesData = [];
      if (employeesRes.ok) {
        const data = await employeesRes.json();
        employeesData = data.employees || [];
        setEmployees(employeesData);
      }
      
      // Fetch leaves with role-based filtering
      const params = new URLSearchParams();
      if (user?.role === 'employee') {
        params.append('logged_in_employee_id', user.id);
        params.append('role', user.role);
      } else if (selectedEmployeeId) {
        params.append('employee_id', selectedEmployeeId);
      }
      
      const leavesRes = await fetch(`${import.meta.env.VITE_BASE_URL}/api/leaves?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      let leavesData = [];
      if (leavesRes.ok) {
        const data = await leavesRes.json();
        leavesData = data.leaves || [];
      }
      
      // Generate birthday events from employee DOB
      const birthdayEvents = generateBirthdayEvents(employeesData, year);
      
      setEvents([...hrmsEvents, ...customEvents, ...birthdayEvents]);
      setLeaves(leavesData);
    } catch (err) {
      setError('Error fetching events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Always fetch working hours reports for current user if they're an employee
    if (user?.role === 'employee') {
      fetchWorkingHoursReports(user.id);
    } else if (selectedEmployeeId) {
      fetchWorkingHoursReports();
    }
    // eslint-disable-next-line
  }, [token, user, year, selectedEmployeeId]);

  // Convert leaves to calendar events
  const leaveEvents = leaves.map(leave => {
    const fromDate = new Date(leave.from_date);
    const toDate = new Date(leave.to_date);
    const events = [];
    
    // Create events for each day of the leave period
    for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      events.push({
        _id: `${leave._id}_${d.toISOString().split('T')[0]}`,
        title: ` ${leave.reason}`,
        date: d.toISOString().split('T')[0],
        type: 'leave' as const,
        leaveData: leave
      });
    }
    return events;
  }).flat();

  // Filter events by year and type
  const filteredEvents = events.filter(event => {
    const eventYear = new Date(event.date).getFullYear();
    const yearMatch = eventYear === Number(year);
    const typeMatch = filter === 'all' ? true : event.type === filter;
    return yearMatch && typeMatch;
  });

  // Filter leave events by year and type
  const filteredLeaveEvents = leaveEvents.filter(event => {
    const eventYear = new Date(event.date).getFullYear();
    const yearMatch = eventYear === Number(year);
    const typeMatch = filter === 'all' ? true : event.type === filter;
    return yearMatch && typeMatch;
  });

  // Filter events based on report filter and user role
  const getFilteredCalendarEvents = () => {
    let eventsToShow = [...filteredEvents];
    
    console.log('Current user role:', user?.role);
    console.log('Current report filter:', reportFilter);
    console.log('Selected employee ID:', selectedEmployeeId);
    console.log('Working hours reports count:', workingHoursReports.length);
    
    // For admin users, hide reports and leaves by default unless specifically filtered
    if (user?.role === 'admin') {
      if (reportFilter === 'all') {
        // Hide leaves by default for admin
        eventsToShow = filteredEvents.filter(event => event.type !== 'leave');
      } else if (reportFilter === 'reports') {
        // Show only reports (leaves + working hours)
        const workingHoursEvents = generateWorkingHoursEvents();
        const missingReportEvents = generateMissingReportEvents();
        console.log('Working hours events generated:', workingHoursEvents.length);
        console.log('Missing report events generated:', missingReportEvents.length);
        eventsToShow = [...filteredLeaveEvents, ...workingHoursEvents, ...missingReportEvents];
      } else if (reportFilter === 'events') {
        // Show only events (no leaves)
        eventsToShow = filteredEvents.filter(event => event.type !== 'leave');
      }
    } else {
      // For employees, show everything based on report filter
      if (reportFilter === 'reports') {
        const workingHoursEvents = generateWorkingHoursEvents();
        const missingReportEvents = generateMissingReportEvents();
        console.log('Working hours events generated:', workingHoursEvents.length);
        console.log('Missing report events generated:', missingReportEvents.length);
        eventsToShow = [...filteredLeaveEvents, ...workingHoursEvents, ...missingReportEvents];
      } else if (reportFilter === 'events') {
        eventsToShow = filteredEvents.filter(event => event.type !== 'leave');
      } else {
        // 'all' - show everything
        const workingHoursEvents = generateWorkingHoursEvents();
        const missingReportEvents = generateMissingReportEvents();
        eventsToShow = [...filteredEvents, ...filteredLeaveEvents, ...workingHoursEvents, ...missingReportEvents];
      }
    }
    
    console.log('Final events to show:', eventsToShow);
    return eventsToShow;
  };

  // Handle employee selection
  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    if (employeeId) {
      fetchWorkingHoursReports(employeeId);
    } else {
      setWorkingHoursReports([]);
    }
  };

  // Combine all events and sort
  const allEvents = [...filteredEvents, ...filteredLeaveEvents];
  const sortedEvents = [...allEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get unique years from all events for dropdown
  const allEventYears = [...events, ...leaveEvents].map(e => new Date(e.date).getFullYear());
  const years = Array.from(new Set(allEventYears));
  if (!years.includes(new Date().getFullYear())) years.push(new Date().getFullYear());
  years.sort((a, b) => a - b);

  // Add new event handler
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;
    setAdding(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newEventTitle, date: newEventDate }),
      });
      if (res.ok) {
        setShowModal(false);
        setNewEventTitle('');
        setNewEventDate('');
        fetchEvents();
      } else {
        setError('Failed to add event');
      }
    } catch (err) {
      setError('Error adding event');
    } finally {
      setAdding(false);
    }
  };

  const calendarEvents = getFilteredCalendarEvents();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Events</h1>
        </div>
        <div className="flex gap-2 items-center">
          <label htmlFor="year" className="mr-2 text-gray-700 font-medium">YEAR:</label>
          <select
            id="year"
            className="border rounded px-3 py-1 text-gray-700"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            className="ml-4 px-4 py-2 rounded bg-purple-700 text-white font-semibold hover:bg-purple-800 transition"
            onClick={() => setShowModal(true)}
          >
            + Add Event
          </button>
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="Add Event"
        ariaHideApp={false}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md md:max-w-md max-w-full mx-auto mt-24 outline-none z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        style={{
          content: {
            inset: 'unset',
            margin: 'auto',
            width: '90%',
            maxWidth: '400px',
            minWidth: '0',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            zIndex: 50,
          },
          overlay: {
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)'
          }
        }}
      >
        <h2 className="text-xl font-bold mb-4">Add Event</h2>
        <form onSubmit={handleAddEvent} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Title</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={newEventTitle}
              onChange={e => setNewEventTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={newEventDate}
              onChange={e => setNewEventDate(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 text-gray-700"
              onClick={() => setShowModal(false)}
              disabled={adding}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-purple-700 text-white font-semibold hover:bg-purple-800 transition"
              disabled={adding}
            >
              {adding ? 'Adding...' : 'Add Event'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="flex flex-col md:flex-row gap-2">
        {/* Event List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-0 flex flex-col w-full md:w-4/12">
          <div className="border-b px-4 py-4 font-semibold text-lg text-gray-800">EVENTS LISTS</div>
          <div className="flex-1 px-4 sm:px-6 py-4 max-h-[80vh] overflow-y-auto">
  {sortedEvents.length === 0 ? (
    <div className="text-center text-gray-500 py-8">No events found</div>
  ) : (
    <ul className="space-y-4">
      {sortedEvents.map((event) => (
        <li
          key={event._id}
          className="flex flex-col border-l-4 pl-3 bg-white rounded-md shadow-sm p-3"
          style={{
            borderColor:
              event.type === 'holiday'
                ? '#e11d48'
                : event.type === 'employee_birthday'
                ? '#2563eb'
                : event.type === 'admin_birthday'
                ? '#a21caf'
                : event.type === 'custom'
                ? '#22c55e'
                : event.type === 'leave'
                ? '#f97316'
                : '#a21caf',
          }}
        >
          <span
            className={`font-semibold text-base ${
              typeColors[event.type] || 'text-green-600'
            }`}
          >
            {event.title}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(event.date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          {event.type === 'leave' && event.leaveData && (
            <span className="text-xs text-gray-400">
              Status: {event.leaveData.status} •{' '}
              {event.leaveData.is_half_day ? 'Half Day' : 'Full Day'}
            </span>
          )}
        </li>
      ))}
    </ul>
  )}
</div>

        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-0 flex flex-col w-full md:w-8/12">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <span className="font-semibold text-lg text-gray-800">EVENT CALENDAR</span>
            <div className="flex gap-2">
              {/* Employee Filter Dropdown (Admin Only) */}
              {user?.role && ['admin', 'super_admin'].includes(user.role) && (
                <select
                  className="border rounded px-2 py-1 text-gray-700"
                  value={selectedEmployeeId}
                  onChange={e => handleEmployeeChange(e.target.value)}
                >
                  <option value="">All Employees</option>
                  {employees
                    .filter(emp => emp.role !== 'admin' && emp.role !== 'super_admin')
                    .map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.first_name} {emp.last_name}
                      </option>
                    ))
                  }
                </select>
              )}
              
              {/* Event Type Filter */}
              <select
                className="border rounded px-2 py-1 text-gray-700"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              >
                <option value="all">All Events</option>
                <option value="employee_birthday">Employee's Birthday</option>
                <option value="admin_birthday">Admin's Birthday</option>
                <option value="holiday">Holiday</option>
                <option value="leave">Leave</option>
              </select>
              
              {/* Report Filter */}
              <select
                className="border rounded px-2 py-1 text-gray-700"
                value={reportFilter}
                onChange={e => setReportFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="events">Events Only</option>
                <option value="reports">Reports & Leaves</option>
              </select>
            </div>
          </div>
          <div className="p-4">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents
                .filter(event => ['employee_birthday', 'admin_birthday', 'holiday', 'custom', 'leave', 'working_hours', 'missing_report'].includes(event.type))
                .map(event => ({
                  id: event._id,
                  title: event.title,
                  start: event.date,
                  allDay: true,
                  backgroundColor:
                    event.type === 'holiday'
                      ? '#e11d48'
                      : event.type === 'employee_birthday'
                      ? '#2563eb'
                      : event.type === 'admin_birthday'
                      ? '#a21caf'
                      : event.type === 'custom'
                      ? '#22c55e'
                      : event.type === 'leave'
                      ? '#f97316'
                      : event.type === 'working_hours'
                      ? '#10b981'
                      : event.type === 'missing_report'
                      ? '#f3f4f6'
                      : '#a21caf',
                  borderColor:
                    event.type === 'holiday'
                      ? '#e11d48'
                      : event.type === 'employee_birthday'
                      ? '#2563eb'
                      : event.type === 'admin_birthday'
                      ? '#a21caf'
                      : event.type === 'custom'
                      ? '#22c55e'
                      : event.type === 'leave'
                      ? '#f97316'
                      : event.type === 'working_hours'
                      ? '#10b981'
                      : event.type === 'missing_report'
                      ? '#f3f4f6'
                      : '#a21caf',
                  textColor: event.type === 'missing_report' ? '#6b7280' : '#fff',
                  display: event.type === 'working_hours' || event.type === 'missing_report' ? 'background' : undefined,
                }))}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek,dayGridDay',
              }}
              displayEventTime={false} // Hide time on events
              height="auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events; 