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
import { Picker } from "@react-native-picker/picker";

const VERDE = "#1e6e24";

type User = {
  id?: number;
  name: string;
  email: string;
  role: string;
};

export default function ManutencaoUsuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SERVIDOR");

  const [editId, setEditId] = useState<number | null>(null);

  const carregarUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error);
      Alert.alert(
        "Erro", 
        error.response?.data?.error || "Não foi possível carregar usuários."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsers();
  }, []);

  const salvarUser = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Por favor, insira um email válido.");
      return;
    }

    try {
      setLoading(true);
      const body = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
      };

      if (editId) {
        await api.patch(`/users/${editId}`, body);
      } else {
        await api.post("/users", body);
      }

      // Limpar formulário
      setName("");
      setEmail("");
      setPassword("");
      setRole("SERVIDOR");
      setEditId(null);

      await carregarUsers();

      Alert.alert("Sucesso", "Usuário salvo com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      Alert.alert(
        "Erro", 
        error.response?.data?.error || "Não foi possível salvar o usuário."
      );
    } finally {
      setLoading(false);
    }
  };

  const deletarUser = async (id?: number) => {
    if (!id) return;

    try {
      setLoading(true);
      await api.delete(`/users/${id}`);
      await carregarUsers();
      Alert.alert("Sucesso", "Usuário excluído com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);
      Alert.alert(
        "Erro", 
        error.response?.data?.error || "Não foi possível excluir o usuário."
      );
    } finally {
      setLoading(false);
    }
  };

  const editarUser = (user: User) => {
    setName(user.name);
    setEmail(user.email);
    setPassword(""); // Limpa a senha para forçar nova digitação
    setRole(user.role);
    setEditId(user.id ?? null);
  };

  const cancelarEdicao = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("SERVIDOR");
    setEditId(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Manutenção de Usuários </Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={name}
        onChangeText={setName}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={(value) => setRole(value)}
          style={styles.picker}
          enabled={!loading}
        >
          <Picker.Item label="Servidor" value="SERVIDOR" />
          <Picker.Item label="Aluno" value="ALUNO" />
          <Picker.Item label="Administrador" value="ADMIN" />
        </Picker>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.buttonSave]} 
          onPress={salvarUser}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {editId ? "Atualizar" : "Adicionar"}
          </Text>
        </TouchableOpacity>

        {editId && (
          <TouchableOpacity 
            style={[styles.button, styles.buttonCancel]} 
            onPress={cancelarEdicao}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}

      <FlatList
        data={users}
        keyExtractor={(item) => item.id?.toString() ?? item.email}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.textName}>{item.name}</Text>
              <Text style={styles.textEmail}>{item.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{item.role}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => editarUser(item)}
                disabled={loading}
              >
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() =>
                  Alert.alert(
                    "Confirmar",
                    `Deseja excluir o usuário "${item.name}"?`,
                    [
                      {
                        text: "Cancelar",
                        style: "cancel",
                      },
                      {
                        text: "Excluir",
                        onPress: () => deletarUser(item.id),
                        style: "destructive",
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}> Nenhum usuário cadastrado </Text>
          </View>
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

  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  picker: {
    width: "100%",
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

  buttonSave: {
    backgroundColor: VERDE,
  },

  buttonCancel: {
    backgroundColor: "#666",
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
    borderWidth: 1,
    borderColor: "#eee",
  },

  cardContent: {
    flex: 1,
  },

  textName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },

  textEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },

  roleBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },

  roleText: {
    fontSize: 12,
    color: VERDE,
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 10,
  },

  editBtn: {
    backgroundColor: "#f0a500",
    padding: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: "center",
  },

  deleteBtn: {
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: "center",
  },

  actionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  loadingContainer: {
    padding: 10,
    alignItems: "center",
  },

  loadingText: {
    color: "#666",
    fontSize: 14,
  },

  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },

  emptyText: {
    color: "#999",
    fontSize: 16,
  },
});