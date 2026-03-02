import { useState } from 'react'

const DailySummary = ({ sales, onUpdateSale, onDeleteSale }) => {
  const [editingSaleId, setEditingSaleId] = useState(null)
  const [editForm, setEditForm] = useState({
    itemName: '',
    age: '',
    pricePerItem: '',
    paymentMethod: 'Cash',
    buyerPhone: '',
  })

  const startEdit = (sale) => {
    setEditingSaleId(sale.id)
    setEditForm({
      itemName: sale.itemName,
      age: sale.age || '',
      pricePerItem: String(sale.pricePerItem),
      paymentMethod: sale.paymentMethod || 'Cash',
      buyerPhone: sale.buyerPhone || '',
    })
  }

  const cancelEdit = () => {
    setEditingSaleId(null)
    setEditForm({
      itemName: '',
      age: '',
      pricePerItem: '',
      paymentMethod: 'Cash',
      buyerPhone: '',
    })
  }

  const saveEdit = async (sale) => {
    const parsedPrice = Number(editForm.pricePerItem)

    if (!editForm.itemName.trim()) {
      alert('Item name is required.')
      return
    }

    if (!parsedPrice || parsedPrice <= 0) {
      alert('Price must be greater than 0.')
      return
    }

    await onUpdateSale(sale.id, {
      itemName: editForm.itemName.trim(),
      age: editForm.age.trim(),
      quantity: sale.quantity || 1,
      pricePerItem: parsedPrice,
      total: parsedPrice,
      paymentMethod: editForm.paymentMethod,
      buyerPhone: editForm.buyerPhone.trim(),
    })

    cancelEdit()
  }

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
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => {
              const isEditing = editingSaleId === sale.id

              return (
                <tr key={sale.id} className="border-b border-pink-50">
                  <td className="py-2 pr-3 text-gray-600">{new Date(sale.createdAt).toLocaleTimeString()}</td>
                  <td className="py-2 pr-3 font-medium text-gray-800">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.itemName}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, itemName: e.target.value }))}
                        className="w-full rounded border border-pink-200 px-2 py-1 text-sm"
                      />
                    ) : (
                      sale.itemName
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.age}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, age: e.target.value }))}
                        className="w-full rounded border border-pink-200 px-2 py-1 text-sm"
                      />
                    ) : (
                      sale.age || '—'
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {isEditing ? (
                      <select
                        value={editForm.paymentMethod}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full rounded border border-pink-200 px-2 py-1 text-sm"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    ) : (
                      sale.paymentMethod || 'Cash'
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.buyerPhone}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, buyerPhone: e.target.value }))}
                        className="w-full rounded border border-pink-200 px-2 py-1 text-sm"
                      />
                    ) : (
                      sale.buyerPhone || '—'
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.pricePerItem}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, pricePerItem: e.target.value }))}
                        className="w-full rounded border border-pink-200 px-2 py-1 text-sm"
                      />
                    ) : (
                      `GH₵${sale.pricePerItem.toFixed(2)}`
                    )}
                  </td>
                  <td className="py-2 font-semibold text-pink-700">
                    {isEditing ? `GH₵${(Number(editForm.pricePerItem) || 0).toFixed(2)}` : `GH₵${sale.total.toFixed(2)}`}
                  </td>
                  <td className="py-2 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(sale)}
                          className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(sale)}
                          className="rounded bg-pink-100 px-2 py-1 text-xs font-medium text-pink-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSale(sale.id)}
                          className="rounded bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DailySummary
