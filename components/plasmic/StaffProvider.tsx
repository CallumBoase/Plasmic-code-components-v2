import { usePlasmicQueryData } from "@plasmicapp/loader-nextjs";
import { DataProvider } from "@plasmicapp/loader-nextjs";
import { createBrowserClient } from "@supabase/ssr";

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const { data } = usePlasmicQueryData('/staff', async () => {

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.from('staff').select('*');

    if(error) throw error;

    return data;

  });

  return (
    <>
      {data && (
        <DataProvider name="staff" data={data}>
          {children}
        </DataProvider>
      )}
    </>
  );
}