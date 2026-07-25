import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';
import { Payment } from '../types';

function formatRupiah(n: number) { return 'Rp' + n.toLocaleString('id-ID'); }

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayments(); }, []);

  async function fetchPayments() {
    const { data } = await supabase
      .from('payments')
      .select('*, customer:customers(*, user:users(*))')
      .order('created_at', { ascending: false });
    if (data) setPayments(data);
    setLoading(false);
  }

  async function confirmCash(paymentId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await fetch('https://your-app.vercel.app/api/payments/confirm-cash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentId, admin_id: session.user.id }),
    });
    fetchPayments();
  }

  const statusColors: Record<string, string> = {
    pending: '#f59e0b', paid: '#059669', failed: '#ef4444',
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#059669" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pembayaran</Text>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.customer?.user?.full_name}</Text>
              <View style={[styles.badge, { backgroundColor: statusColors[item.status] + '20' }]}>
                <Text style={{ color: statusColors[item.status], fontSize: 12, fontWeight: '500' }}>
                  {item.status === 'pending' ? 'Menunggu' : item.status === 'paid' ? 'Lunas' : 'Gagal'}
                </Text>
              </View>
            </View>
            <Text style={styles.amount}>{formatRupiah(item.amount)}</Text>
            <Text style={styles.method}>{item.payment_method === 'cash' ? 'Cash' : 'Transfer'} • {item.payment_period === 'daily' ? 'Harian' : item.payment_period === 'weekly' ? 'Mingguan' : 'Bulanan'}</Text>
            {item.status === 'pending' && item.payment_method === 'cash' && (
              <TouchableOpacity style={styles.confirmBtn} onPress={() => confirmCash(item.id)}>
                <Text style={styles.confirmText}>Konfirmasi</Text>
              </TouchableOpacity>
            )}
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
  name: { fontSize: 16, fontWeight: '600', color: '#111827' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  amount: { fontSize: 22, fontWeight: 'bold', color: '#059669', marginVertical: 4 },
  method: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  confirmBtn: { backgroundColor: '#059669', borderRadius: 8, padding: 10, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
