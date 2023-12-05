import { useState, useEffect } from 'react';
import { usePlasmicQueryData } from "@plasmicapp/loader-nextjs";
import { DataProvider } from "@plasmicapp/loader-nextjs";
import { createBrowserClient } from "@supabase/ssr";

interface StaffActions {
  deleteStaff(id: number): void;
}

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const { data: fetchedData, error, isLoading } = usePlasmicQueryData("/staff", async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.from("staff").select("*");
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    if (error) throw error;

    return data;
  });

  const [data, setData] = useState([]);

  useEffect(() => {
    if (fetchedData) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  const deleteStaff = (id) => {
    setData(currentData => currentData.filter(staff => staff.id !== id));
  }

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && (
        <DataProvider name="staff" data={data}>
          {children}
        </DataProvider>
      )}
    </>
  );
}
