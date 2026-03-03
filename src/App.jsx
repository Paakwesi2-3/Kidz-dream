import { useEffect, useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import DailySalesHistory from './components/DailySalesHistory'
import DailySummary from './components/DailySummary'
import Inventory from './components/Inventory'
import MonthlyProfitLoss from './components/MonthlyProfitLoss'
import SaleForm from './components/SaleForm'
import { priceCatalog } from './data/priceCatalog'
import {
  deleteSaleFromSupabase,
  fetchSalesFromSupabase,
  insertSaleToSupabase,
  updateSaleInSupabase,
} from './lib/salesService'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'

const SALES_KEY = 'kidz-dream-sales'
const PENDING_SALES_KEY = 'kidz-dream-pending-sales'
const PENDING_UPDATES_KEY = 'kidz-dream-pending-updates'
const PENDING_DELETES_KEY = 'kidz-dream-pending-deletes'

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

const saleFingerprint = (sale) =>
  [
    sale.itemName || '',
    sale.age || '',
    Number(sale.pricePerItem || 0).toFixed(2),
    Number(sale.total || 0).toFixed(2),
    sale.paymentMethod || '',
    sale.buyerPhone || '',
    sale.createdAt || '',
  ].join('|')

const dedupeSales = (salesList) => {
  const seen = new Set()

  return salesList.filter((sale) => {
    const key = saleFingerprint(sale)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

const isToday = (dateString) => {
  const today = new Date()
  const date = new Date(dateString)

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function App() {
  const [sales, setSales] = useState([])
  const [pendingSales, setPendingSales] = useState([])
  const [pendingUpdates, setPendingUpdates] = useState([])
  const [pendingDeletes, setPendingDeletes] = useState([])
  const [isSharing, setIsSharing] = useState(false)
  const salesRef = useRef([])
  const isFlushingPendingRef = useRef(false)
  const [syncStatus, setSyncStatus] = useState(
    isSupabaseConfigured ? 'Syncing with Supabase...' : 'Offline mode (local data only)',
  )

  useEffect(() => {
    const savedSales = localStorage.getItem(SALES_KEY)
    if (savedSales) {
      setSales(dedupeSales(JSON.parse(savedSales)))
    }

    const savedPendingSales = localStorage.getItem(PENDING_SALES_KEY)
    if (savedPendingSales) {
      setPendingSales(JSON.parse(savedPendingSales))
    }

    const savedPendingUpdates = localStorage.getItem(PENDING_UPDATES_KEY)
    if (savedPendingUpdates) {
      setPendingUpdates(JSON.parse(savedPendingUpdates))
    }

    const savedPendingDeletes = localStorage.getItem(PENDING_DELETES_KEY)
    if (savedPendingDeletes) {
      setPendingDeletes(JSON.parse(savedPendingDeletes))
    }

    if (!isSupabaseConfigured) {
      return
    }

    const loadSales = async () => {
      try {
        const remoteSales = await fetchSalesFromSupabase()
        setSales(dedupeSales(remoteSales))
        setSyncStatus('Live sync active (Supabase)')
      } catch {
        setSyncStatus('Supabase error: using local backup')
      }
    }

    loadSales()

    const salesChannel = supabase
      .channel('sales-live-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        async () => {
          try {
            const latestSales = await fetchSalesFromSupabase()
            setSales(dedupeSales(latestSales))
          } catch {
            setSyncStatus('Realtime update failed temporarily')
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(salesChannel)
    }
  }, [])

  useEffect(() => {
    salesRef.current = sales
    localStorage.setItem(SALES_KEY, JSON.stringify(sales))
  }, [sales])

  useEffect(() => {
    localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(pendingSales))
  }, [pendingSales])

  useEffect(() => {
    localStorage.setItem(PENDING_UPDATES_KEY, JSON.stringify(pendingUpdates))
  }, [pendingUpdates])

  useEffect(() => {
    localStorage.setItem(PENDING_DELETES_KEY, JSON.stringify(pendingDeletes))
  }, [pendingDeletes])

  useEffect(() => {
    if (!isSupabaseConfigured || pendingSales.length === 0 || !navigator.onLine) {
      return
    }

    if (isFlushingPendingRef.current) {
      return
    }

    let cancelled = false

    const flushPendingSales = async () => {
      isFlushingPendingRef.current = true
      setSyncStatus(`Syncing ${pendingSales.length} offline sale(s)...`)

      for (const pendingSale of pendingSales) {
        try {
          const alreadySyncedSale = salesRef.current.find(
            (sale) => isUuid(sale.id) && saleFingerprint(sale) === saleFingerprint(pendingSale),
          )

          if (alreadySyncedSale) {
            setSales((prevSales) =>
              prevSales.map((sale) => (sale.id === pendingSale.id ? alreadySyncedSale : sale)),
            )
            setPendingSales((prevPending) => prevPending.filter((sale) => sale.id !== pendingSale.id))
            continue
          }

          const insertedSale = await insertSaleToSupabase(pendingSale)
          if (cancelled) {
            isFlushingPendingRef.current = false
            return
          }

          setSales((prevSales) =>
            prevSales.map((sale) => (sale.id === pendingSale.id ? insertedSale : sale)),
          )

          setPendingSales((prevPending) => prevPending.filter((sale) => sale.id !== pendingSale.id))
        } catch {
          if (!cancelled) {
            setSyncStatus('Offline sales still pending sync')
          }
          isFlushingPendingRef.current = false
          return
        }
      }

      try {
        const latestSales = await fetchSalesFromSupabase()
        if (!cancelled) {
          setSales(dedupeSales(latestSales))
          setSyncStatus('Live sync active (Supabase)')
        }
      } catch {
        if (!cancelled) {
          setSyncStatus('Synced pending sales, refresh failed temporarily')
        }
      }

      isFlushingPendingRef.current = false
    }

    flushPendingSales()

    return () => {
      cancelled = true
    }
  }, [pendingSales])

  useEffect(() => {
    if (!isSupabaseConfigured || !navigator.onLine || pendingUpdates.length === 0) {
      return
    }

    const flushPendingUpdates = async () => {
      for (const pendingUpdate of pendingUpdates) {
        try {
          await updateSaleInSupabase(pendingUpdate.saleId, pendingUpdate.updates)
          setPendingUpdates((prev) => prev.filter((entry) => entry.saleId !== pendingUpdate.saleId))
        } catch {
          return
        }
      }
    }

    flushPendingUpdates()
  }, [pendingUpdates])

  useEffect(() => {
    if (!isSupabaseConfigured || !navigator.onLine || pendingDeletes.length === 0) {
      return
    }

    const flushPendingDeletes = async () => {
      for (const pendingDeleteId of pendingDeletes) {
        try {
          await deleteSaleFromSupabase(pendingDeleteId)
          setPendingDeletes((prev) => prev.filter((id) => id !== pendingDeleteId))
        } catch {
          return
        }
      }
    }

    flushPendingDeletes()
  }, [pendingDeletes])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }

    const handleOnline = () => {
      if (pendingSales.length > 0) {
        setSyncStatus(`Back online: ${pendingSales.length} sale(s) waiting to sync`)
      } else {
        setSyncStatus('Live sync active (Supabase)')
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [pendingSales.length])

  const dailySales = useMemo(() => sales.filter((sale) => isToday(sale.createdAt)), [sales])

  const dailyTotals = useMemo(() => {
    const groupedByDate = sales.reduce((accumulator, sale) => {
      const saleDate = new Date(sale.createdAt)
      const dateKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}-${String(
        saleDate.getDate(),
      ).padStart(2, '0')}`

      if (!accumulator[dateKey]) {
        accumulator[dateKey] = {
          dateKey,
          label: saleDate.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          total: 0,
          count: 0,
        }
      }

      accumulator[dateKey].total += sale.total
      accumulator[dateKey].count += 1

      return accumulator
    }, {})

    return Object.values(groupedByDate).sort((a, b) => b.dateKey.localeCompare(a.dateKey))
  }, [sales])

  const totalDailySales = useMemo(
    () => dailySales.reduce((sum, sale) => sum + sale.total, 0),
    [dailySales],
  )

  const todayDateLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    [],
  )

  const handleAddSale = async ({ itemName, age, quantity, pricePerItem, total, paymentMethod, buyerPhone }) => {
    const createdAt = new Date().toISOString()

    const newSale = {
      id: `${itemName}-${createdAt}`,
      itemName,
      age,
      quantity,
      pricePerItem,
      total,
      paymentMethod,
      buyerPhone,
      createdAt,
    }

    if (!isSupabaseConfigured) {
      setSales((prevSales) => [newSale, ...prevSales])
      return
    }

    try {
      const insertedSale = await insertSaleToSupabase(newSale)
      setSales((prevSales) => {
        if (prevSales.some((sale) => sale.id === insertedSale.id)) {
          return prevSales
        }
        return [insertedSale, ...prevSales]
      })
      setSyncStatus('Live sync active (Supabase)')
    } catch {
      setSyncStatus('Saved offline, will sync when online')
      setPendingSales((prevPending) => [newSale, ...prevPending])
      setSales((prevSales) => [newSale, ...prevSales])
    }
  }

  const handleUpdateSale = async (saleId, updates) => {
    const isPendingSale = pendingSales.some((sale) => sale.id === saleId)

    if (!isSupabaseConfigured || isPendingSale || !isUuid(saleId)) {
      setSales((prevSales) => prevSales.map((sale) => (sale.id === saleId ? { ...sale, ...updates } : sale)))

      if (isPendingSale) {
        setPendingSales((prevPending) =>
          prevPending.map((sale) => (sale.id === saleId ? { ...sale, ...updates } : sale)),
        )
      }

      return
    }

    try {
      const updatedSale = await updateSaleInSupabase(saleId, updates)
      setSales((prevSales) => prevSales.map((sale) => (sale.id === saleId ? updatedSale : sale)))
      setSyncStatus('Live sync active (Supabase)')
    } catch {
      setSales((prevSales) => prevSales.map((sale) => (sale.id === saleId ? { ...sale, ...updates } : sale)))
      setPendingUpdates((prev) => {
        const remaining = prev.filter((entry) => entry.saleId !== saleId)
        return [{ saleId, updates }, ...remaining]
      })
      setSyncStatus('Update saved offline, will sync when online')
    }
  }

  const handleDeleteSale = async (saleId) => {
    const shouldDelete = window.confirm('Delete this sale?')
    if (!shouldDelete) {
      return
    }

    const isPendingSale = pendingSales.some((sale) => sale.id === saleId)

    if (!isSupabaseConfigured || isPendingSale || !isUuid(saleId)) {
      if (isPendingSale) {
        setPendingSales((prevPending) => prevPending.filter((sale) => sale.id !== saleId))
      }
      setSales((prevSales) => prevSales.filter((sale) => sale.id !== saleId))
      return
    }

    try {
      await deleteSaleFromSupabase(saleId)
      setSales((prevSales) => prevSales.filter((sale) => sale.id !== saleId))
      setSyncStatus('Live sync active (Supabase)')
    } catch {
      setSales((prevSales) => prevSales.filter((sale) => sale.id !== saleId))
      setPendingDeletes((prev) => (prev.includes(saleId) ? prev : [saleId, ...prev]))
      setSyncStatus('Delete saved offline, will sync when online')
    }
  }

  const handleSaveTodaySalesImage = async () => {
    const cardElement = document.getElementById('today-sales-card')

    if (!cardElement) {
      alert('Today sales section not found.')
      return
    }

    setIsSharing(true)

    try {
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        backgroundColor: '#fdf2f8',
      })

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))

      if (!blob) {
        throw new Error('Could not create image')
      }

      const fileName = `today-sales-${new Date().toISOString().slice(0, 10)}.png`
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(downloadUrl)
    } catch {
      alert('Could not save image. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <main className="min-h-screen bg-pink-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
          <h1 className="text-2xl font-bold text-pink-700">Kidz Dream Shop Manager</h1>
          <p className="mt-1 text-sm text-gray-600">Kids clothing and costume sales tracker</p>
          <div className="mt-3 rounded-lg bg-pink-100 px-3 py-2 text-pink-800">
            <span className="text-sm">Total Daily Sales: </span>
            <span className="text-lg font-bold">GH₵{totalDailySales.toFixed(2)}</span>
          </div>
          <button
            type="button"
            onClick={handleSaveTodaySalesImage}
            disabled={isSharing}
            className="mt-3 rounded-lg bg-pink-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSharing ? 'Preparing image...' : 'Save Today Sales Image'}
          </button>
          <p className="mt-2 text-xs text-gray-500">{syncStatus}</p>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SaleForm catalog={priceCatalog} onAddSale={handleAddSale} />
          <Inventory catalog={priceCatalog} />
        </section>

        <MonthlyProfitLoss sales={sales} />

        <div id="today-sales-card" className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
          <div className="mb-3 rounded-lg bg-pink-50 px-3 py-2 text-pink-800">
            <p className="text-sm font-medium">Today Sales Snapshot</p>
            <p className="text-sm text-gray-600">Date: {todayDateLabel}</p>
            <p className="text-base font-bold">Total: GH₵{totalDailySales.toFixed(2)}</p>
          </div>
          <DailySummary sales={dailySales} onUpdateSale={handleUpdateSale} onDeleteSale={handleDeleteSale} />
        </div>

        <DailySalesHistory dailyTotals={dailyTotals} />
      </div>
    </main>
  )
}

export default App
