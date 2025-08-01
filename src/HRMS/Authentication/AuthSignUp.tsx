import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Department {
  _id: string;
  name: string;
  head: string;
}

const initialEmployeeState = {
  department: '',
  first_name: '',
  last_name: '',
  email: '',
  role: 'employee',
  profile: '',
  dob: '',
  gender: '',
  password: '',
  joining_date: '',
  mobile_no1: '',
  mobile_no2: '',
  address_line1: '',
  address_line2: '',
  emergency_contact1: '',
  emergency_contact2: '',
  emergency_contact3: '',
  frontend_skills: '',
  backend_skills: '',
  account_holder_name: '',
  account_number: '',
  ifsc_code: '',
  bank_name: '',
  bank_address: '',
  aadhar_card_number: '',
  aadhar_card_file: null,
  pan_card_number: '',
  pan_card_file: null,
  driving_license_number: '',
  driving_license_file: null,
  facebook_url: '',
  twitter_url: '',
  linkedin_url: '',
  instagram_url: '',
  upwork_profile_url: '',
  resume: null,
  confirmPassword: '',
};

const initialAdminState = {
  department: '',
  first_name: '',
  last_name: '',
  email: '',
  role: 'admin',
  profile: '',
  dob: '',
  gender: '',
  password: '',
  Mobile: '',
  confirmPassword: '',
};

const AuthSignUp: React.FC = () => {
  const [role, setRole] = useState<'admin' | 'employee'>('admin');
  const [employee, setEmployee] = useState<any>(initialEmployeeState);
  const [admin, setAdmin] = useState<any>(initialAdminState);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/hrms/departments`);
        if (response.ok) {
          const data = await response.json();
          setDepartments(data.departments || []);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (role === 'employee') {
      setEmployee((prev: any) => ({
        ...prev,
        [name]: files ? files[0] : value,
      }));
    } else {
      setAdmin((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = role === 'employee' ? employee : admin;
      
      if (userData.password !== userData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(userData).forEach(key => {
        if (key !== 'confirmPassword' && key !== 'profile' && 
            key !== 'aadhar_card_file' && key !== 'pan_card_file' && 
            key !== 'driving_license_file' && key !== 'resume') {
          formData.append(key, userData[key]);
        }
      });

      // Add profile picture if selected
      if (userData.profile && userData.profile instanceof File) {
        formData.append('profile', userData.profile);
      }

      // Add other files for employee
      if (role === 'employee') {
        if (userData.aadhar_card_file && userData.aadhar_card_file instanceof File) {
          formData.append('aadhar_card_file', userData.aadhar_card_file);
        }
        if (userData.pan_card_file && userData.pan_card_file instanceof File) {
          formData.append('pan_card_file', userData.pan_card_file);
        }
        if (userData.driving_license_file && userData.driving_license_file instanceof File) {
          formData.append('driving_license_file', userData.driving_license_file);
        }
        if (userData.resume && userData.resume instanceof File) {
          formData.append('resume', userData.resume);
        }
      }

      const success = await signup(formData);
      if (success) {
        navigate('/login');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-auto overflow-auto max-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join our HRMS platform</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              className={`px-6 py-2 rounded-md transition-all duration-200 ${
                role === 'admin' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setRole('admin')}
            >
              Admin
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded-md transition-all duration-200 ${
                role === 'employee' 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setRole('employee')}
            >
              Employee
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {role === 'employee' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="department" value={employee.department} onChange={handleChange} className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200">
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name}>
                    {dept.name} - {dept.head}
                  </option>
                ))}
              </select>
              <input name="first_name" value={employee.first_name} onChange={handleChange} placeholder="First Name" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <input name="last_name" value={employee.last_name} onChange={handleChange} placeholder="Last Name" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <input name="email" type="email" value={employee.email} onChange={handleChange} placeholder="Email" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <input name="role" value={employee.role} onChange={handleChange} placeholder="Role" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <input 
                  name="profile" 
                  type="file" 
                  accept="image/*"
                  onChange={handleChange} 
                  className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 w-full" 
                />
                {employee.profile && employee.profile instanceof File && (
                  <p className="text-sm text-gray-500 mt-1">Selected: {employee.profile.name}</p>
                )}
              </div>
              <input name="dob" type="date" value={employee.dob} onChange={handleChange} placeholder="DOB" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <select name="gender" value={employee.gender} onChange={handleChange} className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required>
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input name="password" type="password" value={employee.password} onChange={handleChange} placeholder="Password" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <input name="confirmPassword" type="password" value={employee.confirmPassword} onChange={handleChange} placeholder="Confirm Password" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <input name="joining_date" type="date" value={employee.joining_date} onChange={handleChange} placeholder="Joining Date" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="mobile_no1" value={employee.mobile_no1} onChange={handleChange} placeholder="Mobile No 1" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <input name="mobile_no2" value={employee.mobile_no2} onChange={handleChange} placeholder="Mobile No 2" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="address_line1" value={employee.address_line1} onChange={handleChange} placeholder="Address Line 1" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="address_line2" value={employee.address_line2} onChange={handleChange} placeholder="Address Line 2" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="emergency_contact1" value={employee.emergency_contact1} onChange={handleChange} placeholder="Emergency Contact 1" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="emergency_contact2" value={employee.emergency_contact2} onChange={handleChange} placeholder="Emergency Contact 2" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="emergency_contact3" value={employee.emergency_contact3} onChange={handleChange} placeholder="Emergency Contact 3" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="frontend_skills" value={employee.frontend_skills} onChange={handleChange} placeholder="Frontend Skills" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="backend_skills" value={employee.backend_skills} onChange={handleChange} placeholder="Backend Skills" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="account_holder_name" value={employee.account_holder_name} onChange={handleChange} placeholder="Account Holder Name" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="account_number" value={employee.account_number} onChange={handleChange} placeholder="Account Number" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="ifsc_code" value={employee.ifsc_code} onChange={handleChange} placeholder="IFSC Code" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="bank_name" value={employee.bank_name} onChange={handleChange} placeholder="Bank Name" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="bank_address" value={employee.bank_address} onChange={handleChange} placeholder="Bank Address" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="aadhar_card_number" value={employee.aadhar_card_number} onChange={handleChange} placeholder="Aadhar Card Number" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="aadhar_card_file" type="file" onChange={handleChange} className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="pan_card_number" value={employee.pan_card_number} onChange={handleChange} placeholder="PAN Card Number" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="pan_card_file" type="file" onChange={handleChange} className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="driving_license_number" value={employee.driving_license_number} onChange={handleChange} placeholder="Driving License Number" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="driving_license_file" type="file" onChange={handleChange} className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="facebook_url" value={employee.facebook_url} onChange={handleChange} placeholder="Facebook URL" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="twitter_url" value={employee.twitter_url} onChange={handleChange} placeholder="Twitter URL" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="linkedin_url" value={employee.linkedin_url} onChange={handleChange} placeholder="LinkedIn URL" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="instagram_url" value={employee.instagram_url} onChange={handleChange} placeholder="Instagram URL" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="upwork_profile_url" value={employee.upwork_profile_url} onChange={handleChange} placeholder="Upwork Profile URL" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
              <input name="resume" type="file" onChange={handleChange} className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="department" value={admin.department} onChange={handleChange} className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200">
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name}>
                    {dept.name} - {dept.head}
                  </option>
                ))}
              </select>
              <input name="first_name" value={admin.first_name} onChange={handleChange} placeholder="First Name" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <input name="last_name" value={admin.last_name} onChange={handleChange} placeholder="Last Name" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <input name="email" type="email" value={admin.email} onChange={handleChange} placeholder="Email" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <input name="role" value={admin.role} onChange={handleChange} placeholder="Role" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <input 
                  name="profile" 
                  type="file" 
                  accept="image/*"
                  onChange={handleChange} 
                  className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 w-full" 
                />
                {admin.profile && admin.profile instanceof File && (
                  <p className="text-sm text-gray-500 mt-1">Selected: {admin.profile.name}</p>
                )}
              </div>
              <input name="dob" type="date" value={admin.dob} onChange={handleChange} placeholder="DOB" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <select name="gender" value={admin.gender} onChange={handleChange} className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required>
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input name="password" type="password" value={admin.password} onChange={handleChange} placeholder="Password" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <input name="confirmPassword" type="password" value={admin.confirmPassword} onChange={handleChange} placeholder="Confirm Password" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
              <input name="Mobile" value={admin.Mobile} onChange={handleChange} placeholder="Mobile" className="p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200" required />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : role === 'admin' 
                  ? 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105' 
                  : 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthSignUp; 