import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
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
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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
  cafe: "CAFE",
  almoco: "ALMOCO",
  jantar: "JANTAR",
} as const;

type TipoRefeicao = (typeof TIPO_REFEICAO)[keyof typeof TIPO_REFEICAO];

const ABAS: { tipo: TipoRefeicao; label: string }[] = [
  { tipo: TIPO_REFEICAO.cafe, label: "Café da Manhã" },
  { tipo: TIPO_REFEICAO.almoco, label: "Almoço" },
  { tipo: TIPO_REFEICAO.jantar, label: "Janta" },
];

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────
interface Usuario {
  role: "ALUNO" | "SERVIDOR" | "ADMIN";
  name?: string;
  email?: string;
}

interface Food {
  id: number;
  name: string;
}

type ItensPorRefeicao = Record<TipoRefeicao, number[]>;

const ITENS_INICIAIS: ItensPorRefeicao = {
  [TIPO_REFEICAO.cafe]: [],
  [TIPO_REFEICAO.almoco]: [],
  [TIPO_REFEICAO.jantar]: [],
};

// ──────────────────────────────────────────────
// UTILITY FUNCTIONS
// ──────────────────────────────────────────────
function formatarDataBR(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

// Formata para "YYYY-MM-DD" (formato esperado pela API), sem depender de
// toISOString (que usa UTC e pode "voltar" um dia dependendo do fuso).
function formatarDataISO(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
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

interface TabBarRefeicaoProps {
  abaAtiva: TipoRefeicao;
  onChangeAba: (tipo: TipoRefeicao) => void;
  contagemPorTipo: Record<TipoRefeicao, number>;
}

function TabBarRefeicao({
  abaAtiva,
  onChangeAba,
  contagemPorTipo,
}: TabBarRefeicaoProps) {
  return (
    <View style={s.tabBar}>
      {ABAS.map(({ tipo, label }) => {
        const ativa = tipo === abaAtiva;
        const qtd = contagemPorTipo[tipo];
        return (
          <TouchableOpacity
            key={tipo}
            style={[s.tabItem, ativa && s.tabItemAtiva]}
            onPress={() => onChangeAba(tipo)}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, ativa && s.tabTextAtiva]}>
              {label}
              {qtd > 0 ? ` (${qtd})` : ""}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

interface AdicionadorItemProps {
  foods: Food[];
  foodSelecionado: number | null;
  onFoodChange: (id: number | null) => void;
  onAdicionarItem: () => void;
  loadingFoods: boolean;
}

function AdicionadorItem({
  foods,
  foodSelecionado,
  onFoodChange,
  onAdicionarItem,
  loadingFoods,
}: AdicionadorItemProps) {
  return (
    <>
      <Text style={s.label}>Item do Cardápio</Text>
      <View style={s.row}>
        <View style={[s.pickerContainer, { flex: 1, marginBottom: 0 }]}>
          <Picker
            selectedValue={foodSelecionado}
            onValueChange={(value) =>
              onFoodChange(value === "" ? null : Number(value))
            }
            style={s.picker}
            enabled={!loadingFoods && foods.length > 0}
          >
            <Picker.Item
              label={loadingFoods ? "Carregando itens..." : "Selecione um item"}
              value=""
            />
            {foods.map((food) => (
              <Picker.Item key={food.id} label={food.name} value={food.id} />
            ))}
          </Picker>
        </View>
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
  itens: number[];
  foodsPorId: Record<number, string>;
  onRemoverItem?: (index: number) => void;
}

function ListaItens({ itens, foodsPorId, onRemoverItem }: ListaItensProps) {
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
            <Text style={s.listItem}>
              • {foodsPorId[item] ?? `Item #${item}`}
            </Text>
            {onRemoverItem && (
              <TouchableOpacity onPress={() => onRemoverItem(index)}>
                <MaterialIcons
                  name="close"
                  size={18}
                  color={COLORS.texto_suave}
                />
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

function Rodape() {
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

  const [abaAtiva, setAbaAtiva] = useState<TipoRefeicao>(TIPO_REFEICAO.cafe);
  const [itensPorRefeicao, setItensPorRefeicao] =
    useState<ItensPorRefeicao>(ITENS_INICIAIS);
  const [foodSelecionado, setFoodSelecionado] = useState<number | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [loading, setLoading] = useState(false);

  // Carregar lista de foods cadastrados
  React.useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const { data } = await api.get<Food[]>("/foods");
        console.log(data);
        if (ativo) {
          setFoods(data);
        }
      } catch (error) {
        console.error("Erro ao carregar itens:", error);
        Alert.alert("Erro", "Não foi possível carregar a lista de itens.");
      } finally {
        if (ativo) setLoadingFoods(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const foodsPorId = useMemo(
    () =>
      foods.reduce(
        (acc, food) => {
          acc[food.id] = food.name;
          return acc;
        },
        {} as Record<number, string>,
      ),
    [foods],
  );

  // Verificar acesso
  React.useEffect(() => {
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
        ],
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
    [],
  );

  const handleChangeAba = useCallback((tipo: TipoRefeicao) => {
    setAbaAtiva(tipo);
    setFoodSelecionado(null);
  }, []);

  const handleFoodChange = useCallback((id: number | null) => {
    setFoodSelecionado(id);
  }, []);

  const handleShowPicker = useCallback((show: boolean) => {
    setShowPicker(show);
  }, []);

  const handleAdicionarItem = useCallback(() => {
    if (foodSelecionado === null) {
      Alert.alert("Aviso", "Selecione um item");
      return;
    }
    setItensPorRefeicao((prev) => {
      if (prev[abaAtiva].includes(foodSelecionado)) {
        Alert.alert("Aviso", "Esse item já foi adicionado nessa refeição");
        return prev;
      }
      return {
        ...prev,
        [abaAtiva]: [...prev[abaAtiva], foodSelecionado],
      };
    });
    setFoodSelecionado(null);
  }, [foodSelecionado, abaAtiva]);

  const handleRemoverItem = useCallback(
    (index: number) => {
      setItensPorRefeicao((prev) => ({
        ...prev,
        [abaAtiva]: prev[abaAtiva].filter((_, i) => i !== index),
      }));
    },
    [abaAtiva],
  );

  const totalItens = ABAS.reduce(
    (acc, { tipo }) => acc + itensPorRefeicao[tipo].length,
    0,
  );

  const contagemPorTipo = ABAS.reduce(
    (acc, { tipo }) => {
      acc[tipo] = itensPorRefeicao[tipo].length;
      return acc;
    },
    {} as Record<TipoRefeicao, number>,
  );

  const handleSalvarRefeicao = useCallback(async () => {
    if (totalItens === 0) {
      Alert.alert("Erro", "Adicione pelo menos um item em alguma refeição");
      return;
    }

    setLoading(true);

    try {
      const meals = ABAS.map(({ tipo }) => ({
        type: tipo,
        items: itensPorRefeicao[tipo],
      })).filter((meal) => meal.items.length > 0);

      await api.post("/menus", {
        date: formatarDataISO(date),
        meals,
      });

      Alert.alert("Sucesso", "Refeição cadastrada com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            setItensPorRefeicao(ITENS_INICIAIS);
            setFoodSelecionado(null);
            setDate(new Date());
            setAbaAtiva(TIPO_REFEICAO.cafe);
          },
        },
      ]);
    } catch (error) {
      console.error("Erro ao salvar refeição:", error);
      Alert.alert("Erro", "Falha ao salvar. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  }, [itensPorRefeicao, totalItens, date]);

  const handleVoltar = useCallback(() => {
    if (totalItens > 0) {
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
        ],
      );
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/menu");
      }
    }
  }, [router, totalItens]);

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
        containerStyle={{
          width: "90%",
          alignSelf: "center",
          paddingHorizontal: 2,
          marginBottom: 20,
        }}
      >
        <View style={s.card}>
          <SeletorData
            date={date}
            onDateChange={handleDateChange}
            showPicker={showPicker}
            setShowPicker={handleShowPicker}
          />

          <Text style={[s.label, { marginTop: 20 }]}>Refeição</Text>
          <TabBarRefeicao
            abaAtiva={abaAtiva}
            onChangeAba={handleChangeAba}
            contagemPorTipo={contagemPorTipo}
          />

          <AdicionadorItem
            foods={foods}
            foodSelecionado={foodSelecionado}
            onFoodChange={handleFoodChange}
            onAdicionarItem={handleAdicionarItem}
            loadingFoods={loadingFoods}
          />

          <ListaItens
            itens={itensPorRefeicao[abaAtiva]}
            foodsPorId={foodsPorId}
            onRemoverItem={handleRemoverItem}
          />

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
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.bg_light,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  tabItemAtiva: {
    backgroundColor: COLORS.verde_mid,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "InterSemiBold",
    color: COLORS.texto_suave,
  },
  tabTextAtiva: {
    color: COLORS.branco,
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
