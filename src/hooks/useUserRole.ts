import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type UserRole = "admin" | "user";

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setRole("user");
          return;
        }

        // ตรวจสอบ role จากตาราง user_roles
        const { data: userRole, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error || !userRole) {
          setRole("user"); // default to user if no role found
        } else {
          setRole(userRole.role as UserRole);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        setRole("user");
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUserRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { role, loading, isAdmin: role === "admin" };
};
