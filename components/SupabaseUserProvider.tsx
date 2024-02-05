import { useSafeRouter as useRouter } from "@/utils/useSafeRouter";
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
  redirectOnLoginSuccess?: string;
  simulateLoggedInUser: boolean;
  email: string | null;
  password: string | null;
}

export const SupabaseUser = ({children, redirectOnLoginSuccess, simulateLoggedInUser, email, password}: SupabaseUserComponentProps) => {

  //Nextjs router
  const router = useRouter();
  
  //Setup state
  const [session, setSession] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [simulateUserSettings, setSimulateUserSettings] = useState({
    simulateLoggedInUser: simulateLoggedInUser,
    email: email,
    password: password,
  });

  //Update simulateUserSettings when props change
  useEffect(() => {
    setSimulateUserSettings({
      simulateLoggedInUser: simulateLoggedInUser,
      email: email,
      password: password,
    });
  }, [simulateLoggedInUser, email, password]);

  //Callback to get the logged in user's session
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

  //Callback to get the session and set state variable session to the result
  const getSessionAndSaveToState = useCallback(async () => {
    try {
      const data = await getSession();
      setSession({
        email: data.session?.user.email || null,
        role: data.session?.user.role || null,
        user_metadata: data.session?.user.user_metadata || null
      });
      setError(null);
    } catch (e) {
      setError(getErrMsg(e))
      return;
    }
  }, [getSession]);

  //Initially fetch the session and save as state
  useEffect(() => {
    getSessionAndSaveToState();
  }, [getSessionAndSaveToState]);

  //Global actions that can be called from plasmic studio
  const actions = useMemo(
    () => ({
      //Login
      login: async (email: string, password: string) => {
        try {
          const supabase = await supabaseBrowserClient(simulateUserSettings);
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          // await getSessionAndSaveToState();
          //Seems to work where the above does not
          setSession({
            email: data?.user.email || null,
            role: data?.user.role || null,
            user_metadata: data?.user.user_metadata || null,
          })
          setError(null);
          if(redirectOnLoginSuccess && router) router.push(redirectOnLoginSuccess);
          return;
        } catch (e) {
          setError(getErrMsg(e))
          return;
        }
      },
      //Logout
      logout: async () => {
        try {
          const supabase = await supabaseBrowserClient(simulateUserSettings);
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          await getSessionAndSaveToState();
          setError(null);
          return;
        } catch (e) {
          setError(getErrMsg(e))
          return;
        }
      },
    }),
    [getSessionAndSaveToState, simulateUserSettings, redirectOnLoginSuccess, router]
  );
  
  //Setup the data that will be passed as global context to Plasmic studio
  const dataProviderData: DataProviderData = {
    user: session,
    simulateUserSettings: {
      simulateLoggedInUser: simulateLoggedInUser,
      email: email,
      password: password,
    },
    error,
  };

  //Render the actual components
  return (
    <GlobalActionsProvider
      contextName="SupabaseUserGlobalContext"
      actions={actions}
    >
      <DataProvider name="SupabaseUser" data={dataProviderData}>
        {children}
      </DataProvider>
    </GlobalActionsProvider>
  );
};
