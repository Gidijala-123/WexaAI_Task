import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:pl-64 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
