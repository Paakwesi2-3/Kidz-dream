import { useMemo, useState } from 'react'

const SaleForm = ({ catalog, onAddSale }) => {
  const [saleMode, setSaleMode] = useState('catalog')
  const [costume, setCostume] = useState('')
  const [age, setAge] = useState('')
  const [manualItemName, setManualItemName] = useState('')
  const [manualAge, setManualAge] = useState('')
  const [manualPrice, setManualPrice] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [buyerPhone, setBuyerPhone] = useState('')

  const costumeOptions = useMemo(
    () => Array.from(new Set(catalog.map((item) => item.costume))),
    [catalog],
  )

  const ageOptions = useMemo(
    () => catalog.filter((item) => item.costume === costume),
    [catalog, costume],
  )

  const selectedVariant = useMemo(
    () => ageOptions.find((item) => item.age === age),
    [ageOptions, age],
  )

  const handleSubmit = (e) => {
    e.preventDefault()

    if (saleMode === 'catalog') {
      if (!costume || !age) {
        alert('Please choose costume and age/size.')
        return
      }

      if (!selectedVariant || selectedVariant.price <= 0) {
        alert('Selected variant has no valid price.')
        return
      }

      onAddSale({
        itemName: costume,
        age,
        quantity: 1,
        pricePerItem: selectedVariant.price,
        total: selectedVariant.price,
        paymentMethod,
        buyerPhone: buyerPhone.trim(),
      })
    } else {
      const manualPriceValue = Number(manualPrice)

      if (!manualItemName.trim()) {
        alert('Please type what was sold.')
        return
      }

      if (!manualPriceValue || manualPriceValue <= 0) {
        alert('Please enter a valid price.')
        return
      }

      onAddSale({
        itemName: manualItemName.trim(),
        age: manualAge.trim(),
        quantity: 1,
        pricePerItem: manualPriceValue,
        total: manualPriceValue,
        paymentMethod,
        buyerPhone: buyerPhone.trim(),
      })
    }

    setSaleMode('catalog')
    setCostume('')
    setAge('')
    setManualItemName('')
    setManualAge('')
    setManualPrice('')
    setPaymentMethod('Cash')
    setBuyerPhone('')
  }

  const saleTotalPreview =
    saleMode === 'catalog'
      ? selectedVariant
        ? selectedVariant.price.toFixed(2)
        : '0.00'
      : Number(manualPrice) > 0
        ? Number(manualPrice).toFixed(2)
        : '0.00'

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
      <h2 className="mb-3 text-lg font-semibold text-pink-700">Add Sale</h2>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Sale Type</label>
          <select
            className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
            value={saleMode}
            onChange={(e) => setSaleMode(e.target.value)}
          >
            <option value="catalog">Catalog Sale</option>
            <option value="manual">Manual Sale (Not in stock list)</option>
          </select>
        </div>

        {saleMode === 'catalog' ? (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Costume</label>
              <select
                className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
                value={costume}
                onChange={(e) => {
                  setCostume(e.target.value)
                  setAge('')
                }}
              >
                <option value="">Select costume</option>
                {costumeOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Age / Size</label>
                <select
                  className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  disabled={!costume}
                >
                  <option value="">Select age/size</option>
                  {ageOptions.map((item) => (
                    <option key={`${item.costume}-${item.age}`} value={item.age}>
                      {item.age}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Price (GH₵)</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
                  value={selectedVariant ? selectedVariant.price : ''}
                  placeholder="0.00"
                  readOnly
                />
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">What was sold?</label>
              <input
                type="text"
                className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
                value={manualItemName}
                onChange={(e) => setManualItemName(e.target.value)}
                placeholder="e.g. Extra Hat"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Age / Size (optional)</label>
              <input
                type="text"
                className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
                value={manualAge}
                onChange={(e) => setManualAge(e.target.value)}
                placeholder="e.g. 7-8YRS"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Price (GH₵)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Payment Method</label>
          <select
            className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="Cash">Cash</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Buyer Phone Number</label>
          <input
            type="tel"
            className="w-full rounded-lg border border-pink-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            placeholder="e.g. 0241234567"
          />
        </div>

        <div className="rounded-lg bg-pink-50 px-3 py-2 text-sm text-pink-800">
          Sale Total: <span className="font-semibold">GH₵{saleTotalPreview}</span>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
        >
          Save Sale
        </button>
      </form>
    </div>
  )
}

export default SaleForm
