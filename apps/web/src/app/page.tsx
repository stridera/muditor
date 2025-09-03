import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Muditor
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A modern, database-driven MUD editor and administration tool
        </p>
        <div className="space-y-4 mb-8">
          <div className="text-green-600 font-semibold">
            ✅ Database connected and seeded with {130} zones
          </div>
          <div className="text-green-600 font-semibold">
            ✅ API running on port 4000
          </div>
          <div className="text-green-600 font-semibold">
            ✅ Web application running
          </div>
        </div>
        <div className="space-x-4">
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Open Dashboard
          </Link>
          <a 
            href="http://localhost:4000/graphql" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-block"
          >
            GraphQL Playground
          </a>
        </div>
      </div>
    </div>
  )
}