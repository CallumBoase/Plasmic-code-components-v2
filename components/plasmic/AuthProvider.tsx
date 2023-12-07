import { usePlasmicQueryData, DataProvider } from "@plasmicapp/loader-nextjs";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import supabaseBrowserClient from "@/utils/supabaseBrowserClient";
import type { Database } from "@/types/supabase";

interface AuthProviderActions {
  login(email: string, password: string): void;
  logout(): void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children } : AuthProviderProps) => {

  const [user, setUser] = useState<Database["auth"]["Tables"]["users"]["Row"][] | null>(null);

  return (
    <DataProvider name="AuthContext" data={{
      name: 'Callum',
      email: 'callum.boase@gmail.com'
    }} >
      {children}
    </DataProvider>
  )
}