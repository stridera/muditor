import Link from 'next/link'

export default function DashboardPage() {
  const stats = [
    { name: 'Zones', value: 130, href: '/dashboard/zones' },
    { name: 'Rooms', value: '—', href: '/dashboard/rooms' },
    { name: 'Mobs', value: '—', href: '/dashboard/mobs' },
    { name: 'Objects', value: '—', href: '/dashboard/objects' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to Muditor - your MUD world editing interface
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/zones"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Browse Zones</h3>
            <p className="text-sm text-gray-600">View and edit zone configurations</p>
          </Link>
          <Link
            href="/dashboard/zones/editor"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Visual Editor</h3>
            <p className="text-sm text-gray-600">Edit zones with visual interface</p>
          </Link>
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-75">
            <h3 className="font-medium text-gray-500">Script Editor</h3>
            <p className="text-sm text-gray-400">Coming soon - Lua script editing</p>
          </div>
        </div>
      </div>
    </div>
  )
}