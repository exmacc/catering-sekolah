import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';
import { Order } from '../types';

function formatRupiah(n: number) { return 'Rp' + n.toLocaleString('id-ID'); }

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*, menu_item:menu_items(*)), customer:customers(*, user:users(*))')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  }

  const statusColors: Record<string, string> = {
    pending: '#f59e0b', confirmed: '#3b82f6', delivered: '#059669', cancelled: '#ef4444',
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#059669" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pesanan</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.customerName}>{item.customer?.user?.full_name}</Text>
              <View style={[styles.badge, { backgroundColor: statusColors[item.status] + '20' }]}>
                <Text style={{ color: statusColors[item.status], fontSize: 12, fontWeight: '500' }}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.date}>{item.delivery_date}</Text>
            {item.items?.map((i) => (
              <Text key={i.id} style={styles.item}>{i.menu_item?.name} x{i.quantity}</Text>
            ))}
            <Text style={styles.total}>{formatRupiah(item.total_amount)}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  customerName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  date: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  item: { fontSize: 13, color: '#374151', marginBottom: 2 },
  total: { fontSize: 16, fontWeight: 'bold', color: '#059669', marginTop: 8, textAlign: 'right' },
});
