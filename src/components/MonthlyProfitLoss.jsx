import { useMemo } from 'react'

const isCurrentMonth = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)

  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

const MonthlyProfitLoss = ({ sales }) => {
  const monthLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [],
  )

  const monthlyRevenue = useMemo(
    () => sales.filter((sale) => isCurrentMonth(sale.createdAt)).reduce((sum, sale) => sum + sale.total, 0),
    [sales],
  )

  const monthlySalesCount = useMemo(
    () => sales.filter((sale) => isCurrentMonth(sale.createdAt)).length,
    [sales],
  )

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
      <h2 className="text-lg font-semibold text-pink-700">Monthly Sales Summary ({monthLabel})</h2>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-pink-50 p-3">
          <p className="text-sm text-gray-600">Total Sales Amount</p>
          <p className="text-xl font-bold text-pink-700">GH₵{monthlyRevenue.toFixed(2)}</p>
        </div>

        <div className="rounded-lg bg-pink-50 p-3">
          <p className="text-sm text-gray-600">Number of Sales</p>
          <p className="text-xl font-bold text-pink-700">{monthlySalesCount}</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-pink-100 px-3 py-2">
        <p className="text-sm text-gray-700">This month updates automatically from recorded sales.</p>
      </div>
    </div>
  )
}

export default MonthlyProfitLoss