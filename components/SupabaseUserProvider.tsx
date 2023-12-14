import { DataProvider } from "@plasmicapp/loader-nextjs";
import { GlobalActionsProvider } from "@plasmicapp/host";
import { useState, useEffect, useCallback, useMemo } from "react";
import supabaseBrowserClient from "@/utils/supabaseBrowserClient";
import type { Json } from "@/types/supabase";
import getErrMsg from "@/utils/getErrMsg";

type User = {
  email: string | null;
  role: string | null;
  user_metadata: Json | null;
};

interface DataProviderData {
  user: User | null;
  simulateUserSettings: {
    simulateLoggedInUser: boolean;
    email: string | null;
    password: string | null;
  };
  error: string | null;
}

interface SupabaseUserComponentProps {
  children: React.ReactNode;
  simulateLoggedInUser: boolean;
  email: string | null;
  password: string | null;
}

export const SupabaseUser = (props: SupabaseUserComponentProps) => {
  const [session, setSession] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [simulateUserSettings, setSimulateUserSettings] = useState({
    simulateLoggedInUser: props.simulateLoggedInUser,
    email: props.email,
    password: props.password,
  });

  //Update simulateUserSettings when props change
  useEffect(() => {
    setSimulateUserSettings({
      simulateLoggedInUser: props.simulateLoggedInUser,
      email: props.email,
      password: props.password,
    });
  }, [props.simulateLoggedInUser, props.email, props.password]);

  const getSession = useCallback(async () => {
    const supabase = await supabaseBrowserClient(simulateUserSettings);

    if (!simulateUserSettings.simulateLoggedInUser) {
      //If we are NOT simulating logged in user, get session from localStorage / cookies
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    } else {
      //If we are simulating logged in user, sign in with email and password to get session instead
      //Reason: getSession() won't work because the Plasmic studio renders the app in an iframe
      const validFields =
        simulateUserSettings.email && simulateUserSettings.password;
      if (!validFields)
        throw new Error(
          "You must provide an email and password to simulate a logged in user (Project settings -> SupabaseUser)"
        );
      const { data, error } = await supabase.auth.signInWithPassword({
        email: simulateUserSettings.email as string,
        password: simulateUserSettings.password as string,
      });
      if (error) throw error;
      return data;
    }
  }, [simulateUserSettings]);

  const fetchSession = useCallback(async () => {
    try {
      const data = await getSession();
      setSession({
        email: data.session?.user.email || null,
        role: data.session?.user.role || null,
        user_metadata: data.session?.user.user_metadata || null,
      });
      setError(null);
    } catch (e) {
      setError(getErrMsg(e))
      return;
    }
  }, [getSession]);

  //Initially fetch the session
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const actions = useMemo(
    () => ({
      login: async (email: string, password: string) => {
        try {
          const supabase = await supabaseBrowserClient(simulateUserSettings);
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          fetchSession();
          setError(null);
        } catch (e) {
          setError(getErrMsg(e))
          return;
        }
      },
      logout: async () => {
        try {
          const supabase = await supabaseBrowserClient(simulateUserSettings);
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          fetchSession();
          setError(null);
        } catch (e) {
          setError(getErrMsg(e))
          return;
        }
      },
    }),
    [fetchSession, simulateUserSettings]
  );

  const dataProviderData: DataProviderData = {
    user: session,
    simulateUserSettings: {
      simulateLoggedInUser: props.simulateLoggedInUser,
      email: props.email,
      password: props.password,
    },
    error,
  };

  return (
    <GlobalActionsProvider
      contextName="SupabaseUserGlobalContext"
      actions={actions}
    >
      <DataProvider name="SupabaseUser" data={dataProviderData}>
        {props.children}
      </DataProvider>
    </GlobalActionsProvider>
  );
};
