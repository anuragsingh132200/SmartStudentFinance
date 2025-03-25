import { useLocation, Link } from "wouter";

export function MobileNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center justify-center p-3 ${isActive("/") ? "text-primary" : "text-gray-500"}`}>
            <span className="material-icons" style={{ fontSize: "22px" }}>dashboard</span>
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        
        <Link href="/expenses">
          <a className={`flex flex-col items-center justify-center p-3 ${isActive("/expenses") ? "text-primary" : "text-gray-500"}`}>
            <span className="material-icons" style={{ fontSize: "22px" }}>payments</span>
            <span className="text-xs mt-1">Expenses</span>
          </a>
        </Link>
        
        <Link href="/budget">
          <a className={`flex flex-col items-center justify-center p-3 ${isActive("/budget") ? "text-primary" : "text-gray-500"}`}>
            <span className="material-icons" style={{ fontSize: "22px" }}>savings</span>
            <span className="text-xs mt-1">Budget</span>
          </a>
        </Link>
        
        <Link href="/community">
          <a className={`flex flex-col items-center justify-center p-3 ${isActive("/community") ? "text-primary" : "text-gray-500"}`}>
            <span className="material-icons" style={{ fontSize: "22px" }}>forum</span>
            <span className="text-xs mt-1">Community</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
