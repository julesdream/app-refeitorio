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
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Shadow } from "react-native-shadow-2";

// ──────────────────────────────────────────────
// Layout e Cores
// ──────────────────────────────────────────────
const PADDING_H_MOB = 20;
const CARD_GAP_MOB = 16;
const CARD_PEEK = 30;

const VERDE_DARK = "#1b5e20";
const VERDE_MID = "#2e7d32";
const DESTAQUE_HOJE = "#e65100";
const TEXTO_FORTE = "#333";
const CINZA_INATIVO = "#a9aba9";
const CINZA_BG_CARD = "#e9e9e9";
const CINZA_LINHA = "#cccccc";

// ──────────────────────────────────────────────
// Dados
// ──────────────────────────────────────────────
const cardapioSemana = [
  {
    id: 1,
    diaSemana: "Segunda-feira",
    nomeCurto: "Segunda",
    data: "25/05",
    almoco: [
      "Arroz branco / parboilizado",
      "Feijão preto",
      "Iscas de carne bovina",
      "Polenta frita",
      "Salada de alface e tomate",
    ],
    janta: [
      "Arroz branco / parboilizado",
      "Feijão preto",
      "Cachorro quente",
      "Batata palha",
      "Salada mista",
    ],
  },
  {
    id: 2,
    diaSemana: "Terça-feira",
    nomeCurto: "Terça",
    data: "26/05",
    almoco: [
      "Arroz/Lentilha",
      "Frango frescor da capuchinha",
      "Mandioquinha cozida com tempero verde",
      "Saladas/Sobremesa",
    ],
    janta: [
      "Arroz/Lentilha",
      "Frango frescor da capuchinha",
      "Mandioquinha cozida com tempero verde",
      "Saladas/Sobremesa",
    ],
  },
  {
    id: 3,
    diaSemana: "Quarta-feira",
    nomeCurto: "Quarta",
    data: "27/05",
    almoco: [
      "Arroz/Lentilha",
      "Strogonoff de frango",
      "Batata palha",
      "Saladas/Sobremesa",
    ],
    janta: [
      "Sopa de agnolini",
      "Pão francês",
      "Queijo ralado",
      "Fruta da estação",
    ],
  },
  {
    id: 4,
    diaSemana: "Quinta-feira",
    nomeCurto: "Quinta",
    data: "28/05",
    almoco: [
      "Arroz branco / parboilizado",
      "Lentilha",
      "Bife suíno acebolado",
      "Massa alho e óleo",
      "Salada de tomate",
    ],
    janta: [
      "Arroz de forno com frios",
      "Salada mista",
      "Ovos cozidos",
      "Fruta da estação",
    ],
  },
  {
    id: 5,
    diaSemana: "Sexta-feira",
    nomeCurto: "Sexta",
    data: "29/05",
    almoco: [
      "Arroz branco",
      "Feijão preto",
      "Peixe empanado",
      "Purê de batatas",
      "Salada de folhas verdes",
    ],
    janta: ["Pizza de calabresa e queijo", "Suco natural", "Sobremesa doce"],
  },
];

// ──────────────────────────────────────────────
// Componente do Card do Dia Inteiro
// ──────────────────────────────────────────────
function CardDia({ dia, width, isHoje }: { dia: any; width: number; isHoje: boolean }) {
  const [favAlmoco, setFavAlmoco] = useState(false);
  const [favJanta, setFavJanta] = useState(false);

  const keyAlmoco = `@fav_${dia.diaSemana}_almoco`;
  const keyJanta = `@fav_${dia.diaSemana}_janta`;

  useEffect(() => {
    async function carregarFavs() {
      const a = await AsyncStorage.getItem(keyAlmoco);
      const j = await AsyncStorage.getItem(keyJanta);
      if (a === "true") setFavAlmoco(true);
      if (j === "true") setFavJanta(true);
    }
    carregarFavs();
  }, [dia.diaSemana]);

  const toggleFav = async (tipo: "almoco" | "janta") => {
    const isAlmoco = tipo === "almoco";
    const novoValor = isAlmoco ? !favAlmoco : !favJanta;
    const key = isAlmoco ? keyAlmoco : keyJanta;

    if (isAlmoco) setFavAlmoco(novoValor);
    else setFavJanta(novoValor);

    if (novoValor) await AsyncStorage.setItem(key, "true");
    else await AsyncStorage.removeItem(key);
  };

  const compartilhar = async (tipo: "Almoço" | "Janta", itens: string[]) => {
    try {
      const lista = itens.map((item) => `• ${item}`).join("\n");
      await Share.share({
        message: `🍽️ *${tipo} de ${dia.diaSemana}*\n\n${lista}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{ width, marginRight: CARD_GAP_MOB }}>
      {/* ── Título com Badge "HOJE" ── */}
      <View style={s.tituloDiaRow}>
        <Text style={[s.diaTituloExtenso, isHoje && s.diaTituloExtensoHoje]}>
          {dia.diaSemana.toLowerCase()}
        </Text>
        {isHoje && (
          <View style={s.badgeHoje}>
            <Text style={s.badgeHojeTexto}>HOJE</Text>
          </View>
        )}
      </View>

      <Shadow
        distance={isHoje ? 2 : 6}
        startColor={isHoje ? "#015508c9" : "#00000015"}
        offset={[0, isHoje ? 8 : 4]}
        style={{ width: "100%", borderRadius: 20 }}
        containerStyle={{ width: "100%", marginBottom: 20 }}
      >
        <View style={[s.bigCard, isHoje && s.bigCardHoje]}>
          {/* ── ALMOÇO ── */}
          <Text style={[s.refeicaoTituloRight, !isHoje && { color: TEXTO_FORTE }]}>Almoço</Text>
          <View style={s.refeicaoRow}>
            <View style={s.itensLeft}>
              {dia.almoco.map((item: string, i: number) => (
                <Text key={i} style={s.itemTextLeft}>
                  {item}
                </Text>
              ))}
            </View>
            <View style={s.iconsColumn}>
              <TouchableOpacity onPress={() => compartilhar("Almoço", dia.almoco)}>
                <MaterialIcons name="share" size={20} color={TEXTO_FORTE} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleFav("almoco")}>
                <MaterialIcons
                  name={favAlmoco ? "favorite" : "favorite-border"}
                  size={20}
                  color={favAlmoco ? "#c62828" : TEXTO_FORTE}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Linha Divisória */}
          <View style={s.linhaDivisoria} />

          {/* ── JANTA ── */}
          <Text style={[s.refeicaoTituloLeft, !isHoje && { color: TEXTO_FORTE }]}>Janta</Text>
          <View style={s.refeicaoRow}>
            <View style={s.iconsColumn}>
              <TouchableOpacity onPress={() => compartilhar("Janta", dia.janta)}>
                <MaterialIcons name="share" size={20} color={TEXTO_FORTE} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleFav("janta")}>
                <MaterialIcons
                  name={favJanta ? "favorite" : "favorite-border"}
                  size={20}
                  color={favJanta ? "#c62828" : TEXTO_FORTE}
                />
              </TouchableOpacity>
            </View>
            <View style={s.itensRight}>
              {dia.janta.map((item: string, i: number) => (
                <Text key={i} style={s.itemTextRight}>
                  {item}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </Shadow>
    </View>
  );
}

// ──────────────────────────────────────────────
// Tela Principal
// ──────────────────────────────────────────────
export default function CardapioScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [paginaAtual, setPaginaAtual] = useState(0);

  const diaAtual = new Date().getDay();

  const CARD_W_MOB = width - PADDING_H_MOB - CARD_PEEK;
  const SNAP_INTERVAL = CARD_W_MOB + CARD_GAP_MOB;

  useEffect(() => {
    const indexHoje = cardapioSemana.findIndex((d) => d.id === diaAtual);
    if (indexHoje !== -1) {
      setPaginaAtual(indexHoje);
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: indexHoje * SNAP_INTERVAL,
          animated: true,
        });
      }, 300);
    }
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pagina = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    setPaginaAtual(pagina);
  };

  const irParaDia = (idx: number) =>
    scrollRef.current?.scrollTo({ x: idx * SNAP_INTERVAL, animated: true });

  const handleVoltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/menu");
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* ── Cabeçalho ── */}
        <View style={s.headerWrap}>
          <Shadow
            distance={1}
            startColor="#22222228"
            offset={[1, 4]}
            style={{ borderRadius: 8 }}
            containerStyle={{ marginTop: 5 }}
          >
            <TouchableOpacity style={s.voltarBtn} onPress={handleVoltar} activeOpacity={0.8}>
              <MaterialIcons name="arrow-back" size={20} color="#fff" />
              <Text style={s.voltarText}>Voltar</Text>
            </TouchableOpacity>
          </Shadow>

          <View style={s.titleArea}>
            <Text style={s.titulo}>Cardápio da{"\n"}Semana</Text>
            <Text style={s.subtitulo}>Semana {"{data da semana}"}</Text>
          </View>
        </View>

        {/* ── Pílulas dos Dias ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, maxHeight: 50 }}
          contentContainerStyle={s.diasNav}
        >
          {cardapioSemana.map((dia, idx) => {
            const isAtivo = paginaAtual === idx;
            const isHoje = dia.id === diaAtual;

            return (
              <TouchableOpacity
                key={dia.id}
                style={[
                  s.diaBtn,
                  isAtivo ? s.diaBtnAtivo : s.diaBtnInativo,
                  isHoje && !isAtivo && s.diaBtnHoje,
                ]}
                onPress={() => irParaDia(idx)}
                activeOpacity={0.8}
              >
                <Text style={[s.diaBtnNome, isHoje && !isAtivo && s.diaBtnNomeHoje]}>
                  {dia.nomeCurto}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Carrossel de Cards ── */}
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
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {cardapioSemana.map((dia) => {
              const isHoje = dia.id === diaAtual;
              return (
                <CardDia key={dia.id} dia={dia} width={CARD_W_MOB} isHoje={isHoje} />
              );
            })}
          </ScrollView>
        </View>

        {/* ── Paginação (Bolinhas) ── */}
        <View style={s.paginacao}>
          {cardapioSemana.map((_, idx) => (
            <View key={idx} style={[s.dot, paginaAtual === idx && s.dotAtivo]} />
          ))}
        </View>
      </ScrollView>

      {/* ── Rodapé Fixo ── */}
      <View style={s.footerBlock}>
        <Image
          source={require("../../assets/images/logo-ifrs.png")}
          style={s.logoFooter}
          resizeMode="contain"
        />
        <Text style={s.footerTexto}>
          Análise e Desenvolvimento de Sistemas <Text style={{ color: VERDE_MID }}>2026</Text>
        </Text>
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
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 40 : 50,
  },
  headerWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: PADDING_H_MOB,
    marginBottom: 20,
  },
  voltarBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: VERDE_MID,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  voltarText: {
    color: "#fff",
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
    color: TEXTO_FORTE,
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
    backgroundColor: CINZA_INATIVO,
  },
  diaBtnAtivo: {
    backgroundColor: VERDE_MID,
    borderColor: VERDE_MID,
  },
  diaBtnHoje: {
    backgroundColor: "#fff",
    borderColor: VERDE_MID,
  },
  diaBtnNome: {
    color: "#fff",
    fontFamily: "InterBold",
    fontSize: 14,
  },
  diaBtnNomeHoje: {
    color: VERDE_MID,
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
    color: TEXTO_FORTE,
  },
  diaTituloExtensoHoje: {
    color: VERDE_MID,
    fontSize: 22,
    fontFamily: "InterBlack",
  },
  badgeHoje: {
    backgroundColor: DESTAQUE_HOJE,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeHojeTexto: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "InterBold",
    letterSpacing: 0.5,
  },
  bigCard: {
    backgroundColor: CINZA_BG_CARD,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#d4e0d4",
  },
  bigCardHoje: {
    backgroundColor: "#fff",
    borderColor: VERDE_MID,
    borderWidth: 2.5,
  },
  linhaDivisoria: {
    height: 1,
    backgroundColor: CINZA_LINHA,
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
    color: VERDE_MID,
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
    color: TEXTO_FORTE,
    textAlign: "left",
    lineHeight: 20,
  },
  refeicaoTituloLeft: {
    fontSize: 22,
    fontFamily: "InterBlack",
    color: VERDE_MID,
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
    color: TEXTO_FORTE,
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
    backgroundColor: "#fff",
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