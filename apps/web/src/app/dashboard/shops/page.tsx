'use client'

import { useQuery, gql } from '@apollo/client'

const GET_SHOPS = gql`
  query GetShops {
    shops {
      id
      buyProfit
      sellProfit
      temper1
      flags
      keeperId
      zoneId
    }
    shopsCount
  }
`

export default function ShopsPage() {
  const { loading, error, data } = useQuery(GET_SHOPS)

  if (loading) return <div className="p-4">Loading shops...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error.message}</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shops</h1>
        <div className="text-sm text-gray-500">
          Total: {data?.shopsCount || 0} shops
        </div>
      </div>

      {data?.shops?.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No shops found</div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Shop
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.shops?.map((shop: any) => (
            <div key={shop.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-gray-900">Shop #{shop.id}</h3>
                    {shop.flags && shop.flags.length > 0 && (
                      <div className="flex gap-1">
                        {shop.flags.map((flag: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <span>Buy: {(shop.buyProfit * 100).toFixed(0)}%</span>
                    <span>Sell: {(shop.sellProfit * 100).toFixed(0)}%</span>
                    <span>Temper: {shop.temper1}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {shop.keeperId && <span>Keeper ID: {shop.keeperId}</span>}
                    <span>Zone {shop.zoneId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-800 px-3 py-1 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}