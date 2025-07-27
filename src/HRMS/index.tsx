import React from 'react';
import Sidenav from './Sidenav';
import TopNav from './TopNav';
import HRMSRoutes from './hrmsroutes';

const HRMSLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Fixed Sidenav - Overlays on top */}
      <Sidenav />
      
      {/* Main Content Area - Full width */}
      <div className="flex-1 flex flex-col w-full">
        {/* Fixed TopNav */}
        <TopNav />
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 transition-all duration-300">
          <HRMSRoutes />
        </main>
      </div>
    </div>
  );
};

export default HRMSLayout;
