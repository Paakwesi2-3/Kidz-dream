import { supabase } from './supabaseClient'

const mapRowToSale = (row) => ({
  id: row.id,
  itemName: row.item_name,
  age: row.age,
  quantity: row.quantity,
  pricePerItem: Number(row.price_per_item),
  total: Number(row.total),
  paymentMethod: row.payment_method,
  buyerPhone: row.buyer_phone,
  createdAt: row.created_at,
})

export const fetchSalesFromSupabase = async () => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(mapRowToSale)
}

export const insertSaleToSupabase = async (sale) => {
  const { data, error } = await supabase
    .from('sales')
    .insert({
      item_name: sale.itemName,
      age: sale.age,
      quantity: sale.quantity,
      price_per_item: sale.pricePerItem,
      total: sale.total,
      payment_method: sale.paymentMethod,
      buyer_phone: sale.buyerPhone,
      created_at: sale.createdAt,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return mapRowToSale(data)
}

export const updateSaleInSupabase = async (saleId, updates) => {
  const { data, error } = await supabase
    .from('sales')
    .update({
      item_name: updates.itemName,
      age: updates.age,
      quantity: updates.quantity,
      price_per_item: updates.pricePerItem,
      total: updates.total,
      payment_method: updates.paymentMethod,
      buyer_phone: updates.buyerPhone,
    })
    .eq('id', saleId)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return mapRowToSale(data)
}

export const deleteSaleFromSupabase = async (saleId) => {
  const { error } = await supabase.from('sales').delete().eq('id', saleId)

  if (error) {
    throw error
  }
}
