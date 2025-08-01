// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// const AuthLogin: React.FC = () => {
//   const [role, setRole] = useState<'admin' | 'employee'>('admin');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       const success = await login(email, password);
//       if (success) {
//         navigate('/hrms/dashboard');
//       }
//     } catch (err) {
//       setError('Login failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
//       <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-4">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
//           <p className="text-gray-600">Sign in to access HRMS</p>
//         </div>

//         {/* <div className="flex justify-center mb-6">
//           <div className="bg-gray-100 rounded-lg p-1">
//             <button
//               type="button"
//               className={`px-6 py-2 rounded-md transition-all duration-200 ${
//                 role === 'admin'
//                   ? 'bg-blue-600 text-white shadow-lg'
//                   : 'text-gray-600 hover:text-gray-800'
//               }`}
//               onClick={() => setRole('admin')}
//             >
//               Admin
//             </button>
//             <button
//               type="button"
//               className={`px-6 py-2 rounded-md transition-all duration-200 ${
//                 role === 'employee'
//                   ? 'bg-green-600 text-white shadow-lg'
//                   : 'text-gray-600 hover:text-gray-800'
//               }`}
//               onClick={() => setRole('employee')}
//             >
//               Employee
//             </button>
//           </div>
//         </div> */}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Email Address
//             </label>
//             <input
//               type="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Password
//             </label>
//             <input
//               type="password"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
//               required
//             />
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//               {error}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={isLoading}
//             className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
//               isLoading
//                 ? 'bg-gray-400 cursor-not-allowed'
//                 : role === 'admin'
//                   ? 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
//                   : 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
//             }`}
//           >
//             {isLoading ? (
//               <div className="flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                 Signing in...
//               </div>
//             ) : (
//               'Sign In'
//             )}
//           </button>
//         </form>

//         {/* <div className="mt-6 text-center">
//           <p className="text-gray-600">
//             Don't have an account?{' '}
//             <button
//               onClick={() => navigate('/signup')}
//               className="text-purple-600 hover:text-purple-700 font-semibold"
//             >
//               Sign up here
//             </button>
//           </p>
//         </div> */}
//       </div>
//     </div>
//   );
// };

// export default AuthLogin;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AuthLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email, password: '***' });
      const success = await login(email, password);
      console.log('Login result:', success);
      if (success) {
        console.log('Login successful, navigating to dashboard');
        navigate("/hrms/dashboard");
      } else {
        console.log('Login failed');
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Navigation */}
      {/* <header className="absolute top-4 left-0 w-full flex justify-center z-10">
        <nav className="backdrop-blur-md bg-white/10 px-6 py-2 rounded-full shadow-md text-white text-sm font-medium tracking-wide">
          <ul className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
            <li>
              <a href="#" className="hover:text-white">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Portfolio
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                How we work
              </a>
            </li>
          </ul>
        </nav>
      </header> */}

      {/* Main content container */}
      <div className="flex flex-col-reverse lg:flex-row items-center justify-center min-h-screen relative z-10 gap-8 pt-20 lg:pt-0">
        {/* Left content */}
        <div className="text-white max-w-xl text-center lg:text-left px-4">
          {/* <div className="text-3xl sm:text-4xl font-bold mb-3">🌐 Sosapient</div> */}
          <img
            src="https://ik.imagekit.io/sentyaztie/Dlogo.png?updatedAt=1749928182723"
            alt=""
            className="w-100 h-100"
          />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-snug mb-4 text-gray-100">
            Building the{" "}
            <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Future
            </span>{" "}
            of Digital Innovation
          </h1>

          <p className="text-sm sm:text-base text-white/80">
          We create cutting-edge software solutions that transform businesses and deliver exceptional user experiences. From web applications to mobile apps, we bring your vision to life.
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-sm sm:max-w-md">
          <h2 className="text-white text-lg sm:text-xl font-semibold mb-6 text-center">
            WELCOME BACK EXCLUSIVE MEMBER
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-md bg-white/20 placeholder-white/70 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-md bg-white/20 placeholder-white/70 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 text-red-800 text-sm px-4 py-2 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-semibold py-3 rounded-md hover:bg-gray-900 transition duration-200"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;
