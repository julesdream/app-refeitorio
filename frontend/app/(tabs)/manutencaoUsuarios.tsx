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

const VERDE = "#1e6e24";

type User = {
  id?: number;
  name: string;
};

export default function ManutencaoUsuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  // listar users
  const carregarUsers = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/v1/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível carregar usuários");
    }
  };

  useEffect(() => {
    carregarUsers();
  }, []);

  // criar/editar
  const salvarUser = async () => {
    if (!name.trim()) return;

    try {
      if (editId) {
        // UPDATE
        await fetch(`http://localhost:3001/api/v1/users/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        });
      } else {
        // CREATE
        await fetch("http://localhost:3001/api/v1/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        });
      }

      setName("");
      setEditId(null);
      carregarUsers();
    } catch (err) {
      Alert.alert("Erro", "Não foi possível salvar usuário");
    }
  };

  // deletar
  const deletarUser = async (id?: number) => {
    if (!id) return;

    try {
      await fetch(`http://localhost:3001/api/v1/users/${id}`, {
        method: "DELETE",
      });

      carregarUsers();
    } catch (err) {
      Alert.alert("Erro", "Não foi possível deletar usuário");
    }
  };

  // editar usuario
  const editarUser = (user: User) => {
    setName(user.name);
    setEditId(user.id || null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Manutenção de Usuários </Text>

      {/* INPUT */}
      <TextInput
        style={styles.input}
        placeholder="Nome do usuário"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.button} onPress={salvarUser}>
        <Text style={styles.buttonText}>
          {editId ? "Atualizar" : "Adicionar"}
        </Text>
      </TouchableOpacity>

      {/* lista */}
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>{item.name}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => editarUser(item)}
              >
                <Text style={{ color: "#fff" }}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() =>
                  Alert.alert("Confirmar", "Deseja deletar?", [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Sim", onPress: () => deletarUser(item.id) },
                  ])
                }
              >
                <Text style={{ color: "#fff" }}>Excluir</Text>
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
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  editBtn: {
    backgroundColor: "#f0a500",
    padding: 6,
    borderRadius: 6,
  },

  deleteBtn: {
    backgroundColor: "red",
    padding: 6,
    borderRadius: 6,
  },
});