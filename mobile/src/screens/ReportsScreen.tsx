import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

function formatRupiah(n: number) { return 'Rp' + n.toLocaleString('id-ID'); }

interface DailyReport {
  date: string;
  total_orders: number;
  total_revenue: number;
  cash_revenue: number;
  transfer_revenue: number;
}

export default function ReportsScreen() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  async function fetchReports() {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    const [dailyRes, summaryRes] = await Promise.all([
      fetch(`https://your-app.vercel.app/api/reports?type=daily&start_date=${start}&end_date=${end}`),
      fetch('https://your-app.vercel.app/api/reports?type=summary'),
    ]);
    const [dailyData, summaryData] = await Promise.all([dailyRes.json(), summaryRes.json()]);
    if (dailyData.success) setReports(dailyData.data);
    if (summaryData.success) setSummary(summaryData.data);
    setLoading(false);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#059669" /></View>;

  const totalRevenue = reports.reduce((s, r) => s + r.total_revenue, 0);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Laporan Keuangan</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.label}>Total Pendapatan</Text>
          <Text style={styles.green}>{formatRupiah(summary?.total_revenue || 0)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Total Pesanan</Text>
          <Text style={styles.blue}>{summary?.total_orders || 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Pendapatan Hari Ini</Text>
          <Text style={styles.orange}>{formatRupiah(summary?.today_revenue || 0)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Laporan 30 Hari Terakhir</Text>
      {reports.map((r) => (
        <View key={r.date} style={styles.row}>
          <Text style={styles.date}>{r.date}</Text>
          <View style={styles.rowRight}>
            <Text style={styles.orangeText}>{formatRupiah(r.cash_revenue)}</Text>
            <Text style={styles.blueText}>{formatRupiah(r.transfer_revenue)}</Text>
            <Text style={styles.greenText}>{formatRupiah(r.total_revenue)}</Text>
          </View>
        </View>
      ))}
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatRupiah(totalRevenue)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  grid: { gap: 12, marginBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  label: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  green: { fontSize: 22, fontWeight: 'bold', color: '#059669' },
  blue: { fontSize: 22, fontWeight: 'bold', color: '#3b82f6' },
  orange: { fontSize: 22, fontWeight: 'bold', color: '#f97316' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  row: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowRight: { flexDirection: 'row', gap: 12 },
  date: { fontSize: 13, color: '#374151' },
  orangeText: { fontSize: 12, color: '#f97316', minWidth: 70, textAlign: 'right' },
  blueText: { fontSize: 12, color: '#3b82f6', minWidth: 70, textAlign: 'right' },
  greenText: { fontSize: 12, color: '#059669', minWidth: 70, textAlign: 'right', fontWeight: '600' },
  totalRow: { backgroundColor: '#059669', marginTop: 8 },
  totalLabel: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  totalValue: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
});
