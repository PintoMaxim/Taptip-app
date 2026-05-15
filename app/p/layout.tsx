export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Force white background & original font for all /p routes — isolated from dark theme */}
      <style>{`body { background-color: #ffffff !important; }`}</style>
      <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', color: '#171717' }}>
        {children}
      </div>
    </>
  )
}
