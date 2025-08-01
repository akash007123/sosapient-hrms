import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface TeamMember {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile?: string;
  department?: string;
}

interface Client {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  project_name: string;
  project_description: string;
  project_technology: string;
  client: Client;
  team_members: TeamMember[];
  project_start_date: string;
  project_end_date?: string;
  status: 'active' | 'inactive';
  created_by: {
    _id: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  totalUsers: number;
  totalEmployees: number;
  totalHolidays: number;
  totalEvents: number;
}

// Profile Image Component
const ProfileImage: React.FC<{
  profile?: string;
  firstName: string;
  lastName: string;
  className?: string;
}> = ({ profile, firstName, lastName, className = "w-8 h-8 rounded-full object-cover" }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('ProfileImage debug:', { profile, firstName, lastName });
    
    if (profile && profile.startsWith('http')) {
      console.log('Using full URL:', profile);
      setImageSrc(profile);
    } else if (profile) {
      // Handle both relative paths (starting with /) and just filenames
      const profilePath = profile.startsWith('/') 
        ? `${import.meta.env.VITE_BASE_URL}${profile}`
        : `${import.meta.env.VITE_BASE_URL}/uploads/profiles/${profile}`;
      console.log('Using profile path:', profilePath);
      setImageSrc(profilePath);
    } else {
      const initialsUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${firstName} ${lastName}`)}&background=6366f1&color=fff&size=32`;
      console.log('Using initials URL:', initialsUrl);
      setImageSrc(initialsUrl);
    }
  }, [profile, firstName, lastName]);

  const handleError = () => {
    console.log('ProfileImage error for:', { profile, firstName, lastName, currentSrc: imageSrc });
    if (!hasError) {
      setHasError(true);
      const initialsUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${firstName} ${lastName}`)}&background=6366f1&color=fff&size=32`;
      console.log('Falling back to initials URL:', initialsUrl);
      setImageSrc(initialsUrl);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={`${firstName} ${lastName}`}
      className={className}
      title={`${firstName} ${lastName}`}
      onError={handleError}
    />
  );
};

const Dashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEmployees: 0,
    totalHolidays: 0,
    totalEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch projects based on user role (similar to reference Dashboard.js)
      let projectsUrl = `${import.meta.env.VITE_BASE_URL}/api/projects`;
      
      // Add query parameters like reference Dashboard.js
      const params = new URLSearchParams();
      if (user?.role === 'employee') {
        params.append('logged_in_employee_id', user.id);
        params.append('role', user.role);
      }
      
      if (params.toString()) {
        projectsUrl += `?${params.toString()}`;
      }

      console.log('Dashboard - User info:', { id: user?.id, role: user?.role });
      console.log('Dashboard - Projects URL:', projectsUrl);

      const projectsResponse = await fetch(projectsUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        console.log('Projects data:', projectsData);
        console.log('First project team members:', projectsData.projects?.[0]?.team_members);
        setProjects(projectsData.projects || []);
      }

      // Fetch dashboard stats
              const statsResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Dashboard stats data:', statsData);
        setStats(statsData);
      } else {
        console.error('Stats response not ok:', statsResponse.status);
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, user]);

  const renderStatCards = () => {
    // Only show stats cards for admin users (similar to reference Dashboard.js)
    if (!(user?.role === 'admin')) {
      return null;
    }

    const items = [
      { 
        label: 'Users', 
        class_color: 'bg-green-100 text-green-800', 
        count: stats.totalUsers, 
        icon: '👥', 
        link: '/hr-users' 
      },
      { 
        label: 'Employees', 
        class_color: 'bg-pink-100 text-pink-800', 
        count: stats.totalEmployees, 
        icon: '👨‍💼', 
        link: '/hr-employee' 
      },
      { 
        label: 'Holidays', 
        class_color: 'bg-teal-100 text-teal-800', 
        count: stats.totalHolidays, 
        icon: '🎉', 
        link: '/hr-holidays' 
      },
      { 
        label: 'Events', 
        class_color: 'bg-purple-100 text-purple-800', 
        count: stats.totalEvents, 
        icon: '📅', 
        link: '/hr-events' 
      },
      { 
        label: 'Report', 
        class_color: 'bg-gray-100 text-gray-800', 
        count: null, 
        icon: '📊', 
        link: '/hr-report' 
      },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {items.map(({ label, class_color, count, icon, link }) => (
          <div key={label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              {count !== null && (
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${class_color}`}>
                  {count}
                </div>
              )}
              <div className="text-2xl">{icon}</div>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-900">{label}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">HR Dashboard</h1>
          <h2 className="text-xl text-gray-700">
            Welcome {user?.first_name} {user?.last_name}!
          </h2>
          {user?.role === 'employee' && (
            <p className="text-sm text-gray-500 mt-1">
              You can view your assigned projects and clients below.
            </p>
          )}
        </div>

        {/* Stats Cards - Only for Admin/Super Admin */}
        {renderStatCards()}

        {/* Project Summary Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {user?.role === 'employee' ? 'MY ASSIGNED PROJECTS' : 'PROJECT SUMMARY'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-500">Loading projects...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Technology
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.length > 0 ? (
                    projects.map((project, index) => (
                      <tr key={project._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(index + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.client?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {project.team_members && project.team_members.length > 0 ? (
                              <>
                                {project.team_members.slice(0, 3).map((member, idx) => (
                                  <div key={member._id} className="relative">
                                    <ProfileImage
                                      profile={member.profile}
                                      firstName={member.first_name}
                                      lastName={member.last_name}
                                      className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                                    />
                                  </div>
                                ))}
                                {project.team_members.length > 3 && (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white shadow-sm">
                                    +{project.team_members.length - 3}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-500">No team members</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.project_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.project_technology}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <p>
                          {user?.role === 'employee' 
                            ? 'No projects available' 
                            : 'No projects available'
                          }
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;