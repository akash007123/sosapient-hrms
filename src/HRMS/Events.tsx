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
  type: 'holiday' | 'employee_birthday' | 'admin_birthday' | 'custom';
}

const typeColors: Record<EventItem['type'], string> = {
  holiday: 'text-red-600',
  employee_birthday: 'text-blue-600',
  admin_birthday: 'text-purple-600',
  custom: 'text-green-600',
};

const typeLabels: Record<EventItem['type'], string> = {
  holiday: 'Holiday',
  employee_birthday: "Employee's Birthday",
  admin_birthday: "Admin's Birthday",
  custom: 'Custom Event',
};

const Events: React.FC = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [adding, setAdding] = useState(false);

  // Fetch both HRMS events and custom events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Fetch HRMS events (holidays, birthdays)
      const hrmsRes = await fetch('http://localhost:5000/api/hrms/events', {
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
      const customRes = await fetch('http://localhost:5000/api/events', {
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
      setEvents([...hrmsEvents, ...customEvents]);
    } catch (err) {
      setError('Error fetching events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [token]);

  // Filter events by year and type
  const filteredEvents = events.filter(event => {
    const eventYear = new Date(event.date).getFullYear();
    const yearMatch = eventYear === Number(year);
    const typeMatch = filter === 'all' ? true : event.type === filter;
    return yearMatch && typeMatch;
  });

  // Sort filteredEvents in descending order by date
  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get unique years from events for dropdown
  const years = Array.from(new Set(events.map(e => new Date(e.date).getFullYear())));
  if (!years.includes(new Date().getFullYear())) years.push(new Date().getFullYear());
  years.sort((a, b) => a - b);

  // Add new event handler
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;
    setAdding(true);
    try {
      const res = await fetch('http://localhost:5000/api/events', {
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
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {sortedEvents.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No events found</div>
            ) : (
              <ul className="space-y-4">
                {sortedEvents.map(event => (
                  <li key={event._id} className="flex flex-col border-l-4 pl-3" style={{ borderColor: event.type === 'holiday' ? '#e11d48' : event.type === 'employee_birthday' ? '#2563eb' : event.type === 'custom' ? '#22c55e' : '#a21caf' }}>
                    <span className={`font-semibold text-base ${typeColors[event.type] || 'text-green-600'}`}>{event.title}</span>
                    <span className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
            <select
              className="border rounded px-2 py-1 text-gray-700"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All Events</option>
              <option value="employee_birthday">Employee's Birthday</option>
              <option value="admin_birthday">Admin's Birthday</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>
          <div className="p-4">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={filteredEvents
                .filter(event => ['employee_birthday', 'admin_birthday', 'holiday', 'custom'].includes(event.type))
                .map(event => ({
                  id: event._id,
                  title: event.title,
                  start: event.date,
                  allDay: true, // Ensure no time is shown
                  backgroundColor:
                    event.type === 'holiday'
                      ? '#e11d48'
                      : event.type === 'employee_birthday'
                      ? '#2563eb'
                      : event.type === 'custom'
                      ? '#22c55e'
                      : '#a21caf',
                  borderColor:
                    event.type === 'holiday'
                      ? '#e11d48'
                      : event.type === 'employee_birthday'
                      ? '#2563eb'
                      : event.type === 'custom'
                      ? '#22c55e'
                      : '#a21caf',
                  textColor: '#fff',
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