import React from "react";
import { useSpareParts } from "../hooks/useSpareParts";

const AlertsNotifications: React.FC = () => {
  const { parts, loading, error } = useSpareParts();

  const lowOrOutStockParts = parts.filter(
    (part) => part.quantity_in_stock <= part.minimum_stock_level
  );

  const totalValue = lowOrOutStockParts.reduce(
    (sum, part) => sum + part.unit_price * part.quantity_in_stock,
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
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Low Stock & Out of Stock Alerts
      </h2>
      {lowOrOutStockParts.length === 0 ? (
        <div className="text-green-600">
          No low stock or out of stock parts.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Part Name</th>
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Unit Price</th>
                <th className="px-4 py-2 text-right">In Stock</th>
                <th className="px-4 py-2 text-right">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {lowOrOutStockParts.map((part) => {
                const status =
                  part.quantity_in_stock <= 0 ? "Out of Stock" : "Low Stock";
                return (
                  <tr
                    key={part.id}
                    className={
                      status === "Out of Stock" ? "bg-red-50" : "bg-orange-50"
                    }
                  >
                    <td className="px-4 py-2">{part.name}</td>
                    <td className="px-4 py-2">{part.part_code}</td>
                    <td className="px-4 py-2 font-semibold text-red-600">
                      {status}
                    </td>
                    <td className="px-4 py-2 text-right text-green-700">
                      ฿
                      {part.unit_price.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {part.quantity_in_stock}
                    </td>
                    <td className="px-4 py-2 text-right text-blue-700 font-bold">
                      ฿
                      {(
                        part.unit_price * part.quantity_in_stock
                      ).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="px-4 py-2 text-right font-bold">
                  Total Value:
                </td>
                <td className="px-4 py-2 text-right font-bold text-blue-900">
                  ฿
                  {totalValue.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default AlertsNotifications;
