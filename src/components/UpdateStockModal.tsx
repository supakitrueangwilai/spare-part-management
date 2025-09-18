import React, { useState, useEffect } from 'react';
import { X } from "lucide-react";
import { useSpareParts } from "../hooks/useSpareParts";
import { SparePart } from "../types";

interface UpdateStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpdateStockModal: React.FC<UpdateStockModalProps> = ({ isOpen, onClose }) => {
  const { parts, updatePart } = useSpareParts();
  const [loading, setLoading] = useState(false);
  const [stockUpdates, setStockUpdates] = useState<{ [key: string]: number }>({});

  const handleQuantityChange = (partId: string, newQuantity: string) => {
    setStockUpdates(prev => ({
      ...prev,
      [partId]: parseInt(newQuantity) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatePromises = Object.entries(stockUpdates).map(([partId, quantity]) => {
        return updatePart(partId, { quantity_in_stock: quantity });
      });

      await Promise.all(updatePromises);
      onClose();
    } catch (error) {
      console.error('Error updating stock levels:', error);
      alert('Failed to update stock levels');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-2xl w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Update Stock Levels</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Part Code</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Current Stock</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">New Stock</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parts.map((part) => (
                      <tr key={part.id}>
                        <td className="px-3 py-2 text-sm text-gray-900">{part.part_code}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{part.name}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{part.quantity_in_stock}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                            defaultValue={part.quantity_in_stock}
                            onChange={(e) => handleQuantityChange(part.id, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Stock"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateStockModal;