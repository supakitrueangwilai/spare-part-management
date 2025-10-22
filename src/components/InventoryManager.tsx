import React, { useState } from "react";
import { useSpareParts } from "../hooks/useSpareParts";
import { useUserRole } from "../hooks/useUserRole";
import * as XLSX from "xlsx";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpCircle,
  ArrowDownCircle,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import AddPartModal from "./AddPartModal";
import EditPartModal from "./EditPartModal";
import StockTransactionModal from "./StockTransactionModal";
import TransactionReport from "./TransactionReport";

const InventoryManager: React.FC = () => {
  const { parts, loading, error, deletePart } = useSpareParts();
  const { role, isAdmin } = useUserRole();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const exportToExcel = () => {
    // Prepare data for export
    const data = parts.map((part) => ({
      "Part Code": part.part_code,
      "Part Name": part.name,
      Description: part.description || "",
      "Machine Type": part.machine_type,
      Category: part.category,
      "Storage Location": part.storage_location,
      "Quantity in Stock": part.quantity_in_stock,
      "Minimum Stock Level": part.minimum_stock_level,
      "Unit Price": part.unit_price,
      "Total Value": part.unit_price * part.quantity_in_stock,
      "Service Life (Months)": part.service_life_months,
      "Stock Status":
        part.quantity_in_stock <= 0
          ? "Out of Stock"
          : part.quantity_in_stock <= part.minimum_stock_level
          ? "Low Stock"
          : "In Stock",
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-fit column widths
    const colWidths = Object.keys(data[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...data.map((row) => String(row[key as keyof typeof row]).length)
      ),
    }));
    ws["!cols"] = colWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Spare Parts");

    // Generate filename with current date
    const date = new Date().toISOString().split("T")[0];
    const fileName = `spare_parts_inventory_${date}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);
  };
  const [stockTransactionPart, setStockTransactionPart] = useState<{
    id: string;
    code: string;
    name: string;
    currentStock: number;
    type: "in" | "out";
  } | null>(null);

  const [showReport, setShowReport] = useState(false);

  // Filter and sort parts by storage_location (ascending, 1-01 on top)
  const filteredParts = parts
    .filter((part) => {
      const matchesSearch =
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.part_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.machine_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.storage_location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterCategory === "all" || part.category === filterCategory;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Custom sort: split by dash, compare numbers first, then string
      const parseLoc = (loc: string): [number, string] => {
        if (!loc) return [Infinity, ""];
        const [num, rest] = loc.split("-");
        return [parseInt(num, 10) || 0, rest || ""];
      };
      const [aNum, aRest] = parseLoc(a.storage_location);
      const [bNum, bRest] = parseLoc(b.storage_location);
      if (aNum !== bNum) return aNum - bNum;
      return aRest.localeCompare(bRest);
    });

  const handleDeletePart = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this part? This action cannot be undone."
      )
    ) {
      const { error } = await deletePart(id);
      if (error) {
        alert("Error deleting part: " + error);
      }
    }
  };

  const getStockStatus = (part: any) => {
    if (part.quantity_in_stock <= 0) return "out-of-stock";
    if (part.quantity_in_stock <= part.minimum_stock_level) return "low-stock";
    return "in-stock";
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "out-of-stock":
        return "text-red-600 bg-red-50 border-red-200";
      case "low-stock":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case "out-of-stock":
        return "Out of Stock";
      case "low-stock":
        return "Low Stock";
      default:
        return "In Stock";
    }
  };

  const categories = [...new Set(parts.map((part) => part.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your spare parts inventory
          </p>
        </div>
        <div className="flex space-x-4">
          {/* Stock Report - สำหรับทุกคน */}
          <button
            onClick={() => setShowReport(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
          >
            <FileText className="h-5 w-5 mr-2" />
            Stock Report
          </button>

          {/* Export to Excel - สำหรับทุกคน */}
          <button
            onClick={exportToExcel}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Export to Excel
          </button>

          {/* Add New Part - สำหรับ Admin เท่านั้น */}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Part
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by part code, name, or machine type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 h-5 w-5" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParts.map((part) => {
          const stockStatus = getStockStatus(part);
          return (
            <div
              key={part.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Part Image */}
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {part.image_url ? (
                  <img
                    src={part.image_url}
                    alt={part.name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <Package className="h-16 w-16 text-gray-400" />
                )}
              </div>

              <div className="p-6">
                {/* Stock Status Badge */}
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mb-3 ${getStockStatusColor(
                    stockStatus
                  )}`}
                >
                  {stockStatus === "low-stock" ||
                  stockStatus === "out-of-stock" ? (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  ) : null}
                  {getStockStatusText(stockStatus)}
                </div>

                {/* Part Info */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {part.name}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Code: {part.part_code}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Machine: {part.machine_type}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Location: {part.storage_location}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Description: {part.description}
                </p>

                {/* Stock Info */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">In Stock</p>
                    <p className="text-xl font-bold text-gray-900">
                      {part.quantity_in_stock}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Min Level</p>
                    <p className="text-lg font-semibold text-gray-700">
                      {part.minimum_stock_level}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Unit Price</p>
                    <p className="text-lg font-semibold text-green-600">
                      ฿
                      {part.unit_price.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-lg font-semibold text-green-700">
                    ฿
                    {(part.unit_price * part.quantity_in_stock).toLocaleString(
                      "th-TH",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </p>
                </div>

                {/* Stock Actions - แสดงเฉพาะ Admin */}
                {isAdmin && (
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() =>
                        setStockTransactionPart({
                          id: part.id,
                          code: part.part_code,
                          name: part.name,
                          currentStock: part.quantity_in_stock,
                          type: "in",
                        })
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <ArrowUpCircle className="h-4 w-4 mr-1" />
                      Stock In
                    </button>
                    <button
                      onClick={() =>
                        setStockTransactionPart({
                          id: part.id,
                          code: part.part_code,
                          name: part.name,
                          currentStock: part.quantity_in_stock,
                          type: "out",
                        })
                      }
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <ArrowDownCircle className="h-4 w-4 mr-1" />
                      Stock Out
                    </button>
                  </div>
                )}

                {/* Edit/Delete Actions - แสดงเฉพาะ Admin */}
                {isAdmin && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => setEditingPart(part.id)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePart(part.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredParts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No parts found
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterCategory !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by adding your first spare part."}
          </p>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddPartModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingPart && (
        <EditPartModal
          isOpen={!!editingPart}
          partId={editingPart}
          onClose={() => setEditingPart(null)}
        />
      )}

      {stockTransactionPart && (
        <StockTransactionModal
          isOpen={!!stockTransactionPart}
          partId={stockTransactionPart.id}
          partCode={stockTransactionPart.code}
          partName={stockTransactionPart.name}
          currentStock={stockTransactionPart.currentStock}
          transactionType={stockTransactionPart.type}
          onClose={() => setStockTransactionPart(null)}
          onTransactionComplete={() => {
            setStockTransactionPart(null);
            // Refresh the parts list to get updated stock levels
            window.location.reload();
          }}
        />
      )}

      {showReport && (
        <TransactionReport
          isOpen={showReport}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

export default InventoryManager;
