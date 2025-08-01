import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface Report {
  id: string;
  employee_id: string;
  created_at: string;
  todays_working_hours: string;
  report: string;
}

interface Leave {
  id: string;
  employee_id: string;
  from_date: string;
  to_date: string;
  is_half_day: string | number;
  reason: string;
  status: string;
}

interface AlternateSaturday {
  date: string;
}

interface Holiday {
  event_date: string;
}

interface MonthDay {
  display: string;
  key: string;
}

const Statistics: React.FC = () => {
  const { token } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [reportsData, setReportsData] = useState<Report[]>([]);
  const [leavesData, setLeavesData] = useState<Leave[]>([]);
  const [alternateSaturdayData, setAlternateSaturdayData] = useState<string[]>([]);
  const [holidaysData, setHolidaysData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const getMonths = () => {
    return Array.from({ length: 12 }, (_, index) => {
      return new Date(2000, index, 1).toLocaleString('default', { month: 'long' });
    });
  };

  const getEmployees = async () => {
    try {
      const params = new URLSearchParams({
        action: 'view',
        role: 'employee',
        year: selectedYear.toString(),
        status: '1',
        month: selectedMonth.toString(),
        statistics_visibility_status: 'statistics_visibility_status'
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
          setEmployeesData(data.data || []);
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
      setIsLoading(false);
    }
  };

  const getReports = async () => {
    try {
      const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
      const lastDay = new Date(selectedYear, selectedMonth, 0);
      const fromDate = firstDay.toISOString().split('T')[0];
      const toDate = lastDay.toISOString().split('T')[0];

      const params = new URLSearchParams({
        action: 'view',
        from_date: fromDate,
        to_date: toDate
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
          setReportsData(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch reports');
        }
      } else {
        setError('Failed to fetch reports data');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports data');
    }
  };

  const getLeaves = async () => {
    try {
      const params = new URLSearchParams({
        action: 'view',
        status: 'approved'
      });

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/employee_leaves.php?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          setLeavesData(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch leaves');
        }
      } else {
        setError('Failed to fetch leaves data');
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
      setError('Failed to fetch leaves data');
    }
  };

  const getAlternateSaturdays = async () => {
    try {
      const params = new URLSearchParams({
        action: 'view',
        year: selectedYear.toString(),
        month: selectedMonth.toString()
      });

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/alternate_saturdays.php?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
          const alternateDatesRaw = data.data[0].date;
          const parsedDates = JSON.parse(alternateDatesRaw);

          const alternateSaturdayData = parsedDates.map((dateStr: string) => {
            const d = new Date(dateStr);
            const yyyy = d.getFullYear();
            const mm = (d.getMonth() + 1).toString().padStart(2, "0");
            const dd = d.getDate().toString().padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
          });

          setAlternateSaturdayData(alternateSaturdayData);
        } else {
          setAlternateSaturdayData([]);
        }
      } else {
        setAlternateSaturdayData([]);
      }
    } catch (error) {
      console.error("Failed to fetch saved Saturdays:", error);
      setAlternateSaturdayData([]);
    }
  };

  const getHolidays = async () => {
    try {
      const params = new URLSearchParams({
        action: 'view',
        event_type: 'holiday'
      });

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/events.php?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          const holidayDates = data.data.map((item: any) => item.event_date);
          setHolidaysData(holidayDates);
        } else {
          setError(data.message || 'Failed to fetch holidays');
        }
      } else {
        setError('Failed to fetch holidays data');
      }
    } catch (err) {
      console.error('Error fetching holidays:', err);
      setError('Failed to fetch holidays data');
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getEmployees();
    getReports();
    getLeaves();
    getAlternateSaturdays();
    getHolidays();
  }, [selectedYear, selectedMonth]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value);
    setSelectedMonth(month);
  };

  const getAllDatesOfMonth = (year: number, month: number): MonthDay[] => {
    const date = new Date(year, month - 1, 1);
    const days: MonthDay[] = [];

    while (date.getMonth() === month - 1) {
      const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
      const day = date.getDate();
      const monthName = date.toLocaleDateString("en-US", { month: "long" });
      const yearValue = date.getFullYear();

      days.push({
        display: `${weekday}, ${day} ${monthName}`,
        key: `${yearValue}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`,
      });

      date.setDate(date.getDate() + 1);
    }

    return days;
  };

  const prepareAttendanceFromReports = () => {
    const attendanceByDate: Record<string, Record<string, string>> = {};

    reportsData.forEach(report => {
      const date = report.created_at.split(' ')[0];
      if (!attendanceByDate[date]) {
        attendanceByDate[date] = {};
      }
      attendanceByDate[date][report.employee_id] = report.todays_working_hours || "";
    });

    return attendanceByDate;
  };

  const countLeavesPerEmployee = (leavesData: Leave[], selectedYear: number, selectedMonth: number) => {
    const counts: Record<string, number> = {};

    leavesData.forEach((leave) => {
      const { employee_id, from_date, to_date, is_half_day } = leave;
      const from = new Date(from_date);
      const to = new Date(to_date);
      const year = selectedYear;
      const month = selectedMonth;

      let current = new Date(from);
      while (current <= to) {
        let formattedDate = dayjs(new Date(current)).format('YYYY-MM-DD');
        const isSunday = current.getDay() === 0;
        const isAlternateSaturday = alternateSaturdayData.includes(formattedDate);
        const isHoliday = holidaysData.includes(formattedDate);

        if (!(isSunday || isAlternateSaturday || isHoliday)) {
          if (current.getFullYear() === year && current.getMonth() + 1 === month) {
            if (is_half_day === "1" || is_half_day === 1) {
              counts[employee_id] = (counts[employee_id] || 0) + 0.5;
            } else {
              counts[employee_id] = (counts[employee_id] || 0) + 1;
            }
          }
        }

        current.setDate(current.getDate() + 1);
      }
    });

    return counts;
  };

  const calculateHalfLeaves = (attendanceByDate: Record<string, Record<string, string>>, employeesData: Employee[], monthDays: MonthDay[]) => {
    const halfLeaveCounts: Record<string, number> = {};

    monthDays.forEach(day => {
      const attendance = attendanceByDate[day.key] || {};

      employeesData.forEach(employee => {
        const rawHours = attendance[employee.id];
        const isAlternateSaturday = alternateSaturdayData.includes(day.key);

        const dateObj = new Date(day.key);
        const isSunday = dateObj.getDay() === 0;
        const isHoliday = holidaysData.includes(day.key);

        const workedOnSpecialDay = rawHours !== "" && (
          isSunday || isAlternateSaturday || isHoliday
        );

        if (rawHours && rawHours !== "" && rawHours.includes(":")) {
          const [hours, minutes] = rawHours.split(":").map(Number);
          const totalHours = hours + minutes / 60;

          if (!workedOnSpecialDay && totalHours >= 4 && totalHours < 8) {
            halfLeaveCounts[employee.id] = (halfLeaveCounts[employee.id] || 0) + 0.5;
          }
        }
      });
    });

    return halfLeaveCounts;
  };

  const calculateExtraWorkingDays = (attendanceByDate: Record<string, Record<string, string>>, employeesData: Employee[], monthDays: MonthDay[]) => {
    const extraWorkCounts: Record<string, number> = {};

    monthDays.forEach(day => {
      const dateObj = new Date(day.key);
      const isSunday = dateObj.getDay() === 0;
      const isAlternateSaturday = alternateSaturdayData.includes(day.key);
      const isHoliday = holidaysData.includes(day.key);
      
      if (!isSunday && !isAlternateSaturday && !isHoliday) return;
      
      const attendance = attendanceByDate[day.key] || {};
      employeesData.forEach(employee => {
        const rawHours = attendance[employee.id];

        if (rawHours && rawHours !== "" && rawHours.includes(":")) {
          const [hours, minutes] = rawHours.split(":").map(Number);
          const totalHours = hours + minutes / 60;
          if (totalHours >= 8) {
            extraWorkCounts[employee.id] = (extraWorkCounts[employee.id] || 0) + 1;
          } else if (totalHours >= 0) {
            extraWorkCounts[employee.id] = (extraWorkCounts[employee.id] || 0) + 0.5;
          }
        }
      });
    });
    
    return extraWorkCounts;
  };

  const monthDays = getAllDatesOfMonth(selectedYear, selectedMonth);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const attendanceByDate = prepareAttendanceFromReports();
  const leaveCounts = countLeavesPerEmployee(leavesData, selectedYear, selectedMonth);
  const halfLeaveCounts = calculateHalfLeaves(attendanceByDate, employeesData, monthDays);
  const extraWorkingCounts = calculateExtraWorkingDays(attendanceByDate, employeesData, monthDays);

  return (
    <div className="section-body mt-3">
      <div className="container-fluid">
        {/* Filters */}
        <div className="d-flex flex-wrap align-items-center mb-3">
          <div className="d-flex align-items-center mr-3 mb-2">
            <label htmlFor="year-selector" className="mr-2 mb-0">Year:</label>
            <select 
              id="year-selector" 
              className="custom-select" 
              value={selectedYear} 
              onChange={handleYearChange}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="d-flex align-items-center mb-2">
            <label htmlFor="month-selector" className="mr-2 mb-0">Month:</label>
            <select 
              id="month-selector" 
              className="custom-select" 
              value={selectedMonth} 
              onChange={handleMonthChange}
            >
              {getMonths().map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto">
            <span style={{ backgroundColor: "#ff0000", color: "#fff", padding: "4px 8px", borderRadius: "4px", marginRight: "10px" }}>Leave</span>
            <span style={{ backgroundColor: "#00ffff", color: "#000", padding: "4px 8px", borderRadius: "4px", marginRight: "10px" }}>Half day</span>
            <span style={{ backgroundColor: "#28a745", color: "#000", padding: "4px 8px", borderRadius: "4px", marginRight: "10px" }}>Extra working</span>
            <span style={{ backgroundColor: "#FAAA69", color: "#000", padding: "4px 8px", borderRadius: "4px", marginRight: "10px" }}>Holiday</span>
            <span style={{ backgroundColor: "#fff2cc", color: "#000", padding: "4px 8px", borderRadius: "4px" }}>Alternate Saturday/Sunday</span>
          </div>
        </div>

        {isLoading ? (
          <div className="dimmer active p-5">
            <div className="loader" />
          </div>
        ) : (
          <div style={{ overflowX: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#a2c4c9 #ffffff', scrollBehavior: 'smooth' }}>
            <table className="table table-bordered table-sm text-center" style={{ minWidth: '600px' }}>
              <thead style={{ backgroundColor: "#a2c4c9" }}>
                <tr>
                  <th style={{ padding: "14px" }}>Date</th>
                  {employeesData.map((employee) => (
                    <th style={{ padding: "14px" }} key={employee.id}>{employee.first_name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthDays.map((day, rowIndex) => {
                  const dayAttendance = attendanceByDate[day.key] || {};
                  const isAlternateSaturday = alternateSaturdayData.includes(day.key);

                  const dateObj = new Date(day.key);
                  const isSunday = dateObj.getDay() === 0;
                  const isHoliday = holidaysData.includes(day.key);

                  // Highlight entire row if Sunday or alternate Saturday
                  const highlightRow = isAlternateSaturday || isSunday || isHoliday;

                  return (
                    <tr key={rowIndex} style={highlightRow ? { backgroundColor: isHoliday ? '#FAAA69' : '#fff2cc' } : {}}>
                      <td style={{ backgroundColor: "#b7e1cd" }}>{day.display}</td>
                      {employeesData.map((employee, colIndex) => {
                        const value = dayAttendance[employee.id] || "";
                        const isMissingReport = value === "";

                        let hoursNumber = 0;
                        let cellStyle = {};

                        const matchingLeave = leavesData.find((leave) =>
                          leave.employee_id === employee.id.toString() &&
                          day.key >= leave.from_date &&
                          day.key <= leave.to_date
                        );
                        const isOnLeave = !!matchingLeave;
                        const isHalfDayLeave = matchingLeave?.is_half_day === "1" || matchingLeave?.is_half_day === 1;
                        const workedOnSpecialDay = !isMissingReport && (
                          isSunday || isAlternateSaturday || isHoliday
                        );

                        if (!isMissingReport && value.includes(":")) {
                          const parts = value.split(":").map(Number);
                          hoursNumber = parts[0] + parts[1] / 60;

                          if (hoursNumber >= 0 && hoursNumber < 4) {
                            if (!workedOnSpecialDay) {
                              leaveCounts[employee.id] = (leaveCounts[employee.id] || 0) + 1;
                            }
                            cellStyle = { backgroundColor: "#ff0000", color: "#fff" };
                          } else if (hoursNumber >= 4 && hoursNumber < 8) {
                            cellStyle = { backgroundColor: "#00ffff", color: "#000" };
                          }
                        }

                        const today = new Date();
                        const currentDate = new Date(day.key);
                        today.setHours(0, 0, 0, 0);
                        currentDate.setHours(0, 0, 0, 0);

                        if (workedOnSpecialDay) {
                          cellStyle = { backgroundColor: "#28a745", color: "#000" }; // Green for working on a special day
                        } else if (isOnLeave) {
                          if (!isMissingReport) {
                            leaveCounts[employee.id] = (leaveCounts[employee.id] || 0) - (isHalfDayLeave ? 0.5 : 1);
                          } else {
                            if (isHalfDayLeave && isMissingReport) {
                              cellStyle = { backgroundColor: "#00ffff", color: "#000" }; // Cyan for half-day
                            } else {
                              cellStyle = { backgroundColor: "#ff0000", color: "#fff" }; // Red for full-day
                            }
                          }
                        } else if (isMissingReport && !highlightRow && currentDate < today) {
                          // Missing report and it is not alternate sat, sun or holiday
                          cellStyle = { backgroundColor: "#ff0000", color: "#fff" }; // Override red 
                          leaveCounts[employee.id] = (leaveCounts[employee.id] || 0) + 1;
                        }

                        let splitValue = dayAttendance[employee.id] || "";
                        if (splitValue && splitValue.split(":").length === 3) {
                          splitValue = splitValue.split(":").slice(0, 2).join(":");

                          // Remove the leading 0 from the hour part (if it exists)
                          let parts = splitValue.split(":");
                          if (parts[0].startsWith('0')) {
                            parts[0] = parts[0].slice(1);
                          }
                          splitValue = parts.join(":");
                        }

                        return (
                          <td key={colIndex} style={cellStyle}>
                            {splitValue}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Summary Row 1: Leave Taken */}
                <tr style={{ fontWeight: 'bold' }}>
                  <td style={{ backgroundColor: '#999999' }}>Leave Taken(-)</td>
                  {employeesData.map((emp) => {
                    const fullLeaves = leaveCounts[emp.id] || 0;
                    const halfLeaves = halfLeaveCounts[emp.id] || 0;
                    const total = Math.round((fullLeaves + halfLeaves) * 10) / 10; // Round to 1 decimal
                    return <td key={emp.id}>{total}</td>;
                  })}
                </tr>

                {/* Summary Row 2: Extra Working Days */}
                <tr style={{ fontWeight: 'bold' }}>
                  <td style={{ backgroundColor: '#b7e1cd' }}>Extra Working Days(+)</td>
                  {employeesData.map((emp) => (
                    <td key={emp.id}>{extraWorkingCounts[emp.id] || 0}</td>
                  ))}
                </tr>

                {/* Summary Row 3: Paid Leaves */}
                <tr style={{ fontWeight: 'bold' }}>
                  <td style={{ backgroundColor: '#b7e1cd' }}>Paid Leave(+)</td>
                  {employeesData.map((emp) => (
                    <td key={emp.id}>1</td>
                  ))}
                </tr>

                {/* Summary Row 4: Deduction/Paid */}
                <tr style={{ fontWeight: 'bold', backgroundColor: '#a4c2f4' }}>
                  <td>Deduction/Paid</td>
                  {employeesData.map((emp) => {
                    const fullLeaves = leaveCounts[emp.id] || 0;
                    const halfLeaves = halfLeaveCounts[emp.id] || 0;
                    const extraWorkCounts = extraWorkingCounts[emp.id] || 0;
                    const totalDeduction = (extraWorkCounts + 1) - (fullLeaves + halfLeaves); // Subtract 1 paid leave
                    return (
                      <td key={emp.id}>{totalDeduction}</td>
                    );
                  })}
                </tr>

                {/* Summary Row 5: No Of Days Salary To Be Credited */}
                <tr style={{ fontWeight: 'bold', backgroundColor: '#f4cccc' }}>
                  <td>No Of Days Salary To Be Credited</td>
                  {employeesData.map((emp) => {
                    const fullLeaves = leaveCounts[emp.id] || 0;
                    const halfLeaves = halfLeaveCounts[emp.id] || 0;
                    const extraWorkCounts = extraWorkingCounts[emp.id] || 0;
                    const deduction = (extraWorkCounts + 1) - (fullLeaves + halfLeaves);
                    const salaryDays = deduction + 30;
                    return (
                      <td key={emp.id}>{salaryDays}</td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics; 