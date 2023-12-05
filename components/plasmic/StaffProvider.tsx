import { useState, useEffect, forwardRef, useImperativeHandle, useOptimistic } from 'react';
import { usePlasmicQueryData } from "@plasmicapp/loader-nextjs";
import { DataProvider } from "@plasmicapp/loader-nextjs";
import { createBrowserClient } from "@supabase/ssr";

interface StaffActions {
  deleteStaff(id: number): void;
}

export const StaffProvider = forwardRef<StaffActions>(function StaffProvider(_props, ref) {

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

  useImperativeHandle(
    ref,
    () => {
      return {
        async deleteStaff(id: number) {
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );

          const { error } = await supabase.from("staff").delete().eq("id", id);

          if (error) throw error;

          const {data: refetched, error: refetchError} = await supabase.from("staff").select("*");

          if(refetchError) throw refetchError;

          setData(refetched);
          //setData(currentData => currentData.filter(staff => staff.id !== id));
        },
        async addStaff(staff : {name: string}) {
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );

          const { error } = await supabase.from("staff").insert(staff);

          if (error) throw error;

          const {data: refetched, error: refetchError} = await supabase.from("staff").select("*");

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

// export function StaffProviderBase({ children }: { children: React.ReactNode }) {
//   const { data: fetchedData, error, isLoading } = usePlasmicQueryData("/staff", async () => {
//     const supabase = createBrowserClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//     );

//     const { data, error } = await supabase.from("staff").select("*");
//     // await new Promise((resolve) => setTimeout(resolve, 3000));

//     if (error) throw error;

//     return data;
//   });

//   const [data, setData] = useState([]);

//   useEffect(() => {
//     if (fetchedData) {
//       setData(fetchedData);
//     }
//   }, [fetchedData]);

//   const deleteStaff = (id) => {
//     setData(currentData => currentData.filter(staff => staff.id !== id));
//   }

//   return (
//     <>
//       {isLoading && <div>Loading...</div>}
//       {error && <div>Error: {error.message}</div>}
//       {data && (
//         <DataProvider name="staff" data={data}>
//           {children}
//         </DataProvider>
//       )}
//     </>
//   );
// }
