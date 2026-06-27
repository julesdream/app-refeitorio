import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { Shadow } from "react-native-shadow-2";
import { useAuth } from "../../src/contexts/AuthContext";
import { useRouter } from "expo-router";
import api from "../../src/services/api";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";

// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────
const COLORS = {
  verde_dark: "#1e6e24",
  verde_mid: "#2e7d32",
  texto_forte: "#1a1a1a",
  texto_suave: "#8a9a8a",
  branco: "#fff",
  bg_light: "#fafafa",
  bg_page: "#f5f5f5",
  border: "#e0e0e0",
} as const;

const TIPO_REFEICAO = {
  almoco: "Almoço",
  jantar: "Jantar",
} as const;

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────
interface Usuario {
  role: "ALUNO" | "SERVIDOR" | "ADMIN";
  name?: string;
  email?: string;
}

interface ItemRefeicao {
  nome: string;
  data: string;
  tipo: string;
}

// ──────────────────────────────────────────────
// UTILITY FUNCTIONS
// ──────────────────────────────────────────────
function formatarDataBR(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

// ──────────────────────────────────────────────
// COMPONENTES
// ──────────────────────────────────────────────

interface HeaderProps {
  onVoltar: () => void;
}

function HeaderCadastro({ onVoltar }: HeaderProps) {
  return (
    <View style={s.headerWrap}>
      <Shadow
        distance={1}
        startColor="#22222228"
        offset={[1, 4]}
        style={{ borderRadius: 8 }}
        containerStyle={{ marginTop: 5 }}
      >
        <TouchableOpacity
          style={s.voltarBtn}
          onPress={onVoltar}
          activeOpacity={0.8}
        >
          <MaterialIcons name="arrow-back" size={20} color={COLORS.branco} />
          <Text style={s.voltarText}>Voltar</Text>
        </TouchableOpacity>
      </Shadow>
    </View>
  );
}

interface SeletorDataProps {
  date: Date;
  onDateChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
  showPicker: boolean;
  setShowPicker: (show: boolean) => void;
}

function SeletorData({
  date,
  onDateChange,
  showPicker,
  setShowPicker,
}: SeletorDataProps) {
  return (
    <>
      <Text style={s.label}>Data</Text>
      <TouchableOpacity
        style={s.input}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={{ color: COLORS.texto_forte }}>
          {formatarDataBR(date)}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </>
  );
}

interface SeletorRefeicaoProps {
  tipo: "Almoço" | "Jantar";
  onTipoChange: (tipo: "Almoço" | "Jantar") => void;
}

function SeletorRefeicao({ tipo, onTipoChange }: SeletorRefeicaoProps) {
  return (
    <>
      <Text style={s.label}>Tipo da Refeição</Text>
      <View style={s.pickerContainer}>
        <Picker
          selectedValue={tipo}
          onValueChange={onTipoChange}
          style={s.picker}
        >
          <Picker.Item label={TIPO_REFEICAO.almoco} value={TIPO_REFEICAO.almoco} />
          <Picker.Item label={TIPO_REFEICAO.jantar} value={TIPO_REFEICAO.jantar} />
        </Picker>
      </View>
    </>
  );
}

interface AdicionadorItemProps {
  item: string;
  onItemChange: (item: string) => void;
  onAdicionarItem: () => void;
}

function AdicionadorItem({
  item,
  onItemChange,
  onAdicionarItem,
}: AdicionadorItemProps) {
  return (
    <>
      <Text style={s.label}>Item do Cardápio</Text>
      <View style={s.row}>
        <TextInput
          style={[s.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Digite um item"
          placeholderTextColor={COLORS.texto_suave}
          value={item}
          onChangeText={onItemChange}
        />
        <TouchableOpacity
          style={s.addButton}
          onPress={onAdicionarItem}
          activeOpacity={0.8}
        >
          <Text style={s.addText}>+</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

interface ListaItensProps {
  itens: string[];
  onRemoverItem?: (index: number) => void;
}

function ListaItens({ itens, onRemoverItem }: ListaItensProps) {
  return (
    <>
      <Text style={[s.label, { marginTop: 20 }]}>Itens Adicionados</Text>
      <FlatList
        data={itens}
        keyExtractor={(_, index) => index.toString()}
        style={s.listArea}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <View style={s.itemContainer}>
            <Text style={s.listItem}>• {item}</Text>
            {onRemoverItem && (
              <TouchableOpacity onPress={() => onRemoverItem(index)}>
                <MaterialIcons name="close" size={18} color={COLORS.texto_suave} />
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={[s.listItem, { color: COLORS.texto_suave }]}>
            Nenhum item adicionado
          </Text>
        }
      />
    </>
  );
}

interface BotaoSalvarProps {
  onSalvar: () => void;
  loading?: boolean;
}

function BotaoSalvar({ onSalvar, loading = false }: BotaoSalvarProps) {
  return (
    <TouchableOpacity
      style={[s.saveButton, loading && s.saveButtonDisabled]}
      onPress={onSalvar}
      disabled={loading}
      activeOpacity={0.8}
    >
      <Text style={s.saveText}>
        {loading ? "Salvando..." : "Salvar Cardápio"}
      </Text>
    </TouchableOpacity>
  );
}

interface RodapeProps {}

function Rodape({}: RodapeProps) {
  return (
    <View style={s.footerBlock}>
      <Image
        source={require("../../assets/images/logo-ifrs.png")}
        style={s.logoFooter}
        resizeMode="contain"
      />
      <Text style={s.footerTexto}>
        Análise e Desenvolvimento de Sistemas{" "}
        <Text style={{ color: COLORS.verde_mid }}>2026</Text>
      </Text>
    </View>
  );
}

// ──────────────────────────────────────────────
// TELA PRINCIPAL
// ──────────────────────────────────────────────
export default function CadastroRefeicao() {
  const { user } = useAuth();
  const router = useRouter();

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [tipo, setTipo] = useState<"Almoço" | "Jantar">(TIPO_REFEICAO.almoco);
  const [item, setItem] = useState("");
  const [itens, setItens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Verificar acesso
  useEffect(() => {
    const usuarioValido = user && (user as Usuario).role === "SERVIDOR";

    if (!usuarioValido) {
      Alert.alert(
        "Acesso Negado",
        "Apenas servidores podem cadastrar refeições.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/menu"),
          },
        ]
      );
    }
  }, [user, router]);

  const handleDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowPicker(false);
      if (selectedDate) {
        setDate(selectedDate);
      }
    },
    []
  );

  const handleTipoChange = useCallback((novoTipo: "Almoço" | "Jantar") => {
    setTipo(novoTipo);
  }, []);

  const handleItemChange = useCallback((novoItem: string) => {
    setItem(novoItem);
  }, []);

  const handleShowPicker = useCallback((show: boolean) => {
    setShowPicker(show);
  }, []);

  const handleAdicionarItem = useCallback(() => {
    if (!item.trim()) {
      Alert.alert("Aviso", "Digite um item válido");
      return;
    }
    setItens((prev) => [...prev, item]);
    setItem("");
  }, [item]);

  const handleRemoverItem = useCallback((index: number) => {
    setItens((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSalvarRefeicao = useCallback(async () => {
    if (itens.length === 0) {
      Alert.alert("Erro", "Adicione pelo menos um item");
      return;
    }

    setLoading(true);

    try {
      const dataFormatada = formatarDataBR(date);

      for (const nome of itens) {
        await api.post("/foods", {
          name: nome,
          date: dataFormatada,
          type: tipo,
        });
      }

      Alert.alert("Sucesso", "Refeição cadastrada com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            setItens([]);
            setItem("");
            setDate(new Date());
          },
        },
      ]);
    } catch (error) {
      console.error("Erro ao salvar refeição:", error);
      Alert.alert("Erro", "Falha ao salvar. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  }, [itens, date, tipo]);

  const handleVoltar = useCallback(() => {
    if (itens.length > 0) {
      Alert.alert(
        "Descartar Alterações?",
        "Você tem itens não salvos. Deseja voltar mesmo assim?",
        [
          { text: "Cancelar", onPress: () => {} },
          {
            text: "Voltar",
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/menu");
              }
            },
          },
        ]
      );
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/menu");
      }
    }
  }, [router, itens.length]);

  // Bloquear acesso não autorizados
  if (!user || (user as Usuario).role !== "SERVIDOR") {
    return null;
  }

  return (
    <View style={s.container}>
      {/* Header com Botão de Voltar */}
      <HeaderCadastro onVoltar={handleVoltar} />

      {/* Título */}
      <Text style={s.title}>Cadastro de Refeição</Text>

      {/* Card com Formulário */}
      <Shadow
        distance={1}
        startColor="#00000015"
        offset={[6, 10]}
        style={{ width: "100%", borderRadius: 16, alignSelf: "center" }}
        containerStyle={{ width: "90%", alignSelf: "center", paddingHorizontal: 2, marginBottom: 20 }}
      >
        <View style={s.card}>
          <SeletorData
            date={date}
            onDateChange={handleDateChange}
            showPicker={showPicker}
            setShowPicker={handleShowPicker}
          />

          <SeletorRefeicao tipo={tipo} onTipoChange={handleTipoChange} />

          <AdicionadorItem
            item={item}
            onItemChange={handleItemChange}
            onAdicionarItem={handleAdicionarItem}
          />

          <ListaItens itens={itens} onRemoverItem={handleRemoverItem} />

          <BotaoSalvar onSalvar={handleSalvarRefeicao} loading={loading} />
        </View>
      </Shadow>

      {/* Rodapé */}
      <Rodape />
    </View>
  );
}

// ──────────────────────────────────────────────
// ESTILOS
// ──────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg_page,
    paddingTop: Platform.OS === "android" ? 40 : 50,
  },
  headerWrap: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  voltarBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.verde_mid,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    alignSelf: "flex-start",
  },
  voltarText: {
    color: COLORS.branco,
    fontFamily: "InterBold",
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "InterBlack",
    color: COLORS.verde_dark,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.branco,
    borderRadius: 16,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: "InterSemiBold",
    color: COLORS.texto_forte,
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.bg_light,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.texto_forte,
    marginBottom: 12,
    justifyContent: "center",
  },
  pickerContainer: {
    backgroundColor: COLORS.bg_light,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginBottom: 12,
    height: 50,
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    color: COLORS.texto_forte,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addButton: {
    backgroundColor: COLORS.verde_mid,
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addText: {
    color: COLORS.branco,
    fontSize: 24,
    fontWeight: "bold",
  },
  listArea: {
    maxHeight: 200,
    backgroundColor: COLORS.bg_light,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  listItem: {
    fontSize: 15,
    color: COLORS.texto_forte,
    flex: 1,
  },
  saveButton: {
    backgroundColor: COLORS.verde_dark,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: COLORS.branco,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "InterSemiBold",
  },
  footerBlock: {
    backgroundColor: COLORS.branco,
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: "auto",
  },
  logoFooter: {
    width: 240,
    height: 80,
    marginBottom: 2,
  },
  footerTexto: {
    color: "#666",
    fontSize: 12,
    fontFamily: "InterBold",
  },
});
