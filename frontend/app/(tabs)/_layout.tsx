import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2e7d32' }}>
      <Tabs.Screen name="menu" options={{ title: 'Início', tabBarIcon: ({color}) => <MaterialIcons name="home" size={24} color={color} /> }} />
      <Tabs.Screen name="cardapio" options={{ title: 'Cardápio', tabBarIcon: ({color}) => <MaterialIcons name="restaurant" size={24} color={color} /> }} />
    </Tabs>
  );
}