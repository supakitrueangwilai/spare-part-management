import React from "react";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "../lib/supabase";
import {
  Package,
  Search,
  Bell,
  History,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const navigation = [
    { id: "dashboard", name: "Dashboard", icon: BarChart3 },
    { id: "alerts", name: "Alerts", icon: Bell },
    { id: "inventory", name: "Inventory", icon: Package },
    { id: "search", name: "Search Parts", icon: Search },
    { id: "history", name: "Maintenance Log", icon: History },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-slate-900">
          <h1 className="text-xl font-bold text-white">Parts Manager</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-300 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center px-6 py-3 text-left text-sm font-medium transition-colors
                ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white border-r-2 border-orange-400"
                    : "text-gray-300 hover:bg-slate-700 hover:text-white"
                }
              `}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </button>
          ))}
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 w-full p-4 bg-slate-900">
          <div className="text-xs text-gray-400 mb-2">
            Signed in as: {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-700 rounded"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Industrial Parts Management System
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
