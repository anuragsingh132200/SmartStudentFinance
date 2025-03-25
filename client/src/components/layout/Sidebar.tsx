import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";

export function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <span className="material-icons text-primary text-3xl">account_balance_wallet</span>
          <h1 className="text-xl font-semibold text-primary">Smart Spend</h1>
        </div>
        <p className="text-xs text-gray-500 mt-1">International Student Finance</p>
      </div>
      
      <nav className="flex-1 px-4 pb-4">
        <div className="space-y-1">
          <Link href="/">
            <a className={`flex items-center px-4 py-3 text-sm ${isActive("/") ? "text-white bg-primary" : "text-gray-600 hover:bg-gray-100"} rounded-lg group`}>
              <span className="material-icons mr-3">dashboard</span>
              <span>Dashboard</span>
            </a>
          </Link>
          
          <Link href="/income">
            <a className={`flex items-center px-4 py-3 text-sm ${isActive("/income") ? "text-white bg-primary" : "text-gray-600 hover:bg-gray-100"} rounded-lg group`}>
              <span className="material-icons mr-3">account_balance</span>
              <span>Income</span>
            </a>
          </Link>
          
          <Link href="/expenses">
            <a className={`flex items-center px-4 py-3 text-sm ${isActive("/expenses") ? "text-white bg-primary" : "text-gray-600 hover:bg-gray-100"} rounded-lg group`}>
              <span className="material-icons mr-3">payments</span>
              <span>Expenses</span>
            </a>
          </Link>
          
          <Link href="/budget">
            <a className={`flex items-center px-4 py-3 text-sm ${isActive("/budget") ? "text-white bg-primary" : "text-gray-600 hover:bg-gray-100"} rounded-lg group`}>
              <span className="material-icons mr-3">savings</span>
              <span>Budget</span>
            </a>
          </Link>
          
          <Link href="/deals">
            <a className={`flex items-center px-4 py-3 text-sm ${isActive("/deals") ? "text-white bg-primary" : "text-gray-600 hover:bg-gray-100"} rounded-lg group`}>
              <span className="material-icons mr-3">local_offer</span>
              <span>Deals</span>
            </a>
          </Link>
          
          <Link href="/community">
            <a className={`flex items-center px-4 py-3 text-sm ${isActive("/community") ? "text-white bg-primary" : "text-gray-600 hover:bg-gray-100"} rounded-lg group`}>
              <span className="material-icons mr-3">forum</span>
              <span>Community</span>
            </a>
          </Link>
          
          <Link href="/resources">
            <a className={`flex items-center px-4 py-3 text-sm ${isActive("/resources") ? "text-white bg-primary" : "text-gray-600 hover:bg-gray-100"} rounded-lg group`}>
              <span className="material-icons mr-3">menu_book</span>
              <span>Resources</span>
            </a>
          </Link>
          
          {user?.isAdmin && (
            <Link href="/admin/dashboard">
              <a className={`flex items-center px-4 py-3 text-sm ${isActive("/admin/dashboard") ? "text-white bg-primary" : "text-gray-600 hover:bg-gray-100"} rounded-lg group`}>
                <span className="material-icons mr-3">admin_panel_settings</span>
                <span>Admin Panel</span>
              </a>
            </Link>
          )}
        </div>
      </nav>
      
      {user && (
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <span className="material-icons text-sm mr-2">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
