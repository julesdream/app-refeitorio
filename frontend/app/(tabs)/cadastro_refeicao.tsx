import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";


//cores padrao
const VERDE_DARK = "#1e6e24";
const VERDE_MID = "#2e7d32";
const TEXTO_FORTE = "#1a1a1a";
const TEXTO_SUAVE = "#8a9a8a"; 

export default function CadastroRefeicao() {
  const [data, setData] = useState("");
  const [tipo, setTipo] = useState("");
  const [item, setItem] = useState("");
  const [itens, setItens] = useState<string[]>([]);

  const adicionarItem = () => {
    if (!item.trim()) return;

    setItens([...itens, item]);
    setItem("");
  };

  const salvarRefeicao = async () => {
  if (itens.length === 0) {
    Alert.alert("Erro", "Adicione pelo menos um item");
    return;
  }

  try {
    for (const nome of itens) {
      await fetch("http://localhost:3001/api/v1/foods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nome,
        }),
      });
    }

    Alert.alert("Sucesso", "Refeição cadastrada com sucesso!");
    setData("");
    setTipo("");
    setItens([]);
    setItem("");
  } catch (error) {
    console.log(error);
    Alert.alert("Erro", "Falha ao salvar refeição");
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Cadastro de Refeição </Text>

      <View style={styles.card}>
        <Text style={styles.label}> Data </Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 24/06/2026"
          placeholderTextColor={TEXTO_SUAVE}
          value={data}
          onChangeText={setData}
        />

        <Text style={styles.label}>Tipo da Refeição</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Almoço"
          placeholderTextColor={TEXTO_SUAVE}
          value={tipo}
          onChangeText={setTipo}
        />

        <Text style={styles.label}>Item do Cardápio</Text>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Digite um item"
            placeholderTextColor={TEXTO_SUAVE}
            value={item}
            onChangeText={setItem}
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={adicionarItem}
          >
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Itens Adicionados</Text>

        <FlatList
          data={itens}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Text style={styles.listItem}>• {item}</Text>
          )}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={salvarRefeicao}
        >
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: VERDE_DARK,
    marginBottom: 20,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXTO_FORTE,
    marginTop: 10,
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: TEXTO_FORTE,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  addButton: {
    backgroundColor: VERDE_MID,
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  addText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  listItem: {
    fontSize: 14,
    color: TEXTO_FORTE,
    paddingVertical: 3,
  },

  saveButton: {
    marginTop: 20,
    backgroundColor: VERDE_DARK,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});