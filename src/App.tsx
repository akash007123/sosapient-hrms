import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import PageLoader from './components/Layout/PageLoader';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Blog from './pages/Blog';
import BlogPost from './pages/Blogs/BlogPost';
import BlogPost1 from './pages/Blogs/BlogPost1';
import BlogPost2 from './pages/Blogs/BlogPost2';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import CareerTable from './components/CareerTable';
import ContactTable from './components/ContactTable';
import SubscriberTable from './components/SubscriberTable';
import Portfolio from './components/Portfolio/Portfolio';
import HRMSLayout from './HRMS';
import AuthLogin from './HRMS/Authentication/AuthLogin';
import AuthSignUp from './HRMS/Authentication/AuthSignUp';


function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="font-inter">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="services" element={<Services />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="blog/:id" element={<BlogPost />} />
                  <Route path="Mobile Apps/:id" element={<BlogPost1 />} />
                  <Route path="Modern Web Applications/:id" element={<BlogPost2 />} />
                  <Route path="careers" element={<Careers />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="portfolio" element={<Portfolio />} />
                </Route>
                <Route path="contact-table" element={<ContactTable />} />
                <Route path="career-table" element={<CareerTable />} />
                <Route path="subscriber-table" element={<SubscriberTable />} />

                
                {/* Authentication routes */}
                <Route path="login" element={<AuthLogin />} />
                <Route path="signup" element={<AuthSignUp />} />

                {/* Protected HRMS routes */}
                <Route path="hrms/*" element={
                  <ProtectedRoute>
                    <HRMSLayout />
                  </ProtectedRoute>
                } />
              </Routes>
            </AnimatePresence>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;