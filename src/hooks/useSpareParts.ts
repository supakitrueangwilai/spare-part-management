import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { SparePart } from "../types";

export const useSpareParts = () => {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("spare_parts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setParts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching parts:", err);
    } finally {
      setLoading(false);
    }
  };

  const addPart = async (
    partData: Omit<SparePart, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { data, error } = await supabase
        .from("spare_parts")
        .insert([partData])
        .select()
        .single();

      if (error) throw error;
      await fetchParts(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "An error occurred",
      };
    }
  };

  const updatePart = async (id: string, updates: Partial<SparePart>) => {
    try {
      const { data, error } = await supabase
        .from("spare_parts")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      await fetchParts(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "An error occurred",
      };
    }
  };

  const deletePart = async (id: string) => {
    try {
      const { error } = await supabase
        .from("spare_parts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchParts(); // Refresh the list
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "An error occurred",
      };
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  return {
    parts,
    loading,
    error,
    addPart,
    updatePart,
    deletePart,
    refetch: fetchParts,
  };
};
