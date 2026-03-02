const DailySummary = ({ sales }) => {
  if (sales.length === 0) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
        <h2 className="mb-3 text-lg font-semibold text-pink-700">Daily Summary</h2>
        <p className="text-sm text-gray-500">No sales recorded today.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
      <h2 className="mb-3 text-lg font-semibold text-pink-700">Daily Summary</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-pink-100 text-gray-600">
              <th className="py-2 pr-3">Time</th>
              <th className="py-2 pr-3">Costume</th>
              <th className="py-2 pr-3">Age / Size</th>
              <th className="py-2 pr-3">Payment</th>
              <th className="py-2 pr-3">Buyer Phone</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-pink-50">
                <td className="py-2 pr-3 text-gray-600">{new Date(sale.createdAt).toLocaleTimeString()}</td>
                <td className="py-2 pr-3 font-medium text-gray-800">{sale.itemName}</td>
                <td className="py-2 pr-3">{sale.age || '—'}</td>
                <td className="py-2 pr-3">{sale.paymentMethod || 'Cash'}</td>
                <td className="py-2 pr-3">{sale.buyerPhone || '—'}</td>
                <td className="py-2 pr-3">GH₵{sale.pricePerItem.toFixed(2)}</td>
                <td className="py-2 font-semibold text-pink-700">GH₵{sale.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DailySummary
