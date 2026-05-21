import DashboardThemeProvider from './DashboardThemeProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardThemeProvider>
      {children}
    </DashboardThemeProvider>
  )
}
