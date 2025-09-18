import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Image } from "lucide-react";
import { useSpareParts } from "../hooks/useSpareParts";
import { supabase } from "../lib/supabase";
import { uploadImage } from "../lib/uploadHelper";

interface EditPartModalProps {
  isOpen: boolean;
  partId: string;
  onClose: () => void;
}

const EditPartModal: React.FC<EditPartModalProps> = ({
  isOpen,
  partId,
  onClose,
}) => {
  const { updatePart } = useSpareParts();
  const [formData, setFormData] = useState({
    part_code: "",
    name: "",
    description: "",
    machine_type: "",
    category: "",
    quantity_in_stock: 0,
    minimum_stock_level: 0,
    storage_location: "",
    unit_price: 0,
    service_life_months: 12,
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingPart, setLoadingPart] = useState(true);

  useEffect(() => {
    if (partId && isOpen) {
      fetchPart();
    }
  }, [partId, isOpen]);

  const fetchPart = async () => {
    try {
      setLoadingPart(true);
      const { data, error } = await supabase
        .from("spare_parts")
        .select("*")
        .eq("id", partId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          part_code: data.part_code || "",
          name: data.name || "",
          description: data.description || "",
          machine_type: data.machine_type || "",
          category: data.category || "",
          quantity_in_stock: data.quantity_in_stock || 0,
          minimum_stock_level: data.minimum_stock_level || 0,
          storage_location: data.storage_location || "",
          unit_price: data.unit_price || 0,
          service_life_months: data.service_life_months || 12,
          image_url: data.image_url || "",
        });
      }
    } catch (error) {
      console.error("Error fetching part:", error);
      alert("Error loading part data");
    } finally {
      setLoadingPart(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await updatePart(partId, formData);

      if (error) {
        alert("Error updating part: " + error);
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Error updating part:", error);
      alert("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("price") ||
        name.includes("quantity") ||
        name.includes("months")
          ? parseFloat(value) || 0
          : value,
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
                Edit Spare Part
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {loadingPart ? (
            <div className="px-6 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading part data...</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto"
            >
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Part Code *
                  </label>
                  <input
                    type="text"
                    name="part_code"
                    value={formData.part_code}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Part Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Machine Type *
                    </label>
                    <input
                      type="text"
                      name="machine_type"
                      value={formData.machine_type}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Category</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Hydraulic">Hydraulic</option>
                      <option value="Pneumatic">Pneumatic</option>
                      <option value="Electronic">Electronic</option>
                      <option value="Consumable">Consumable</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity in Stock *
                    </label>
                    <input
                      type="number"
                      name="quantity_in_stock"
                      value={formData.quantity_in_stock}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Stock Level *
                    </label>
                    <input
                      type="number"
                      name="minimum_stock_level"
                      value={formData.minimum_stock_level}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Storage Location *
                  </label>
                  <input
                    type="text"
                    name="storage_location"
                    value={formData.storage_location}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Warehouse A-1, Shelf 3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price (THB) *
                    </label>
                    <input
                      type="number"
                      name="unit_price"
                      value={formData.unit_price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Life (Months)
                    </label>
                    <input
                      type="number"
                      name="service_life_months"
                      value={formData.service_life_months}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Part Image
                  </label>
                  <div className="mt-1 flex flex-col items-center space-y-2">
                    {formData.image_url ? (
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={formData.image_url}
                          alt="Part"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, image_url: "" }))
                          }
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                        className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Click to upload an image
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const imageUrl = await uploadImage(file);
                            setFormData((prev) => ({
                              ...prev,
                              image_url: imageUrl,
                            }));
                          } catch (error) {
                            console.error("Error uploading image:", error);
                            alert("Error uploading image. Please try again.");
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </form>
          )}

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
              onClick={handleSubmit}
              disabled={loading || loadingPart}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Part"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPartModal;
