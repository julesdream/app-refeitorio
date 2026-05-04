import { View, Text, StyleSheet } from 'react-native';

export default function Cardapio() {
  const hoje = new Date();

  function getSemana() {
    const semana = [];

    for (let i = 0; i < 7; i++) {
      const dia = new Date();
      dia.setDate(hoje.getDate() - hoje.getDay() + i);
      semana.push(dia);
    }

    return semana;
  }

  const semana = getSemana();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cardápio da Semana</Text>

      {semana.map((dia, index) => {
        const ehHoje =
          dia.toDateString() === hoje.toDateString();

        return (
          <View
            key={index}
            style={[
              styles.card,
              ehHoje && styles.hoje
            ]}
          >
            <Text style={styles.dia}>
              {dia.toLocaleDateString()}
            </Text>

            <Text>Almoço: Arroz, Feijão, Carne</Text>
            <Text>Jantar: Sopa, Pão</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: { fontSize: 22, marginBottom: 10 },

  card: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
  },

  hoje: {
    backgroundColor: '#c8f7c5',
  },

  dia: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});