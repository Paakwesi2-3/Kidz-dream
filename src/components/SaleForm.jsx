import { useMemo, useState } from 'react'

const SaleForm = ({ catalog, onAddSale }) => {
  const [costume, setCostume] = useState('')
  const [age, setAge] = useState('')
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

    setCostume('')
    setAge('')
    setPaymentMethod('Cash')
    setBuyerPhone('')
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
      <h2 className="mb-3 text-lg font-semibold text-pink-700">Add Sale</h2>
      <form className="space-y-3" onSubmit={handleSubmit}>
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
          Sale Total: <span className="font-semibold">GH₵{selectedVariant ? selectedVariant.price.toFixed(2) : '0.00'}</span>
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
