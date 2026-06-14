import React, { useRef, useState, useEffect } from "react";
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
} from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ──────────────────────────────────────────────
// Breakpoint
// ──────────────────────────────────────────────
const BREAKPOINT_DESKTOP = 768;

// Mobile
const PADDING_H_MOB = 20;
const CARD_GAP_MOB = 12;
const CARD_PEEK = 28;

// Desktop
const PADDING_H_DSK = 32;
const COL_GAP_DSK = 14;

// Espaçamentos e alturas estimadas
const MOB_PADDING_TOP = Platform.OS === "android" ? 40 : 52;
const MOB_DAY_HEADER_H = 52;
const MOB_GAP_H = 8;

// ──────────────────────────────────────────────
// Paleta
// ──────────────────────────────────────────────
const VERDE_DARK = "#1b5e20";
const VERDE_MID = "#2e7d32";
const VERDE_LIGHT = "#4caf50";
const VERDE_PALE = "#e8f5e9";
const LARANJA = "#e65100";
const LARANJA_SOFT = "#fff3e0";
const CINZA_BG = "#f0f4f0";
const CINZA_CARD = "#ffffff";
const CINZA_BORDA = "#dde8dd";
const TEXTO_FORTE = "#1a1a1a";
const TEXTO_MED = "#4a4a4a";
const TEXTO_SUAVE = "#8a9a8a";

// ──────────────────────────────────────────────
// Dados
// ──────────────────────────────────────────────
const cardapioSemana = [
  {
    id: 1,
    diaSemana: "Segunda-feira",
    data: "25/05",
    refeicoes: [
      {
        tipo: "ALMOÇO",
        icone: "wb-sunny" as const,
        itens: [
          "Arroz branco / parboilizado",
          "Feijão preto",
          "Iscas de carne bovina",
          "Polenta frita",
          "Salada de alface e tomate",
        ],
      },
      {
        tipo: "JANTAR",
        icone: "nights-stay" as const,
        itens: [
          "Arroz branco / parboilizado",
          "Feijão preto",
          "Cachorro quente",
          "Batata palha",
          "Salada mista",
        ],
      },
    ],
  },
  {
    id: 2,
    diaSemana: "Terça-feira",
    data: "26/05",
    refeicoes: [
      {
        tipo: "ALMOÇO",
        icone: "wb-sunny" as const,
        itens: [
          "Arroz branco / parboilizado",
          "Feijão carioca",
          "Filé de frango grelhado",
          "Creme de milho",
          "Salada de cenoura e beterraba",
        ],
      },
      {
        tipo: "JANTAR",
        icone: "nights-stay" as const,
        itens: [
          "Arroz branco / parboilizado",
          "Feijão carioca",
          "Carne de panela com batatas",
          "Farofa",
          "Salada verde",
        ],
      },
    ],
  },
  {
    id: 3,
    diaSemana: "Quarta-feira",
    data: "27/05",
    refeicoes: [
      {
        tipo: "ALMOÇO",
        icone: "wb-sunny" as const,
        itens: [
          "Arroz branco / parboilizado",
          "Feijão preto",
          "Strogonoff de frango",
          "Batata palha",
          "Salada de repolho",
        ],
      },
      {
        tipo: "JANTAR",
        icone: "nights-stay" as const,
        itens: [
          "Sopa de agnolini",
          "Pão francês",
          "Queijo ralado",
          "Fruta da estação",
        ],
      },
    ],
  },
  {
    id: 4,
    diaSemana: "Quinta-feira",
    data: "28/05",
    refeicoes: [
      {
        tipo: "ALMOÇO",
        icone: "wb-sunny" as const,
        itens: [
          "Arroz branco / parboilizado",
          "Lentilha",
          "Bife suíno acebolado",
          "Massa alho e óleo",
          "Salada de tomate",
        ],
      },
      {
        tipo: "JANTAR",
        icone: "nights-stay" as const,
        itens: [
          "Arroz de forno com frios",
          "Salada mista",
          "Ovos cozidos",
          "Fruta da estação",
        ],
      },
    ],
  },
  {
    id: 5,
    diaSemana: "Sexta-feira",
    data: "29/05",
    refeicoes: [
      {
        tipo: "ALMOÇO",
        icone: "wb-sunny" as const,
        itens: [
          "Arroz branco / parboilizado",
          "Feijão preto",
          "Peixe empanado",
          "Purê de batatas",
          "Salada de folhas verdes",
        ],
      },
      {
        tipo: "JANTAR",
        icone: "nights-stay" as const,
        itens: [
          "Pizza de calabresa e queijo",
          "Suco natural",
          "Sobremesa doce",
        ],
      },
    ],
  },
];

// ──────────────────────────────────────────────
// Card de refeição
// ──────────────────────────────────────────────
function CardRefeicao({
  tipo,
  icone,
  itens,
  isHoje,
  isAlmoco,
  estiloExtra,
  diaSemana,
}: {
  tipo: string;
  icone: "wb-sunny" | "nights-stay";
  itens: string[];
  isHoje: boolean;
  isAlmoco: boolean;
  estiloExtra?: any;
  diaSemana: string;
}) {
  const cor = isAlmoco ? LARANJA : VERDE_MID;
  const bg = isHoje ? (isAlmoco ? LARANJA_SOFT : VERDE_PALE) : CINZA_CARD;

  // ── ESTADOS ──
  const [isFavorito, setIsFavorito] = useState(false);
  const storageKey = `@fav_${diaSemana}_${tipo}`;

  useEffect(() => {
    async function carregarFavorito() {
      const salvo = await AsyncStorage.getItem(storageKey);
      if (salvo === "true") {
        setIsFavorito(true);
      }
    }
    carregarFavorito();
  }, [storageKey]);

  // ── FUNÇÃO DE FAVORITAR ──
  const lidarComFavorito = async () => {
    const novoEstado = !isFavorito;
    setIsFavorito(novoEstado);
    if (novoEstado) {
      await AsyncStorage.setItem(storageKey, "true");
    } else {
      await AsyncStorage.removeItem(storageKey);
    }
  };

  // ── FUNÇÃO DE COMPARTILHAR ──
  const lidarComCompartilhamento = async () => {
    try {
      const listaFormatada = itens.map((item) => `• ${item}`).join("\n");

      const mensagemTexto = `🍽️ *Cardápio do Refeitório*\n\n📅 ${diaSemana}\n🍲 ${tipo}\n\n${listaFormatada}`;

      if (Platform.OS === "web") {
        // No PC (Web), copiamos o texto para a área de transferência
        navigator.clipboard.writeText(mensagemTexto);
        alert(
          "Copiado! 📋\n\nO cardápio foi copiado. Agora é só colar (Ctrl+V) no WhatsApp Web ou onde quiser!",
        );
      } else {
        // No celular (Android/iOS), abre a tela nativa de compartilhamento
        await Share.share({
          message: mensagemTexto,
          title: `Cardápio de ${diaSemana}`,
        });
      }
    } catch (error) {
      console.error("Erro ao tentar compartilhar:", error);
    }
  };

  return (
    <View
      style={[
        s.card,
        { backgroundColor: bg },
        estiloExtra,
        isHoje && s.cardDestaque,
      ]}
    >
      <View style={[s.cardStripe, { backgroundColor: cor }]} />
      <View style={s.cardInner}>
        {/* Cabeçalho do Card */}
        <View style={[s.refHeader, { justifyContent: "space-between" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <MaterialIcons name={icone} size={14} color={cor} />
            <Text style={[s.refTipo, { color: cor }]}>{tipo}</Text>
          </View>

          {/* 👈 ENVELOPE COM OS DOIS BOTÕES */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            {/* Botão de Compartilhar */}
            <TouchableOpacity
              onPress={lidarComCompartilhamento}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="share" size={18} color={TEXTO_SUAVE} />
            </TouchableOpacity>

            {/* Botão de Favoritar */}
            <TouchableOpacity
              onPress={lidarComFavorito}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name={isFavorito ? "favorite" : "favorite-border"}
                size={18}
                color={isFavorito ? "#ff5252" : TEXTO_SUAVE}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.divisor} />
        {itens.map((item, i) => (
          <View key={i} style={s.itemRow}>
            <View style={[s.ponto, { backgroundColor: cor }]} />
            <Text style={s.itemText} numberOfLines={2}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// Tela principal
// ──────────────────────────────────────────────
export default function CardapioScreen() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [paginaAtual, setPaginaAtual] = useState(0);

  const diaAtual = new Date().getDay();
  const isDesktop = width >= BREAKPOINT_DESKTOP;

  // ── Mobile e Desktop Medidas ──
  const CARD_W_MOB = width - PADDING_H_MOB * 2 - CARD_PEEK;
  const SNAP_INTERVAL = CARD_W_MOB + CARD_GAP_MOB;
  const COL_W_DSK = (width - PADDING_H_DSK * 2 - COL_GAP_DSK * 4) / 5;

  const lidarComLogout = async () => {
    await logout();
    router.replace("/");
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pagina = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    setPaginaAtual(pagina);
  };

  const irParaDia = (idx: number) =>
    scrollRef.current?.scrollTo({ x: idx * SNAP_INTERVAL, animated: true });

  const Header = (
    <View style={[s.header, isDesktop && { paddingHorizontal: PADDING_H_DSK }]}>
      <View>
        <Text style={s.saudacao}>Bem-vindo 👋</Text>
        <Text style={s.welcome}>
          {(user as any)?.name
            ? (user as any).name.split(" ")[0]
            : ((user as any)?.email?.split("@")[0] ?? "Aluno")}
        </Text>
      </View>
      <TouchableOpacity
        style={s.logoutBtn}
        onPress={lidarComLogout}
        activeOpacity={0.8}
      >
        <MaterialIcons name="logout" size={16} color="#fff" />
        <Text style={s.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );

  const Titulo = (
    <View
      style={[s.titleRow, isDesktop && { paddingHorizontal: PADDING_H_DSK }]}
    >
      <View style={s.titleIconWrap}>
        <MaterialIcons name="restaurant-menu" size={18} color="#fff" />
      </View>
      <View>
        <Text style={s.title}>Cardápio Semanal</Text>
        <Text style={s.subtitle}>25 a 29 de maio · 2026</Text>
      </View>
    </View>
  );

  // ──────────────────────────────────────────
  // LAYOUT DESKTOP
  // ──────────────────────────────────────────
  if (isDesktop) {
    return (
      <ScrollView
        style={s.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <StatusBar barStyle="dark-content" backgroundColor={CINZA_BG} />
        {Header}
        {Titulo}

        <View
          style={[
            s.grid,
            {
              paddingHorizontal: PADDING_H_DSK,
              gap: COL_GAP_DSK,
              marginTop: 8,
            },
          ]}
        >
          {cardapioSemana.map((dia) => {
            const isHoje = diaAtual === dia.id;
            const almoco = dia.refeicoes[0];
            const jantar = dia.refeicoes[1];
            return (
              <View key={dia.id} style={[s.gridCol, { width: COL_W_DSK }]}>
                <View style={s.colHeader}>
                  <Text style={[s.colDia, isHoje && { color: VERDE_MID }]}>
                    {dia.diaSemana.split("-")[0]}
                  </Text>
                  <Text style={s.colData}>{dia.data}</Text>
                  {isHoje && (
                    <View style={s.badgeHoje}>
                      <Text style={s.badgeHojeText}>HOJE</Text>
                    </View>
                  )}
                </View>
                <CardRefeicao
                  tipo={almoco.tipo}
                  icone={almoco.icone}
                  itens={almoco.itens}
                  isHoje={isHoje}
                  isAlmoco
                  estiloExtra={{ minHeight: 180, flex: 1 }}
                  diaSemana={dia.diaSemana}
                />
                <View style={{ height: 10 }} />
                <CardRefeicao
                  tipo={jantar.tipo}
                  icone={jantar.icone}
                  itens={jantar.itens}
                  isHoje={isHoje}
                  isAlmoco={false}
                  estiloExtra={{ minHeight: 180, flex: 1 }}
                  diaSemana={dia.diaSemana}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  // ──────────────────────────────────────────
  // LAYOUT MOBILE
  // ──────────────────────────────────────────
  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={CINZA_BG} />
      {Header}
      {Titulo}

      {/* Pílulas dos dias */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={s.diasNav}
      >
        {cardapioSemana.map((dia, idx) => {
          const isHoje = diaAtual === dia.id;
          const isAtivo = paginaAtual === idx;
          return (
            <TouchableOpacity
              key={dia.id}
              style={[
                s.diaBtn,
                isAtivo && s.diaBtnAtivo,
                isHoje && !isAtivo && s.diaBtnHoje,
              ]}
              onPress={() => irParaDia(idx)}
              activeOpacity={0.75}
            >
              <Text style={[s.diaBtnData, isAtivo && s.diaBtnDataAtiva]}>
                {dia.data}
              </Text>
              <Text style={[s.diaBtnNome, isAtivo && s.diaBtnNomeAtivo]}>
                {dia.diaSemana.split("-")[0]}
              </Text>
              {isHoje && <View style={s.dotHoje} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Cards com snap */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingLeft: PADDING_H_MOB,
          paddingRight: PADDING_H_MOB - CARD_GAP_MOB,
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {cardapioSemana.map((dia) => {
          const isHoje = diaAtual === dia.id;
          const almoco = dia.refeicoes[0];
          const jantar = dia.refeicoes[1];
          return (
            <ScrollView
              key={dia.id}
              style={[
                s.diaCol,
                { width: CARD_W_MOB, marginRight: CARD_GAP_MOB },
              ]}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <View style={[s.diaHeaderRow, isHoje && s.diaHeaderHoje]}>
                <View>
                  <Text style={[s.diaNome, isHoje && { color: VERDE_MID }]}>
                    {dia.diaSemana}
                  </Text>
                  <Text style={s.diaData}>{dia.data}</Text>
                </View>
                {isHoje && (
                  <View style={s.badgeHoje}>
                    <MaterialIcons name="today" size={11} color="#fff" />
                    <Text style={s.badgeHojeText}>HOJE</Text>
                  </View>
                )}
              </View>
              <CardRefeicao
                tipo={almoco.tipo}
                icone={almoco.icone}
                itens={almoco.itens}
                isHoje={isHoje}
                isAlmoco
                estiloExtra={{ minHeight: 150 }}
                diaSemana={dia.diaSemana}
              />
              <View style={{ height: MOB_GAP_H }} />
              <CardRefeicao
                tipo={jantar.tipo}
                icone={jantar.icone}
                itens={jantar.itens}
                isHoje={isHoje}
                isAlmoco={false}
                estiloExtra={{ minHeight: 150 }}
                diaSemana={dia.diaSemana}
              />
            </ScrollView>
          );
        })}
      </ScrollView>

      {/* Paginação */}
      <View style={s.paginacao}>
        {cardapioSemana.map((_, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => irParaDia(idx)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={[s.dot, paginaAtual === idx && s.dotAtivo]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// Estilos
// ──────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CINZA_BG,
    paddingTop: MOB_PADDING_TOP,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PADDING_H_MOB,
    marginBottom: 20,
  },
  saudacao: { fontSize: 13, color: TEXTO_SUAVE, fontWeight: "500" },
  welcome: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXTO_FORTE,
    textTransform: "capitalize",
  },
  logoutBtn: {
    backgroundColor: "#c62828",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
    shadowColor: "#c62828",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: PADDING_H_MOB,
    marginBottom: 20,
  },
  titleIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: VERDE_MID,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: VERDE_MID,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: VERDE_DARK,
    letterSpacing: -0.3,
  },
  subtitle: { fontSize: 12, color: TEXTO_SUAVE, marginTop: 1 },

  // ── Desktop grid
  grid: { flexDirection: "row" },
  gridCol: { flexShrink: 1 },
  colHeader: {
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 6,
    minHeight: 70,
  },
  colDia: {
    fontSize: 13,
    fontWeight: "800",
    color: TEXTO_MED,
    textAlign: "center",
  },
  colData: { fontSize: 11, color: TEXTO_SUAVE, marginTop: 2 },

  // ── Mobile nav
  diasNav: {
    paddingHorizontal: PADDING_H_MOB,
    gap: 8,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  diaBtn: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: CINZA_CARD,
    borderWidth: 1,
    borderColor: CINZA_BORDA,
    minWidth: 52,
  },
  diaBtnAtivo: {
    backgroundColor: VERDE_MID,
    borderColor: VERDE_MID,
    shadowColor: VERDE_MID,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  diaBtnHoje: { borderColor: VERDE_LIGHT, borderWidth: 1.5 },
  diaBtnData: { fontSize: 10, fontWeight: "700", color: TEXTO_SUAVE },
  diaBtnDataAtiva: { color: "rgba(255,255,255,0.8)" },
  diaBtnNome: {
    fontSize: 11,
    fontWeight: "800",
    color: TEXTO_MED,
    marginTop: 1,
  },
  diaBtnNomeAtivo: { color: "#fff" },
  dotHoje: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: VERDE_LIGHT,
    marginTop: 3,
  },

  // ── Mobile colunas
  diaCol: {},
  diaHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 2,
    height: MOB_DAY_HEADER_H,
  },
  diaHeaderHoje: {},
  diaNome: { fontSize: 16, fontWeight: "800", color: TEXTO_FORTE },
  diaData: { fontSize: 12, color: TEXTO_SUAVE, marginTop: 1 },

  // ── Badge HOJE
  badgeHoje: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: VERDE_LIGHT,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: VERDE_LIGHT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeHojeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // ── Card
  card: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: CINZA_CARD,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDestaque: { borderColor: VERDE_LIGHT, borderWidth: 1.5 },
  cardStripe: { height: 5, width: "100%" },
  cardInner: { flex: 1, paddingHorizontal: 14, paddingVertical: 8 },
  refHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  refTipo: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  divisor: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 7 },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginBottom: 4,
  },
  ponto: { width: 5, height: 5, borderRadius: 3, marginTop: 5, flexShrink: 0 },
  itemText: { flex: 1, fontSize: 13, color: TEXTO_MED, lineHeight: 18 },

  // ── Paginação
  paginacao: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: CINZA_BORDA },
  dotAtivo: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: VERDE_MID,
  },
});
