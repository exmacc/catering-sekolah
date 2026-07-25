import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MenusScreen from './src/screens/MenusScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import { View, ActivityIndicator, Text } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '📊', Menus: '📋', Orders: '📦', Payments: '💰', Reports: '📈',
  };
  return <Text style={{ fontSize: 20 }}>{icons[label] || '📄'}</Text>;
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e5e7eb', paddingBottom: 4, height: 56 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        headerStyle: { backgroundColor: '#059669' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerTitle: 'Dashboard' }} />
      <Tab.Screen name="Menus" component={MenusScreen} options={{ headerTitle: 'Menu' }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ headerTitle: 'Pesanan' }} />
      <Tab.Screen name="Payments" component={PaymentsScreen} options={{ headerTitle: 'Pembayaran' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ headerTitle: 'Laporan' }} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Admin" component={AdminTabs} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}
