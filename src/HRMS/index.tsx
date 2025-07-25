import React from 'react';
import Sidenav from './Sidenav';
import HRMSRoutes from './hrmsroutes';

const HRMSLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidenav />
      <main className="flex-1 ml-16 md:ml-64 p-4 transition-all duration-300">
        <HRMSRoutes />
      </main>
    </div>
  );
};

export default HRMSLayout;
