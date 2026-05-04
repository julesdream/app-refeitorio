import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Menu() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Menu</Text>

      <Link href="/cardapio" style={styles.link}>
        Ver Cardápio
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  titulo: {
    fontSize: 24,
    marginBottom: 20
  },
  link: {
    color: 'blue'
  },
});