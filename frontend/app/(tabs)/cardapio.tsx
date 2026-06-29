import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  StatusBar,
  Share,
  Image,
  ActivityIndicator,
  StyleProp,
  TextStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Shadow } from "react-native-shadow-2";
import api from "../../src/services/api";

// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────
const PADDING_H_MOB = 20;
const CARD_GAP_MOB = 16;
const CARD_PEEK = 30;

const COLORS = {
  verde_dark: "#1b5e20",
  verde_mid: "#2e7d32",
  destaque_hoje: "#e65100",
  texto_forte: "#333",
  cinza_inativo: "#a9aba9",
  cinza_bg_card: "#e9e9e9",
  cinza_linha: "#cccccc",
  branco: "#fff",
} as const;

const DIAS_SEMANA = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

// Tipos como vêm da API
const TIPO_REFEICAO_API = {
  cafe: "CAFE",
  almoco: "ALMOCO",
  janta: "JANTAR",
} as const;

// Labels de exibição
const TIPO_REFEICAO_LABEL = {
  cafe: "Café da Manhã",
  almoco: "Almoço",
  janta: "Jantar",
} as const;

const ORDEM_REFEICOES: TipoRefeicao[] = ["cafe", "almoco", "janta"];

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────
type TipoRefeicao = keyof typeof TIPO_REFEICAO_API;

interface CardapioDia {
  diaSemana: string;
  nomeCurto: string;
  data: string; // YYYY-MM-DD
  dataFormatada: string;
  cafe: string[];
  almoco: string[];
  janta: string[];
}

interface APIFood {
  id: number;
  name: string;
}

interface APIMeal {
  type: "CAFE" | "ALMOCO" | "JANTAR";
  foods: APIFood[];
}

interface APIMenu {
  id: number;
  date: string; // ISO, ex: "2026-06-15T00:00:00.000Z"
  meals: APIMeal[];
}

// ──────────────────────────────────────────────
// CUSTOM HOOKS
// ──────────────────────────────────────────────
function useFavoritoRefeicao(diaSemana: string, tipo: TipoRefeicao) {
  const [isFav, setIsFav] = useState(false);
  const key = `@fav_${diaSemana}_${tipo}`;

  useEffect(() => {
    async function carregarFav() {
      try {
        const valor = await AsyncStorage.getItem(key);
        setIsFav(valor === "true");
      } catch {
        setIsFav(false);
      }
    }
    carregarFav();
  }, [diaSemana, key]);

  const toggle = useCallback(async () => {
    const novoValor = !isFav;
    setIsFav(novoValor);

    try {
      if (novoValor) {
        await AsyncStorage.setItem(key, "true");
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.error(e);
    }
  }, [isFav, key]);

  return [isFav, toggle] as const;
}

// ──────────────────────────────────────────────
// UTILITY FUNCTIONS
// ──────────────────────────────────────────────

// Formata uma Date local para "YYYY-MM-DD".
function formatarDataISO(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// A API retorna a data como ISO em UTC meia-noite (ex: "2026-06-15T00:00:00.000Z").
// Pegamos só a parte "YYYY-MM-DD" direto da string, sem converter fuso,
// pra não correr o risco de "voltar" um dia.
function extrairDataISO(dataApi: string): string {
  return dataApi.slice(0, 10);
}

// Cria uma Date local a partir de "YYYY-MM-DD" (evita o bug de fuso do
// `new Date("YYYY-MM-DD")`, que o JS interpreta como UTC).
function dataLocalDeISO(dataISO: string): Date {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function formatarDataBR(dataISO: string): string {
  return dataLocalDeISO(dataISO).toLocaleDateString("pt-BR");
}

// Retorna a Segunda e a Sexta-feira da semana corrente (baseado em "hoje").
// Funciona mesmo se hoje for sábado ou domingo (calcula a semana em curso).
function obterIntervaloSemanaAtual(): { inicio: Date; fim: Date } {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const diaSemana = hoje.getDay(); // 0 = Domingo, 1 = Segunda, ... 6 = Sábado
  const diffParaSegunda = diaSemana === 0 ? 6 : diaSemana - 1;

  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - diffParaSegunda);

  const sexta = new Date(segunda);
  sexta.setDate(segunda.getDate() + 4);

  return { inicio: segunda, fim: sexta };
}

// Monta a lista de CardapioDia só com os dias que a API de fato retornou
// (ou seja, dias com cardápio cadastrado), ordenados por data.
function mapearMenusParaDias(menus: APIMenu[]): CardapioDia[] {
  return menus
    .map((menu) => {
      const dataISO = extrairDataISO(menu.date);
      const dataDate = dataLocalDeISO(dataISO);
      const diaIndex = dataDate.getDay();
      const nomeDia = DIAS_SEMANA[diaIndex];
      const diaSemanaCompleto =
        nomeDia === "Domingo" || nomeDia === "Sábado"
          ? nomeDia
          : `${nomeDia}-feira`;

      const dia: CardapioDia = {
        diaSemana: diaSemanaCompleto,
        nomeCurto: nomeDia,
        data: dataISO,
        dataFormatada: dataDate.toLocaleDateString("pt-BR"),
        cafe: [],
        almoco: [],
        janta: [],
      };

      menu.meals.forEach((meal) => {
        const nomes = meal.foods.map((food) => food.name);

        if (meal.type === TIPO_REFEICAO_API.cafe) {
          dia.cafe = nomes;
        } else if (meal.type === TIPO_REFEICAO_API.almoco) {
          dia.almoco = nomes;
        } else if (meal.type === TIPO_REFEICAO_API.janta) {
          dia.janta = nomes;
        }
      });

      return dia;
    })
    .sort((a, b) => a.data.localeCompare(b.data));
}

// ──────────────────────────────────────────────
// COMPONENTES
// ──────────────────────────────────────────────

interface RefeicaoItemProps {
  itens: string[];
  tipo: TipoRefeicao;
  diaSemana: string;
  isHoje: boolean;
  isLeft: boolean;
}

function RefeicaoItem({
  itens,
  tipo,
  diaSemana,
  isHoje,
  isLeft,
}: RefeicaoItemProps) {
  const [isFav, toggleFav] = useFavoritoRefeicao(diaSemana, tipo);

  const handleCompartilhar = useCallback(async () => {
    try {
      const lista = itens.length
        ? itens.map((item) => `• ${item}`).join("\n")
        : "Sem itens cadastrados";
      await Share.share({
        message: `🍽️ ${TIPO_REFEICAO_LABEL[tipo]} - ${diaSemana}\n\n${lista}`,
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  }, [itens, tipo, diaSemana]);

  const tituloStyle = isLeft ? s.refeicaoTituloRight : s.refeicaoTituloLeft;
  const tituloColor = !isHoje ? COLORS.texto_forte : undefined;
  const itensContainerStyle = isLeft ? s.itensLeft : s.itensRight;
  const itemTextStyle = isLeft ? s.itemTextLeft : s.itemTextRight;

  return (
    <>
      <Text style={[tituloStyle, tituloColor && { color: tituloColor }]}>
        {TIPO_REFEICAO_LABEL[tipo]}
      </Text>
      <View style={s.refeicaoRow}>
        {isLeft && (
          <View style={itensContainerStyle}>
            {renderItens(itens, itemTextStyle)}
          </View>
        )}

        <View style={s.iconsColumn}>
          <TouchableOpacity onPress={handleCompartilhar}>
            <MaterialIcons name="share" size={20} color={COLORS.texto_forte} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFav}>
            <MaterialIcons
              name={isFav ? "favorite" : "favorite-border"}
              size={20}
              color={isFav ? "#c62828" : COLORS.texto_forte}
            />
          </TouchableOpacity>
        </View>

        {!isLeft && (
          <View style={itensContainerStyle}>
            {renderItens(itens, itemTextStyle)}
          </View>
        )}
      </View>
    </>
  );
}

function renderItens(itens: string[], style: StyleProp<TextStyle>) {
  if (itens.length === 0) {
    return (
      <Text style={[style, { color: COLORS.cinza_inativo }]}>
        Sem itens
      </Text>
    );
  }

  return itens.map((item, i) => (
    <Text key={`${item}-${i}`} style={style}>
      {item}
    </Text>
  ));
}

interface CardDiaProps {
  dia: CardapioDia;
  width: number;
  isHoje: boolean;
}

function CardDia({ dia, width, isHoje }: CardDiaProps) {
  return (
    <View style={{ width, marginRight: CARD_GAP_MOB }}>
      {/* Título com Badge "HOJE" */}
      <View style={s.tituloDiaColumn}>
        <View style={s.tituloDiaRow}>
          <Text style={[s.diaTituloExtenso, isHoje && s.diaTituloExtensoHoje]}>
            {dia.diaSemana}
          </Text>
          {isHoje && (
            <View style={s.badgeHoje}>
              <Text style={s.badgeHojeTexto}>HOJE</Text>
            </View>
          )}
        </View>
        <Text style={s.dataSubtitulo}>{dia.dataFormatada}</Text>
      </View>

      <Shadow
        distance={isHoje ? 2 : 6}
        startColor={isHoje ? "#015508c9" : "#00000015"}
        offset={[0, isHoje ? 8 : 4]}
        style={{ width: "100%", borderRadius: 20 }}
        containerStyle={{ width: "100%", marginBottom: 20 }}
      >
        <View style={[s.bigCard, isHoje && s.bigCardHoje]}>
          {/* CAFÉ DA MANHÃ */}
          <RefeicaoItem
            itens={dia.cafe}
            tipo="cafe"
            diaSemana={dia.diaSemana}
            isHoje={isHoje}
            isLeft
          />

          <View style={s.linhaDivisoria} />

          {/* ALMOÇO */}
          <RefeicaoItem
            itens={dia.almoco}
            tipo="almoco"
            diaSemana={dia.diaSemana}
            isHoje={isHoje}
            isLeft={false}
          />

          <View style={s.linhaDivisoria} />

          {/* JANTA */}
          <RefeicaoItem
            itens={dia.janta}
            tipo="janta"
            diaSemana={dia.diaSemana}
            isHoje={isHoje}
            isLeft
          />
        </View>
      </Shadow>
    </View>
  );
}

interface DiaNavBtnProps {
  dia: CardapioDia;
  isAtivo: boolean;
  isHoje: boolean;
  onPress: () => void;
}

function DiaNavBtn({ dia, isAtivo, isHoje, onPress }: DiaNavBtnProps) {
  const btnStyle = isAtivo
    ? s.diaBtnAtivo
    : isHoje && !isAtivo
      ? s.diaBtnHoje
      : s.diaBtnInativo;

  const textStyle = isHoje && !isAtivo ? s.diaBtnNomeHoje : s.diaBtnNome;

  return (
    <TouchableOpacity
      style={[s.diaBtn, btnStyle]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={textStyle}>{dia.nomeCurto}</Text>
    </TouchableOpacity>
  );
}

// ──────────────────────────────────────────────
// TELA PRINCIPAL
// ──────────────────────────────────────────────
export default function CardapioScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  const [paginaAtual, setPaginaAtual] = useState(0);
  const [cardapioSemana, setCardapioSemana] = useState<CardapioDia[]>([]);
  const [loading, setLoading] = useState(true);

  // Intervalo da semana atual (Segunda a Sexta), calculado uma única vez.
  const { inicio: segundaAtual, fim: sextaAtual } = useMemo(
    () => obterIntervaloSemanaAtual(),
    [],
  );
  const initialDate = useMemo(
    () => formatarDataISO(segundaAtual),
    [segundaAtual],
  );
  const endDate = useMemo(() => formatarDataISO(sextaAtual), [sextaAtual]);

  // Texto "Semana {dia inicial} - {dia final}" vem direto do intervalo
  // pedido (Segunda a Sexta), não dos dados retornados pela API — assim
  // o cabeçalho fica correto mesmo se algum dia não tiver cardápio.
  const rangoData = useMemo(
    () =>
      `Semana ${segundaAtual.toLocaleDateString("pt-BR")} - ${sextaAtual.toLocaleDateString("pt-BR")}`,
    [segundaAtual, sextaAtual],
  );

  const hojeISO = useMemo(() => formatarDataISO(new Date()), []);
  const diaAtual = useMemo(
    () => cardapioSemana.findIndex((d) => d.data === hojeISO),
    [cardapioSemana, hojeISO],
  );

  const CARD_W_MOB = useMemo(() => width - PADDING_H_MOB - CARD_PEEK, [width]);
  const SNAP_INTERVAL = useMemo(() => CARD_W_MOB + CARD_GAP_MOB, [CARD_W_MOB]);

  // Carregar cardápio (Segunda a Sexta da semana atual)
  useEffect(() => {
    async function carregarCardapio() {
      try {
        const res = await api.get<APIMenu[]>("/menus", {
          params: { initialDate, endDate },
        });

        // Mostra só os dias que de fato têm cardápio cadastrado na API,
        // sem cards vazios pra dias sem registro.
        const dias = mapearMenusParaDias(res.data);

        setCardapioSemana(dias);
      } catch (err) {
        console.error("Erro ao carregar cardápio:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarCardapio();
  }, [initialDate, endDate, segundaAtual, sextaAtual]);

  // Scroll automático para hoje
  useEffect(() => {
    if (cardapioSemana.length === 0 || diaAtual === -1) return;

    setPaginaAtual(diaAtual);

    setTimeout(() => {
      scrollRef.current?.scrollTo({
        x: diaAtual * SNAP_INTERVAL,
        animated: true,
      });
    }, 300);
  }, [cardapioSemana, diaAtual, SNAP_INTERVAL]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const pagina = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
      setPaginaAtual(pagina);
    },
    [SNAP_INTERVAL],
  );

  const irParaDia = useCallback(
    (idx: number) => {
      scrollRef.current?.scrollTo({ x: idx * SNAP_INTERVAL, animated: true });
    },
    [SNAP_INTERVAL],
  );

  const handleVoltar = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/menu");
    }
  }, [router]);

  // Estados de loading e erro
  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={COLORS.verde_mid} />
      </View>
    );
  }

  if (cardapioSemana.length === 0) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 18 }}>Nenhum cardápio disponível.</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.branco} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
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
              onPress={handleVoltar}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="arrow-back"
                size={20}
                color={COLORS.branco}
              />
              <Text style={s.voltarText}>Voltar</Text>
            </TouchableOpacity>
          </Shadow>

          <View style={s.titleArea}>
            <Text style={s.titulo}>Cardápio da{"\n"}Semana</Text>
            <Text style={s.subtitulo}>{rangoData}</Text>
          </View>
        </View>

        {/* Navegação de Dias */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, maxHeight: 50 }}
          contentContainerStyle={s.diasNav}
        >
          {cardapioSemana.map((dia, idx) => (
            <DiaNavBtn
              key={dia.data}
              dia={dia}
              isAtivo={paginaAtual === idx}
              isHoje={idx === diaAtual}
              onPress={() => irParaDia(idx)}
            />
          ))}
        </ScrollView>

        {/* Carrossel de Cards */}
        <View style={{ marginTop: 20 }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingLeft: PADDING_H_MOB,
              paddingRight: PADDING_H_MOB,
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {cardapioSemana.map((dia, idx) => (
              <CardDia
                key={dia.data}
                dia={dia}
                width={CARD_W_MOB}
                isHoje={idx === diaAtual}
              />
            ))}
          </ScrollView>
        </View>

        {/* Paginação */}
        <View style={s.paginacao}>
          {cardapioSemana.map((_, idx) => (
            <View
              key={cardapioSemana[idx].data}
              style={[s.dot, paginaAtual === idx && s.dotAtivo]}
            />
          ))}
        </View>
      </ScrollView>

      {/* Rodapé Fixo */}
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
    </View>
  );
}

// ──────────────────────────────────────────────
// ESTILOS
// ──────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.branco,
    paddingTop: Platform.OS === "android" ? 40 : 50,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: PADDING_H_MOB,
    marginBottom: 20,
  },
  tituloDiaColumn: {
    flexDirection: "column",
    marginBottom: 14,
    marginLeft: 10,
    gap: 6,
  },
  dataSubtitulo: {
    fontSize: 13,
    fontFamily: "InterSemiBold",
  },
  voltarBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.verde_mid,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  voltarText: {
    color: COLORS.branco,
    fontFamily: "InterBold",
    fontSize: 16,
  },
  titleArea: {
    flex: 1,
    alignItems: "flex-end",
    marginLeft: 20,
  },
  titulo: {
    fontSize: 32,
    fontFamily: "InterBlack",
    color: COLORS.texto_forte,
    textAlign: "right",
    lineHeight: 32,
    letterSpacing: -1,
  },
  subtitulo: {
    fontSize: 16,
    fontFamily: "InterBold",
    color: "#555",
    marginTop: 5,
  },
  diasNav: {
    paddingHorizontal: PADDING_H_MOB,
    gap: 10,
    alignItems: "center",
  },
  diaBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  diaBtnInativo: {
    backgroundColor: COLORS.cinza_inativo,
  },
  diaBtnAtivo: {
    backgroundColor: COLORS.verde_mid,
    borderColor: COLORS.verde_mid,
  },
  diaBtnHoje: {
    backgroundColor: COLORS.branco,
    borderColor: COLORS.verde_mid,
  },
  diaBtnNome: {
    color: COLORS.branco,
    fontFamily: "InterBold",
    fontSize: 14,
  },
  diaBtnNomeHoje: {
    color: COLORS.verde_mid,
  },
  tituloDiaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 10,
    gap: 10,
  },
  diaTituloExtenso: {
    fontSize: 20,
    fontFamily: "InterBlack",
    color: COLORS.texto_forte,
  },
  diaTituloExtensoHoje: {
    color: COLORS.verde_mid,
    fontSize: 22,
  },
  badgeHoje: {
    backgroundColor: COLORS.destaque_hoje,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeHojeTexto: {
    color: COLORS.branco,
    fontSize: 10,
    fontFamily: "InterBold",
    letterSpacing: 0.5,
  },
  bigCard: {
    backgroundColor: COLORS.cinza_bg_card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#d4e0d4",
  },
  bigCardHoje: {
    backgroundColor: COLORS.branco,
    borderColor: COLORS.verde_mid,
    borderWidth: 2.5,
  },
  linhaDivisoria: {
    height: 1,
    backgroundColor: COLORS.cinza_linha,
    marginVertical: 15,
  },
  refeicaoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  iconsColumn: {
    justifyContent: "flex-end",
    gap: 15,
    paddingBottom: 5,
  },
  refeicaoTituloRight: {
    fontSize: 22,
    fontFamily: "InterBlack",
    color: COLORS.verde_mid,
    textAlign: "right",
    marginBottom: 10,
  },
  itensLeft: {
    flex: 1,
    paddingRight: 15,
  },
  itemTextLeft: {
    fontSize: 16,
    fontFamily: "InterBold",
    color: COLORS.texto_forte,
    textAlign: "left",
    lineHeight: 20,
  },
  refeicaoTituloLeft: {
    fontSize: 22,
    fontFamily: "InterBlack",
    color: COLORS.verde_mid,
    textAlign: "left",
    marginBottom: 10,
  },
  itensRight: {
    flex: 1,
    paddingLeft: 15,
  },
  itemTextRight: {
    fontSize: 16,
    fontFamily: "InterBold",
    color: COLORS.texto_forte,
    textAlign: "right",
    lineHeight: 20,
  },
  paginacao: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
  },
  dotAtivo: {
    backgroundColor: "#000",
  },
  footerBlock: {
    backgroundColor: COLORS.branco,
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: "#eee",
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