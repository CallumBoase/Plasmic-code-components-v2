import { usePlasmicQueryData, DataProvider } from "@plasmicapp/loader-nextjs";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import supabaseBrowserClient from "@/utils/supabaseBrowserClient";
import type { Database } from "@/types/supabase-auth";

interface AuthProviderActions {
  login(email: string, password: string): void;
  logout(): void;
  refetchSession(): void;
}

interface AuthProviderProps {
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

export const AuthProvider = forwardRef<AuthProviderActions, AuthProviderProps>(
  function AuthProvider(_props, ref) {
    const { data, isLoading, error } = usePlasmicQueryData(
      "/AuthContext",
      getSession
    );

    const [session, setSession] = useState<User | null>(null);

    useEffect(() => {
      if (data)
        setSession({
          email: data.session?.user.email || null,
          role: data.session?.user.role || null,
          user_metadata: data.session?.user.user_metadata || null,
        });
    }, [data]);

    const refetchSession = async () => {
      const data = await getSession();
      setSession({
        email: data.session?.user.email || null,
        role: data.session?.user.role || null,
        user_metadata: data.session?.user.user_metadata || null,
      });
    };

    const login = async (email: string, password: string) => {
      const { data, error } =
        await supabaseBrowserClient().auth.signInWithPassword({
          email,
          password,
        });
      if (error) throw error;
      setSession({
        email: data.session?.user.email || null,
        role: data.session?.user.role || null,
        user_metadata: data.session?.user.user_metadata || null,
      });
    };

    const logout = async () => {
      const { error } = await supabaseBrowserClient().auth.signOut();
      if (error) throw error;
      setSession(null);
    };

    useImperativeHandle(
      ref,
      () => ({
        login,
        logout,
        refetchSession,
      }),
      []
    );

    return (
      <>
        {isLoading && <div>Loading...</div>}
        {error && <div>{error.message}</div>}
        <DataProvider name="AuthContext" data={session}>
          {_props.children}
        </DataProvider>
      </>
    );
  }
);
