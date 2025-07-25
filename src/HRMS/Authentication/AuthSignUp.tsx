import React, { useState } from 'react';

const initialEmployeeState = {
  department: '',
  first_name: '',
  last_name: '',
  email: '',
  role: '',
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
  role: '',
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
  const [error, setError] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'employee') {
      if (employee.password !== employee.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setError('');
      alert('Employee signup successful!');
    } else {
      if (admin.password !== admin.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setError('');
      alert('Admin signup successful!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 overflow-auto">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-2xl overflow-auto">
        <div className="flex justify-center mb-6">
          <button
            type="button"
            className={`px-4 py-2 rounded-l ${role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setRole('admin')}
          >
            Admin
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-r ${role === 'employee' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setRole('employee')}
          >
            Employee
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">{role === 'admin' ? 'Admin Sign Up' : 'Employee Sign Up'}</h2>
        {role === 'employee' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="department" value={employee.department} onChange={handleChange} placeholder="Department" className="p-2 border rounded" required />
            <input name="first_name" value={employee.first_name} onChange={handleChange} placeholder="First Name" className="p-2 border rounded" required />
            <input name="last_name" value={employee.last_name} onChange={handleChange} placeholder="Last Name" className="p-2 border rounded" required />
            <input name="email" type="email" value={employee.email} onChange={handleChange} placeholder="Email" className="p-2 border rounded" required />
            <input name="role" value={employee.role} onChange={handleChange} placeholder="Role" className="p-2 border rounded" required />
            <input name="profile" value={employee.profile} onChange={handleChange} placeholder="Profile" className="p-2 border rounded" />
            <input name="dob" type="date" value={employee.dob} onChange={handleChange} placeholder="DOB" className="p-2 border rounded" required />
            <select name="gender" value={employee.gender} onChange={handleChange} className="p-2 border rounded" required>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input name="password" type="password" value={employee.password} onChange={handleChange} placeholder="Password" className="p-2 border rounded" required />
            <input name="confirmPassword" type="password" value={employee.confirmPassword} onChange={handleChange} placeholder="Confirm Password" className="p-2 border rounded" required />
            <input name="joining_date" type="date" value={employee.joining_date} onChange={handleChange} placeholder="Joining Date" className="p-2 border rounded" />
            <input name="mobile_no1" value={employee.mobile_no1} onChange={handleChange} placeholder="Mobile No 1" className="p-2 border rounded" required />
            <input name="mobile_no2" value={employee.mobile_no2} onChange={handleChange} placeholder="Mobile No 2" className="p-2 border rounded" />
            <input name="address_line1" value={employee.address_line1} onChange={handleChange} placeholder="Address Line 1" className="p-2 border rounded" />
            <input name="address_line2" value={employee.address_line2} onChange={handleChange} placeholder="Address Line 2" className="p-2 border rounded" />
            <input name="emergency_contact1" value={employee.emergency_contact1} onChange={handleChange} placeholder="Emergency Contact 1" className="p-2 border rounded" />
            <input name="emergency_contact2" value={employee.emergency_contact2} onChange={handleChange} placeholder="Emergency Contact 2" className="p-2 border rounded" />
            <input name="emergency_contact3" value={employee.emergency_contact3} onChange={handleChange} placeholder="Emergency Contact 3" className="p-2 border rounded" />
            <input name="frontend_skills" value={employee.frontend_skills} onChange={handleChange} placeholder="Frontend Skills" className="p-2 border rounded" />
            <input name="backend_skills" value={employee.backend_skills} onChange={handleChange} placeholder="Backend Skills" className="p-2 border rounded" />
            <input name="account_holder_name" value={employee.account_holder_name} onChange={handleChange} placeholder="Account Holder Name" className="p-2 border rounded" />
            <input name="account_number" value={employee.account_number} onChange={handleChange} placeholder="Account Number" className="p-2 border rounded" />
            <input name="ifsc_code" value={employee.ifsc_code} onChange={handleChange} placeholder="IFSC Code" className="p-2 border rounded" />
            <input name="bank_name" value={employee.bank_name} onChange={handleChange} placeholder="Bank Name" className="p-2 border rounded" />
            <input name="bank_address" value={employee.bank_address} onChange={handleChange} placeholder="Bank Address" className="p-2 border rounded" />
            <input name="aadhar_card_number" value={employee.aadhar_card_number} onChange={handleChange} placeholder="Aadhar Card Number" className="p-2 border rounded" />
            <input name="aadhar_card_file" type="file" onChange={handleChange} className="p-2 border rounded" />
            <input name="pan_card_number" value={employee.pan_card_number} onChange={handleChange} placeholder="PAN Card Number" className="p-2 border rounded" />
            <input name="pan_card_file" type="file" onChange={handleChange} className="p-2 border rounded" />
            <input name="driving_license_number" value={employee.driving_license_number} onChange={handleChange} placeholder="Driving License Number" className="p-2 border rounded" />
            <input name="driving_license_file" type="file" onChange={handleChange} className="p-2 border rounded" />
            <input name="facebook_url" value={employee.facebook_url} onChange={handleChange} placeholder="Facebook URL" className="p-2 border rounded" />
            <input name="twitter_url" value={employee.twitter_url} onChange={handleChange} placeholder="Twitter URL" className="p-2 border rounded" />
            <input name="linkedin_url" value={employee.linkedin_url} onChange={handleChange} placeholder="LinkedIn URL" className="p-2 border rounded" />
            <input name="instagram_url" value={employee.instagram_url} onChange={handleChange} placeholder="Instagram URL" className="p-2 border rounded" />
            <input name="upwork_profile_url" value={employee.upwork_profile_url} onChange={handleChange} placeholder="Upwork Profile URL" className="p-2 border rounded" />
            <input name="resume" type="file" onChange={handleChange} className="p-2 border rounded" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="department" value={admin.department} onChange={handleChange} placeholder="Department" className="p-2 border rounded" required />
            <input name="first_name" value={admin.first_name} onChange={handleChange} placeholder="First Name" className="p-2 border rounded" required />
            <input name="last_name" value={admin.last_name} onChange={handleChange} placeholder="Last Name" className="p-2 border rounded" required />
            <input name="email" type="email" value={admin.email} onChange={handleChange} placeholder="Email" className="p-2 border rounded" required />
            <input name="role" value={admin.role} onChange={handleChange} placeholder="Role" className="p-2 border rounded" required />
            <input name="profile" value={admin.profile} onChange={handleChange} placeholder="Profile" className="p-2 border rounded" />
            <input name="dob" type="date" value={admin.dob} onChange={handleChange} placeholder="DOB" className="p-2 border rounded" required />
            <select name="gender" value={admin.gender} onChange={handleChange} className="p-2 border rounded" required>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input name="password" type="password" value={admin.password} onChange={handleChange} placeholder="Password" className="p-2 border rounded" required />
            <input name="confirmPassword" type="password" value={admin.confirmPassword} onChange={handleChange} placeholder="Confirm Password" className="p-2 border rounded" required />
            <input name="Mobile" value={admin.Mobile} onChange={handleChange} placeholder="Mobile" className="p-2 border rounded" required />
          </div>
        )}
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <button type="submit" className={`w-full mt-6 ${role === 'admin' ? 'bg-blue-600' : 'bg-green-600'} text-white py-2 rounded hover:opacity-90`}>
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default AuthSignUp; 