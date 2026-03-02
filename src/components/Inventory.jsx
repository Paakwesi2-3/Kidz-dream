const Inventory = ({ catalog }) => {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
      <h2 className="mb-3 text-lg font-semibold text-pink-700">Costume Price List</h2>

      {catalog.length === 0 ? (
        <p className="text-sm text-gray-500">No price data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-pink-100 text-gray-600">
                <th className="py-2 pr-3">Costume</th>
                <th className="py-2 pr-3">Age / Size</th>
                <th className="py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {catalog.map((item) => (
                <tr key={`${item.costume}-${item.age}`} className="border-b border-pink-50">
                  <td className="py-2 pr-3 font-medium text-gray-800">{item.costume}</td>
                  <td className="py-2 pr-3">{item.age}</td>
                  <td className="py-2 font-semibold text-pink-700">GH₵{item.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Inventory
