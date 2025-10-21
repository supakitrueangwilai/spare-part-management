import React from "react";
import { useSpareParts } from "../hooks/useSpareParts";
import { AlertTriangle, Package } from "lucide-react";

const AlertsNotifications: React.FC = () => {
  const { parts, loading, error } = useSpareParts();

  const lowStockParts = parts.filter(
    (part) =>
      part.quantity_in_stock > 0 &&
      part.quantity_in_stock <= part.minimum_stock_level
  );

  const outOfStockParts = parts.filter((part) => part.quantity_in_stock <= 0);

  const totalLowStockValue = lowStockParts.reduce(
    (sum, part) => sum + part.unit_price * part.quantity_in_stock,
    0
  );

  const totalOutOfStockValue = outOfStockParts.reduce(
    (sum, part) => sum + part.unit_price * part.minimum_stock_level, // ใช้ minimum_stock_level เพื่อคำนวณมูลค่าที่ต้องสั่งซื้อ
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <p className="text-gray-600">
          Please make sure you're connected to Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Alerts & Notifications
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor stock levels and view important alerts
        </p>
      </div>

      {/* Alert Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Out of Stock Section */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-red-600">
                Out of Stock Parts
              </h2>
            </div>
            <div className="text-sm font-medium">
              <div className="text-red-600">
                Required Value: ฿
                {totalOutOfStockValue.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div className="text-gray-500">
                Items: {outOfStockParts.length}
              </div>
            </div>
          </div>
          {outOfStockParts.length === 0 ? (
            <p className="text-gray-600">No out of stock parts</p>
          ) : (
            <div className="space-y-4">
              {outOfStockParts.map((part) => (
                <div
                  key={part.id}
                  className="bg-white border border-red-100 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {part.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Code: {part.part_code}
                      </p>
                      <p className="text-sm text-gray-600">
                        Location: {part.storage_location}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm font-medium text-red-600">
                          Current Stock: {part.quantity_in_stock}
                        </p>
                        <p className="text-sm font-medium text-gray-600">
                          Minimum Required: {part.minimum_stock_level}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          Unit Price: ฿
                          {part.unit_price.toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Section */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-orange-600">
                Low Stock Parts
              </h2>
            </div>
            <div className="text-sm font-medium">
              <div className="text-orange-600">
                Current Value: ฿
                {totalLowStockValue.toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div className="text-gray-500">Items: {lowStockParts.length}</div>
            </div>
          </div>
          {lowStockParts.length === 0 ? (
            <p className="text-gray-600">No low stock parts</p>
          ) : (
            <div className="space-y-4">
              {lowStockParts.map((part) => (
                <div
                  key={part.id}
                  className="bg-white border border-orange-100 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {part.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Code: {part.part_code}
                      </p>
                      <p className="text-sm text-gray-600">
                        Location: {part.storage_location}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm font-medium text-orange-600">
                          Current Stock: {part.quantity_in_stock}
                        </p>
                        <p className="text-sm font-medium text-gray-600">
                          Minimum Required: {part.minimum_stock_level}
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          Unit Price: ฿
                          {part.unit_price.toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsNotifications;
