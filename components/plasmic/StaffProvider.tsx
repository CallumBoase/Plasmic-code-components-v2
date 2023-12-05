import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { usePlasmicQueryData } from "@plasmicapp/loader-nextjs";
import { DataProvider } from "@plasmicapp/loader-nextjs";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from '@/types/supabase';

interface StaffActions {
  deleteStaff(id: number): void;
  addStaff(staff: {name: string}): void;
  editStaff(staff: {id: number, name: string}): void;
}

interface StaffProviderProps {
  children: React.ReactNode;
}



export const StaffProvider = forwardRef<StaffActions, StaffProviderProps>(function StaffProvider(_props, ref) {

  const { data: fetchedData, error, isLoading } = usePlasmicQueryData("/staff", async () => {
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.from("staff").select("*").order('name', {ascending: true});

    if (error) throw error;

    return data;
  });


  const [data, setData] = useState<Database['public']['Tables']['staff']['Row'][] | null>(null);

  useEffect(() => {
    if (fetchedData) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  useImperativeHandle(
    ref,
    () => {
      return {
        async deleteStaff(id: number) {
          const supabase = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );

          const { error } = await supabase.from("staff").delete().eq("id", id);

          if (error) throw error;

          const {data: refetched, error: refetchError} = await supabase.from("staff").select("*").order("name", {ascending: true});

          if(refetchError) throw refetchError;

          setData(refetched);
          //setData(currentData => currentData.filter(staff => staff.id !== id));
        },
        async addStaff(staff : {name: string}) {
          const supabase = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );

          const { error } = await supabase.from("staff").insert(staff);

          if (error) throw error;

          const {data: refetched, error: refetchError} = await supabase.from("staff").select("*").order("name", {ascending: true});

          if(refetchError) throw refetchError;

          setData(refetched);
          //setData(currentData => currentData.filter(staff => staff.id !== id));
        },
        async editStaff(staff : {id: number, name: string}) {
          const supabase = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );

          const { error } = await supabase.from("staff").update({name: staff.name}).eq("id", staff.id);

          if (error) throw error;

          const {data: refetched, error: refetchError} = await supabase.from("staff").select("*").order("name", {ascending: true});

          if(refetchError) throw refetchError;

          setData(refetched);
          //setData(currentData => currentData.filter(staff => staff.id !== id));
        }
      };
    },
    [setData]
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
});
