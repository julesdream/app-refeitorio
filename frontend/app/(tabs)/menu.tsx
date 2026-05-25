import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';

export default function MenuScreen() {
  const router = useRouter();
  const { logout } = useAuth(); // Pegando a função de logout

  const lidarComLogout = () => {
    logout();
    router.replace('/'); // Redireciona para o login
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Menu Principal</Text>
      
      <TouchableOpacity 
        style={s.opcao} 
        onPress={() => router.push('/(tabs)/cardapio')}
      >
        <MaterialIcons name="restaurant-menu" size={30} color="#2e7d32" />
        <Text style={s.textoOpcao}>Ver Cardápio</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[s.opcao, s.logoutOpcao]} onPress={lidarComLogout}>
        <MaterialIcons name="logout" size={30} color="#d32f2f" />
        <Text style={[s.textoOpcao, { color: '#d32f2f' }]}>Sair do Aplicativo</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
  opcao: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutOpcao: { marginTop: 20, borderColor: '#d32f2f', borderWidth: 1 },
  textoOpcao: { fontSize: 18, marginLeft: 15, fontWeight: '600', color: '#333' }
});