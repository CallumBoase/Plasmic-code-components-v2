import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { usePlasmicQueryData, DataProvider } from "@plasmicapp/loader-nextjs";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

interface StaffActions {
  deleteStaff(id: number): void;
  addStaff(staff: { name: string }): void;
  editStaff(staff: { id: number; name: string }): void;
}

interface StaffProviderProps {
  children: React.ReactNode;
}

const initSupabase = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

const fetchData = async () => {
  const supabase = initSupabase();
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
};

export const StaffProvider = forwardRef<StaffActions, StaffProviderProps>(
  function StaffProvider(_props, ref) {
    const {
      data: fetchedData,
      error,
      isLoading,
    } = usePlasmicQueryData("/staff", fetchData);
    const [data, setData] = useState<
      Database["public"]["Tables"]["staff"]["Row"][] | null
    >(null);

    useEffect(() => {
      if (fetchedData) {
        setData(fetchedData);
      }
    }, [fetchedData]);

    const refetchData = async () => {
      const newData = await fetchData();
      setData(newData);
    };

    useImperativeHandle(
      ref,
      () => ({
        deleteStaff: async (id) => {
          const supabase = initSupabase();
          const { error } = await supabase.from("staff").delete().eq("id", id);
          if (error) throw error;
          await refetchData();
        },
        addStaff: async (staff) => {
          const supabase = initSupabase();
          const { error } = await supabase.from("staff").insert(staff);
          if (error) throw error;
          await refetchData();
        },
        editStaff: async (staff) => {
          const supabase = initSupabase();
          const { error } = await supabase
            .from("staff")
            .update({ name: staff.name })
            .eq("id", staff.id);
          if (error) throw error;
          await refetchData();
        },
      }),
      []
    );

    return (
      <>
        {isLoading && <div>Loading...</div>}
        {error && <div>Error: {error.message}</div>}
        {data && (
          <DataProvider name="staff" data={data}>
            {_props.children}
          </DataProvider>
        )}
      </>
    );
  }
);
