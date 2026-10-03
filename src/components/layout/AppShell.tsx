import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';
import { ToastContainer } from '../common/ToastContainer';
import { X } from 'lucide-react';

interface AppShellProps {
  currentPath: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ currentPath, navigate, children }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-900 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          currentPath={currentPath}
          navigate={navigate}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-xs">
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-950">
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar
              currentPath={currentPath}
              navigate={(path) => {
                navigate(path);
                setIsMobileNavOpen(false);
              }}
              isCollapsed={false}
              setIsCollapsed={() => {}}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          currentPath={currentPath}
          onToggleMobileNav={() => setIsMobileNavOpen(true)}
          navigate={navigate}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col justify-between">
          <div className="max-w-7xl mx-auto space-y-6 w-full flex-1">
            {children}
            <Footer />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
