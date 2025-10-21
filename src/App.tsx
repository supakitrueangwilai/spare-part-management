import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import AuthForm from "./components/AuthForm";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import InventoryManager from "./components/InventoryManager";
import AlertsNotifications from "./components/AlertsNotifications";

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        return <InventoryManager />;
      case "search":
        return (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Advanced Search
            </h2>
            <p className="text-gray-600">
              Advanced search functionality will be available here.
            </p>
          </div>
        );
      case "alerts":
        return (
                case 'alerts':
        return <AlertsNotifications />;
        );
      case "history":
        return (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Maintenance History
            </h2>
            <p className="text-gray-600">
              Complete maintenance log and history tracking will be available
              here.
            </p>
          </div>
        );
      case "settings":
        return (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">
              System settings and configuration options will be available here.
            </p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveTab()}
    </Layout>
  );
}

export default App;
