import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Activity,
  Box,
  Wrench,
} from "lucide-react";
import UpdateStockModal from "./UpdateStockModal";
import AddPartModal from "./AddPartModal";
import AlertsNotifications from "./AlertsNotifications";

interface DashboardStats {
  totalParts: number;
  lowStockItems: number;
  totalValue: number;
  maintenanceToday: number;
  recentActivity: Array<{
    id: string;
    action: string;
    part_name: string;
    timestamp: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalParts: 0,
    lowStockItems: 0,
    totalValue: 0,
    maintenanceToday: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [isUpdateStockModalOpen, setIsUpdateStockModalOpen] = useState(false);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get total parts and low stock count
      const { data: partsData } = await supabase
        .from("spare_parts")
        .select("quantity_in_stock, minimum_stock_level, unit_price");

      const totalParts = partsData?.length || 0;
      const lowStockItems =
        partsData?.filter(
          (part) => part.quantity_in_stock <= part.minimum_stock_level
        ).length || 0;
      const totalValue =
        partsData?.reduce(
          (sum, part) => sum + part.quantity_in_stock * part.unit_price,
          0
        ) || 0;

      // Get today's maintenance count
      const today = new Date().toISOString().split("T")[0];
      const { data: maintenanceData } = await supabase
        .from("maintenance_records")
        .select("id")
        .gte("maintenance_date", today)
        .lt(
          "maintenance_date",
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        );

      const maintenanceToday = maintenanceData?.length || 0;

      // Get recent activity (mock data for now)
      const recentActivity = [
        {
          id: "1",
          action: "Stock Updated",
          part_name: "Hydraulic Filter HF-2024",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          action: "Maintenance Completed",
          part_name: "Bearing Set BS-4501",
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          action: "Low Stock Alert",
          part_name: "Conveyor Belt CB-300",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setStats({
        totalParts,
        lowStockItems,
        totalValue,
        maintenanceToday,
        recentActivity,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts & Notifications */}
      <AlertsNotifications />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Industrial Spare Parts Management Overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Parts</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalParts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Low Stock Alerts
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.lowStockItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Inventory Value
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Wrench className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Maintenance Today
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.maintenanceToday}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.part_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Box className="h-5 w-5 mr-2 text-blue-600" />
              Quick Actions
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <button
                onClick={() => setIsAddPartModalOpen(true)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="font-medium text-gray-900">Add New Part</div>
                <div className="text-sm text-gray-600">
                  Register new spare part to inventory
                </div>
              </button>
              <button
                onClick={() => setIsUpdateStockModalOpen(true)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="font-medium text-gray-900">
                  Update Stock Levels
                </div>
                <div className="text-sm text-gray-600">
                  Adjust inventory quantities
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                <div className="font-medium text-gray-900">
                  Schedule Maintenance
                </div>
                <div className="text-sm text-gray-600">
                  Plan upcoming part replacements
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Update Stock Modal */}
      {/* Modals */}
      <UpdateStockModal
        isOpen={isUpdateStockModalOpen}
        onClose={() => setIsUpdateStockModalOpen(false)}
      />
      <AddPartModal
        isOpen={isAddPartModalOpen}
        onClose={() => setIsAddPartModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
