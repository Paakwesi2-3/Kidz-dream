import { useEffect, useMemo, useState } from 'react'
import DailySalesHistory from './components/DailySalesHistory'
import DailySummary from './components/DailySummary'
import Inventory from './components/Inventory'
import MonthlyProfitLoss from './components/MonthlyProfitLoss'
import SaleForm from './components/SaleForm'
import { priceCatalog } from './data/priceCatalog'
import { fetchSalesFromSupabase, insertSaleToSupabase } from './lib/salesService'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'

const SALES_KEY = 'kidz-dream-sales'
const PENDING_SALES_KEY = 'kidz-dream-pending-sales'

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
  const [syncStatus, setSyncStatus] = useState(
    isSupabaseConfigured ? 'Syncing with Supabase...' : 'Offline mode (local data only)',
  )

  useEffect(() => {
    const savedSales = localStorage.getItem(SALES_KEY)
    if (savedSales) {
      setSales(JSON.parse(savedSales))
    }

    const savedPendingSales = localStorage.getItem(PENDING_SALES_KEY)
    if (savedPendingSales) {
      setPendingSales(JSON.parse(savedPendingSales))
    }

    if (!isSupabaseConfigured) {
      return
    }

    const loadSales = async () => {
      try {
        const remoteSales = await fetchSalesFromSupabase()
        setSales(remoteSales)
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
            setSales(latestSales)
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
    localStorage.setItem(SALES_KEY, JSON.stringify(sales))
  }, [sales])

  useEffect(() => {
    localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(pendingSales))
  }, [pendingSales])

  useEffect(() => {
    if (!isSupabaseConfigured || pendingSales.length === 0 || !navigator.onLine) {
      return
    }

    let cancelled = false

    const flushPendingSales = async () => {
      setSyncStatus(`Syncing ${pendingSales.length} offline sale(s)...`)

      for (const pendingSale of pendingSales) {
        try {
          await insertSaleToSupabase(pendingSale)
          if (cancelled) {
            return
          }
          setPendingSales((prevPending) => prevPending.filter((sale) => sale.id !== pendingSale.id))
        } catch {
          if (!cancelled) {
            setSyncStatus('Offline sales still pending sync')
          }
          return
        }
      }

      try {
        const latestSales = await fetchSalesFromSupabase()
        if (!cancelled) {
          setSales(latestSales)
          setSyncStatus('Live sync active (Supabase)')
        }
      } catch {
        if (!cancelled) {
          setSyncStatus('Synced pending sales, refresh failed temporarily')
        }
      }
    }

    flushPendingSales()

    return () => {
      cancelled = true
    }
  }, [pendingSales])

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
      setSales((prevSales) => [insertedSale, ...prevSales])
      setSyncStatus('Live sync active (Supabase)')
    } catch {
      setSyncStatus('Saved offline, will sync when online')
      setPendingSales((prevPending) => [newSale, ...prevPending])
      setSales((prevSales) => [newSale, ...prevSales])
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
          <p className="mt-2 text-xs text-gray-500">{syncStatus}</p>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SaleForm catalog={priceCatalog} onAddSale={handleAddSale} />
          <Inventory catalog={priceCatalog} />
        </section>

        <MonthlyProfitLoss sales={sales} />

        <DailySummary sales={dailySales} />

        <DailySalesHistory dailyTotals={dailyTotals} />
      </div>
    </main>
  )
}

export default App
