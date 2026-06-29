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
  id: number;
  name: string;
};

export default function ManutencaoFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function carregarFoods() {
    try {
      setLoading(true);
      const { data } = await api.get<Food[]>("/foods");
      setFoods(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível carregar os alimentos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarFoods();
  }, []);

  async function salvarFood() {
    const nomeLimpo = name.trim();

    if (!nomeLimpo) {
      Alert.alert("Erro", "Digite o nome do alimento.");
      return;
    }

    try {
      setLoading(true);

      const body = {
        name: nomeLimpo,
      };

      if (editId !== null) {
        await api.patch(`/foods/${editId}`, body);
      } else {
        await api.post("/foods", body);
      }

      setName("");
      setEditId(null);

      await carregarFoods();

      Alert.alert("Sucesso", "Alimento salvo com sucesso!");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar o alimento.");
    } finally {
      setLoading(false);
    }
  }

  function editarFood(food: Food) {
    setName(food.name);
    setEditId(food.id);
  }

  function cancelarEdicao() {
    setName("");
    setEditId(null);
  }

  async function deletarFood(id: number) {
    try {
      setLoading(true);

      await api.delete(`/foods/${id}`);

      await carregarFoods();

      Alert.alert("Sucesso", "Alimento excluído com sucesso!");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível excluir o alimento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manutenção de Alimentos</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do alimento"
        value={name}
        onChangeText={setName}
        editable={!loading}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={salvarFood}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {editId !== null ? "Atualizar" : "Adicionar"}
          </Text>
        </TouchableOpacity>

        {editId !== null && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={cancelarEdicao}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && <Text style={styles.loading}>Carregando...</Text>}

      <FlatList
        data={foods}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>{item.name}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => editarFood(item)}
                disabled={loading}
              >
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() =>
                  Alert.alert(
                    "Confirmar",
                    `Deseja excluir "${item.name}"?`,
                    [
                      {
                        text: "Cancelar",
                        style: "cancel",
                      },
                      {
                        text: "Excluir",
                        style: "destructive",
                        onPress: () => deletarFood(item.id),
                      },
                    ]
                  )
                }
                disabled={loading}
              >
                <Text style={styles.actionText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum alimento cadastrado.</Text>
        }
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
    borderWidth: 1,
    borderColor: "#ddd",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },

  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  saveButton: {
    backgroundColor: VERDE,
  },

  cancelButton: {
    backgroundColor: "#666",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  loading: {
    textAlign: "center",
    marginBottom: 10,
    color: "#666",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },

  text: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 10,
  },

  editBtn: {
    backgroundColor: "#f0a500",
    padding: 8,
    borderRadius: 6,
  },

  deleteBtn: {
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 6,
  },

  actionText: {
    color: "#fff",
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
  },
});