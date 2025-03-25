import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "./Sidebar";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={toggleMobileMenu} className="text-gray-500 focus:outline-none">
            <span className="material-icons">menu</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="material-icons text-primary">account_balance_wallet</span>
            <h1 className="text-lg font-semibold text-primary">Smart Spend</h1>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
            {user?.fullName.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6 md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </>
  );
}
