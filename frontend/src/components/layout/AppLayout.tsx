// src/components/layout/AppLayout.tsx - Layout principal mis à jour avec breadcrumbs
import React, { useState } from "react";
import Header from "../common/Header";
import Sidebar from "../common/Sidebar";
import Breadcrumbs from "../common/Breadcrumbs";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuToggle={toggleSidebar} sidebarOpen={sidebarOpen} />

        {/* Zone de contenu principal */}
        <main className="flex-1 overflow-y-auto">
          {/* Container avec breadcrumbs */}
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumbs */}
            <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 bg-white">
              <Breadcrumbs />
            </div>

            {/* Contenu de la page */}
            <div className="px-4 sm:px-6 lg:px-8 py-6">{children}</div>
          </div>
        </main>
      </div>

      {/* Overlay pour mobile quand sidebar ouverte */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout;
