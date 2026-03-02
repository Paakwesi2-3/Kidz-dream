const DailySalesHistory = ({ dailyTotals }) => {
  if (dailyTotals.length === 0) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
        <h2 className="mb-3 text-lg font-semibold text-pink-700">Daily Sales History</h2>
        <p className="text-sm text-gray-500">No saved daily totals yet.</p>
      </div>
    )
  }

  const bestSalesDay = dailyTotals.reduce((bestDay, day) =>
    day.total > bestDay.total ? day : bestDay,
  )

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
      <h2 className="mb-3 text-lg font-semibold text-pink-700">Daily Sales History</h2>
      <div className="mb-3 rounded-lg bg-pink-100 px-3 py-2 text-pink-800">
        <p className="text-sm">Best Sales Day</p>
        <p className="text-base font-bold">
          {bestSalesDay.label} — GH₵{bestSalesDay.total.toFixed(2)}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-pink-100 text-gray-600">
              <th className="py-2 pr-3">Date</th>
              <th className="py-2 pr-3">Sales Count</th>
              <th className="py-2">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {dailyTotals.map((day) => (
              <tr key={day.dateKey} className="border-b border-pink-50">
                <td className="py-2 pr-3 font-medium text-gray-800">{day.label}</td>
                <td className="py-2 pr-3">{day.count}</td>
                <td className="py-2 font-semibold text-pink-700">GH₵{day.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DailySalesHistory