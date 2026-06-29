import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";
import api from "../../src/services/api";

const VERDE = "#1e6e24";

type Food = {
  id?: number;
  name: string;
};

export default function ManutencaoFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  // Listar alimentos
  const carregarFoods = async () => {
    try {
      const { data } = await api.get("/foods");
      setFoods(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível carregar os alimentos.");
    }
  };

  useEffect(() => {
    carregarFoods();
  }, []);

  // Criar ou editar alimento
  const salvarFood = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "Digite o nome do alimento.");
      return;
    }

    try {
      const body = {
        name,
      };

      if (editId !== null) {
        await api.put(`/foods/${editId}`, body);
      } else {
        await api.post("/foods", body);
      }

      setName("");
      setEditId(null);

      carregarFoods();

      Alert.alert("Sucesso", "Alimento salvo com sucesso!");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar o alimento.");
    }
  };

  // Excluir alimento
  const deletarFood = async (id?: number) => {
    if (!id) return;

    try {
      await api.delete(`/foods/${id}`);

      carregarFoods();

      Alert.alert("Sucesso", "Alimento excluído com sucesso!");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível excluir o alimento.");
    }
  };

  // Editar alimento
  const editarFood = (food: Food) => {
    setName(food.name);
    setEditId(food.id ?? null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manutenção de Foods</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do alimento"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.button} onPress={salvarFood}>
        <Text style={styles.buttonText}>
          {editId ? "Atualizar" : "Adicionar"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={foods}
        keyExtractor={(item) => item.id?.toString() ?? item.name}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>{item.name}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => editarFood(item)}
              >
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() =>
                  Alert.alert(
                    "Confirmar",
                    "Deseja excluir este alimento?",
                    [
                      {
                        text: "Cancelar",
                        style: "cancel",
                      },
                      {
                        text: "Excluir",
                        onPress: () => deletarFood(item.id),
                      },
                    ]
                  )
                }
              >
                <Text style={styles.actionText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: VERDE,
    marginBottom: 15,
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  button: {
    backgroundColor: VERDE,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  text: {
    fontSize: 16,
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  editBtn: {
    backgroundColor: "#f0a500",
    padding: 8,
    borderRadius: 6,
  },

  deleteBtn: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 6,
  },

  actionText: {
    color: "#fff",
    fontWeight: "600",
  },
});