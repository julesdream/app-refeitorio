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
import { Picker } from "@react-native-picker/picker";
import api from "../../src/services/api";

const VERDE = "#1e6e24";

type UserRole = "SERVIDOR" | "ALUNO";

type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

type UserPayload = {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
};

export default function ManutencaoUsuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("ALUNO");

  const [editId, setEditId] = useState<number | null>(null);

  async function carregarUsers() {
    try {
      setLoading(true);

      const { data } = await api.get<User[]>("/users");
      setUsers(data);
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível carregar usuários."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarUsers();
  }, []);

  function limparFormulario() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("ALUNO");
    setEditId(null);
  }

  function validarEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  async function salvarUser() {
    const nomeLimpo = name.trim();
    const emailLimpo = email.trim();
    const senhaLimpa = password.trim();

    if (!nomeLimpo || !emailLimpo) {
      Alert.alert("Erro", "Preencha nome e e-mail.");
      return;
    }

    if (!validarEmail(emailLimpo)) {
      Alert.alert("Erro", "Insira um e-mail válido.");
      return;
    }

    if (editId === null && !senhaLimpa) {
      Alert.alert("Erro", "Insira uma senha para cadastrar o usuário.");
      return;
    }

    try {
      setLoading(true);

      const body: UserPayload = {
        name: nomeLimpo,
        email: emailLimpo,
        role,
      };

      if (senhaLimpa) {
        body.password = senhaLimpa;
      }

      if (editId !== null) {
        await api.patch(`/users/${editId}`, body);
      } else {
        await api.post("/users", body);
      }

      limparFormulario();
      await carregarUsers();

      Alert.alert("Sucesso", "Usuário salvo com sucesso!");
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível salvar o usuário."
      );
    } finally {
      setLoading(false);
    }
  }

  function editarUser(user: User) {
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setEditId(user.id);
  }

  async function deletarUser(id: number) {
    try {
      setLoading(true);

      await api.delete(`/users/${id}`);

      await carregarUsers();

      Alert.alert("Sucesso", "Usuário excluído com sucesso!");
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível excluir o usuário."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manutenção de Usuários</Text>

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
        placeholder={
          editId !== null
            ? "Nova senha (deixe em branco para manter)"
            : "Senha"
        }
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={(value) => setRole(value as UserRole)}
          enabled={!loading}
        >
          <Picker.Item label="Aluno" value="ALUNO" />
          <Picker.Item label="Servidor" value="SERVIDOR" />
        </Picker>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={salvarUser}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {editId !== null ? "Atualizar" : "Adicionar"}
          </Text>
        </TouchableOpacity>

        {editId !== null && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={limparFormulario}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && <Text style={styles.loadingText}>Carregando...</Text>}

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.textName}>{item.name}</Text>
              <Text style={styles.textEmail}>{item.email}</Text>
              <Text style={styles.textRole}>{item.role}</Text>
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
                        style: "destructive",
                        onPress: () => deletarUser(item.id),
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
          <Text style={styles.emptyText}>Nenhum usuário cadastrado.</Text>
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
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
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

  loadingText: {
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

  textRole: {
    fontSize: 12,
    color: VERDE,
    fontWeight: "700",
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
  },

  deleteBtn: {
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 6,
  },

  actionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
  },
});