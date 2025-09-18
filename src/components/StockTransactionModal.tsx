import React, { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabase";

interface StockTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  partId: string;
  partCode: string;
  partName: string;
  currentStock: number;
  transactionType: "in" | "out";
  onTransactionComplete: () => void;
}

const StockTransactionModal: React.FC<StockTransactionModalProps> = ({
  isOpen,
  onClose,
  partId,
  partCode,
  partName,
  currentStock,
  transactionType,
  onTransactionComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 1,
    machine_id: "",
    operator_name: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Start a Supabase transaction
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Calculate new stock quantity
      const newQuantity =
        transactionType === "in"
          ? currentStock + formData.quantity
          : currentStock - formData.quantity;

      // Validate stock level for outgoing transactions
      if (transactionType === "out" && newQuantity < 0) {
        throw new Error("Insufficient stock");
      }

      // Update stock quantity
      const { error: updateError } = await supabase
        .from("spare_parts")
        .update({ quantity_in_stock: newQuantity })
        .eq("id", partId);

      if (updateError) throw updateError;

      // Record the transaction
      const { error: transactionError } = await supabase
        .from("stock_transactions")
        .insert({
          part_id: partId,
          transaction_type: transactionType,
          quantity: formData.quantity,
          machine_id: formData.machine_id,
          operator_name: formData.operator_name,
          notes: formData.notes,
        });

      if (transactionError) throw transactionError;

      onTransactionComplete();
      onClose();
      setFormData({
        quantity: 1,
        machine_id: "",
        operator_name: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error processing transaction:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 0 : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {transactionType === "in" ? "Stock In" : "Stock Out"} -{" "}
                {partName}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Part Code: {partCode}</p>
                <p className="text-sm text-gray-600">
                  Current Stock: {currentStock}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine ID *
                </label>
                <input
                  type="text"
                  name="machine_id"
                  value={formData.machine_id}
                  onChange={handleChange}
                  required
                  placeholder="Enter machine ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operator Name *
                </label>
                <input
                  type="text"
                  name="operator_name"
                  value={formData.operator_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter operator name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter any additional notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  transactionType === "in"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading
                  ? "Processing..."
                  : transactionType === "in"
                  ? "Stock In"
                  : "Stock Out"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockTransactionModal;
