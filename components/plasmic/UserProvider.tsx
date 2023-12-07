import { DataProvider } from "@plasmicapp/loader-nextjs"

export const UserProvider = ({ children } : { children: React.ReactNode}) => {
  return (
    <DataProvider name="UserContext" data={{
      name: 'Callum',
      email: 'callum.boase@gmail.com'
    }} >
      {children}
    </DataProvider>
  )
}