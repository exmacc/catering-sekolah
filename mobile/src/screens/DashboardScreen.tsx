import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Summary } from '../types';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

function formatRupiah(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID');
}

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  async function fetchSummary() {
    const res = await fetch('https://your-app.vercel.app/api/reports?type=summary');
    const result = await res.json();
    if (result.success) setSummary(result.data);
    setLoading(false);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#059669" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Halo, {user?.full_name}</Text>
        <TouchableOpacity onPress={logout}><Text style={styles.logout}>Keluar</Text></TouchableOpacity>
      </View>

      <Text style={styles.pageTitle}>Dashboard</Text>

      <View style={styles.grid}>
        <View style={[styles.card, { borderLeftColor: '#059669' }]}>
          <Text style={styles.cardLabel}>Pendapatan Hari Ini</Text>
          <Text style={styles.cardValueGreen}>{formatRupiah(summary?.today_revenue || 0)}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#3b82f6' }]}>
          <Text style={styles.cardLabel}>Pesanan Hari Ini</Text>
          <Text style={styles.cardValueBlue}>{summary?.today_orders || 0}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#059669' }]}>
          <Text style={styles.cardLabel}>Total Pendapatan</Text>
          <Text style={styles.cardValueGreen}>{formatRupiah(summary?.total_revenue || 0)}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#8b5cf6' }]}>
          <Text style={styles.cardLabel}>Total Pelanggan</Text>
          <Text style={styles.cardValuePurple}>{summary?.total_customers || 0}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Menu Cepat</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Menus')}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionLabel}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.actionIcon}>📦</Text>
          <Text style={styles.actionLabel}>Pesanan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Payments')}>
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionLabel}>Pembayaran</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Reports')}>
          <Text style={styles.actionIcon}>📈</Text>
          <Text style={styles.actionLabel}>Laporan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 18, fontWeight: '600', color: '#111827' },
  logout: { color: '#ef4444', fontSize: 14 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  grid: { gap: 12, marginBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  cardLabel: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  cardValueGreen: { fontSize: 22, fontWeight: 'bold', color: '#059669' },
  cardValueBlue: { fontSize: 22, fontWeight: 'bold', color: '#3b82f6' },
  cardValuePurple: { fontSize: 22, fontWeight: 'bold', color: '#8b5cf6' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  quickActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '500', color: '#374151' },
});
