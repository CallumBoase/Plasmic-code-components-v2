import { usePlasmicQueryData, DataProvider } from "@plasmicapp/loader-nextjs";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import supabaseBrowserClient from "@/utils/supabaseBrowserClient";
import type { Database } from "@/types/supabase-auth";

interface AuthProviderActions {
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  fetchSession(): Promise<void>;
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
  console.log('get session')
  const supabase = supabaseBrowserClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data;
};

export const AuthProvider = forwardRef<AuthProviderActions, AuthProviderProps>(
  function AuthProvider(_props, ref) {
    // const { data, isLoading, error } = usePlasmicQueryData(
    //   "/AuthContext",
    //   getSession
    // );

    const [session, setSession] = useState<User | null>(null);

    const fetchSession = async () => {
      console.log('fetch session')
      const data = await getSession();
      console.log(data.session)
      setSession({
        email: data.session?.user.email || null,
        role: data.session?.user.role || null,
        user_metadata: data.session?.user.user_metadata || null,
      });
    };

    useEffect(() => {
      console.log('use effect')
      fetchSession();
      // if (data)
      //   setSession({
      //     email: data.session?.user.email || null,
      //     role: data.session?.user.role || null,
      //     user_metadata: data.session?.user.user_metadata || null,
      //   });
      // console.log(data)
    }, []);

    

    const login = async (email: string, password: string) => {
      console.log('login')
      console.log(email, password)
      const { error } =
        await supabaseBrowserClient().auth.signInWithPassword({
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

    useImperativeHandle(
      ref,
      () => ({
        login,
        logout,
        fetchSession,
      }),
    );

    return (
      <>
        {/* {isLoading && <div>Loading...</div>}
        {error && <div>{error.message}</div>} */}
        <DataProvider name="AuthContext" data={{
          login,
          logout,
          fetchSession,
          user: session
        }}>
          {_props.children}
        </DataProvider>
      </>
    );
  }
);
