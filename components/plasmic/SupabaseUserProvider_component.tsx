import { DataProvider, usePlasmicQueryData } from "@plasmicapp/loader-nextjs";
import { useState, useEffect } from "react";
import supabaseBrowserClient from "@/utils/supabaseBrowserClient";
import type { Database } from "@/types/supabase-auth";

interface SupabaseUserData {
  email: string | null;
  role: string | null;
  user_metadata:
    | Database["auth"]["Tables"]["users"]["Row"]["raw_user_meta_data"]
    | null;
}

interface DataProviderData {
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  fetchSession(): Promise<void>;
  user: SupabaseUserData | null;
}

interface SupabaseUserComponentProps {
  children: React.ReactNode;
}

type User = {
  email: string | null;
  role: string | null;
  user_metadata:
    | Database["auth"]["Tables"]["users"]["Row"]["raw_user_meta_data"]
    | null;
};

const getSession = async () => {
  const supabase = supabaseBrowserClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data;
};

export const SupabaseUser = (props: SupabaseUserComponentProps) => {
  const [session, setSession] = useState<User | null>(null);

  const fetchSession = async () => {
    const data = await getSession();
    setSession({
      email: data.session?.user.email || null,
      role: data.session?.user.role || null,
      user_metadata: data.session?.user.user_metadata || null,
    });
  };

  //Initially fetch the session
  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabaseBrowserClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    fetchSession();
  };

  const logout = async () => {
    const { error } = await supabaseBrowserClient().auth.signOut();
    if (error) throw error;
    fetchSession();
  };

  const dataProviderData: DataProviderData = {
    login,
    logout,
    fetchSession,
    user: session,
  };

  return (
    <DataProvider name="SupabaseUser" data={dataProviderData}>
      {props.children}
    </DataProvider>
  );
};
