import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';
import { Menu } from '../types';

function formatRupiah(n: number) { return 'Rp' + n.toLocaleString('id-ID'); }

export default function MenusScreen({ navigation }: any) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMenus(); }, []);

  async function fetchMenus() {
    const { data } = await supabase.from('menus').select('*, items:menu_items(*)').order('available_date', { ascending: false });
    if (data) setMenus(data);
    setLoading(false);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#059669" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu Catering</Text>
      <FlatList
        data={menus}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.menuName}>{item.name}</Text>
              <View style={[styles.badge, { backgroundColor: item.status === 'active' ? '#d1fae5' : '#fef3c7' }]}>
                <Text style={{ color: item.status === 'active' ? '#059669' : '#d97706', fontSize: 12, fontWeight: '500' }}>
                  {item.status === 'active' ? 'Aktif' : 'Ditutup'}
                </Text>
              </View>
            </View>
            <Text style={styles.date}>{item.available_date}</Text>
            <View style={styles.items}>
              {item.items?.map((i) => (
                <View key={i.id} style={styles.itemRow}>
                  <Text style={styles.itemName}>{i.name}</Text>
                  <Text style={styles.itemPrice}>{formatRupiah(i.price)}</Text>
                </View>
              ))}
            </View>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  menuName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  date: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  items: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemName: { fontSize: 14, color: '#374151' },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#059669' },
});
