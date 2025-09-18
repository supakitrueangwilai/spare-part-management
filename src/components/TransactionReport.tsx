import React, { useState } from "react";
import { X, Printer, Download, FileText } from "lucide-react";
import { supabase } from "../lib/supabase";

interface TransactionReportProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Transaction {
  id: string;
  created_at: string;
  transaction_type: "in" | "out";
  quantity: number;
  machine_id: string;
  operator_name: string;
  notes: string;
  part: {
    part_code: string;
    name: string;
    unit_price: number;
  };
}

const TransactionReport: React.FC<TransactionReportProps> = ({
  isOpen,
  onClose,
}) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split("T")[0], // First day of current month
    end: new Date().toISOString().split("T")[0], // Today
  });
  const [transactionType, setTransactionType] = useState<"in" | "out">("out");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("stock_transactions")
        .select("*, part:spare_parts(part_code, name, unit_price)")
        .eq("transaction_type", transactionType)
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end + " 23:59:59")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTransactions(data as Transaction[]);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      alert("Error fetching transaction data");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return transactions.reduce(
      (sum, t) => sum + t.quantity * (t.part?.unit_price || 0),
      0
    );
  };

  const handlePrint = () => {
    const printContent = document.getElementById("report-content");
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore React functionality
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Part Code",
      "Part Name",
      "Quantity",
      "Machine ID",
      "Operator",
      "Unit Price",
      "Total Price",
      "Notes",
    ];
    const rows = transactions.map((t) => [
      new Date(t.created_at).toLocaleDateString("th-TH"),
      t.part?.part_code,
      t.part?.name,
      t.quantity,
      t.machine_id,
      t.operator_name,
      t.part?.unit_price.toFixed(2),
      (t.quantity * (t.part?.unit_price || 0)).toFixed(2),
      t.notes,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `stock_${transactionType}_report_${dateRange.start}_to_${dateRange.end}.csv`;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-6xl w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Stock {transactionType === "in" ? "Receipt" : "Withdrawal"}{" "}
                Report
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Controls */}
            <div className="mb-6 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={transactionType}
                  onChange={(e) =>
                    setTransactionType(e.target.value as "in" | "out")
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="in">Stock Receipt</option>
                  <option value="out">Stock Withdrawal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                onClick={fetchTransactions}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Generate Report</span>
              </button>

              {transactions.length > 0 && (
                <>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print</span>
                  </button>

                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </button>
                </>
              )}
            </div>

            {/* Report Content */}
            <div id="report-content" className="bg-white p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">
                  Stock {transactionType === "in" ? "Receipt" : "Withdrawal"}{" "}
                  Report
                </h2>
                <p className="text-gray-600">
                  Period:{" "}
                  {new Date(dateRange.start).toLocaleDateString("th-TH")} -{" "}
                  {new Date(dateRange.end).toLocaleDateString("th-TH")}
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : transactions.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                            Part Code
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                            Part Name
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                            Quantity
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                            Machine ID
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                            Operator
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">
                            Unit Price
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">
                            Total Price
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="px-4 py-3 text-sm">
                              {new Date(
                                transaction.created_at
                              ).toLocaleDateString("th-TH")}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {transaction.part?.part_code}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {transaction.part?.name}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {transaction.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {transaction.machine_id}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {transaction.operator_name}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              ฿
                              {transaction.part?.unit_price.toLocaleString(
                                "th-TH",
                                { minimumFractionDigits: 2 }
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              ฿
                              {(
                                transaction.quantity *
                                (transaction.part?.unit_price || 0)
                              ).toLocaleString("th-TH", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {transaction.notes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-3 text-right font-bold"
                          >
                            Total Value:
                          </td>
                          <td className="px-4 py-3 text-right font-bold">
                            ฿
                            {calculateTotal().toLocaleString("th-TH", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  No transactions found for the selected period.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionReport;
