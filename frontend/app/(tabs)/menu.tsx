import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";
import { Shadow } from "react-native-shadow-2";

// ──────────────────────────────────────────────
// Paleta de Cores
// ──────────────────────────────────────────────
const VERDE_DARK = "#1b5e20";
const VERDE_MID = "#007A1B";
const VERMELHO = "#c62828";
const TEXTO_FORTE = "#333333";

export default function MenuScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const lidarComLogout = async () => {
    await logout();
    router.replace("/");
  };

  // Extrai o primeiro nome do usuário
  const nome = (user as any)?.name
    ? (user as any).name.split(" ")[0]
    : ((user as any)?.email?.split("@")[0] ?? "Aluno");

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Faixa Branca Superior ── */}
      <View style={s.topoBranco}>
        <Text style={s.headerTitle}>REFEITÓRIO{"\n"}IFRS</Text>
        <Image
          source={require("../../assets/images/logo-ifrs-branco.png")}
          style={s.logoTopo}
          resizeMode="contain"
        />
      </View>

      {/* ── Área Verde Central ── */}
      <View style={s.areaVerde}>
        <Text style={s.saudacao}>
          Olá, seja bem vindo{"\n"}
          {nome}!
        </Text>

        {/* ── Botões de Serviço ── */}
        <View style={s.areaServicos}>
          <Shadow
            distance={1}
            startColor="#1d5807"
            offset={[6, 8]}
            style={{ width: "100%", borderRadius: 12 }}
            containerStyle={{ width: "100%" }}
          >
            <TouchableOpacity
              style={s.btnBranco}
              onPress={() => router.push("/(tabs)/cardapio")}
              activeOpacity={0.85}
            >
              <Text style={s.btnBrancoTexto}>Cardápio Semanal</Text>
            </TouchableOpacity>
          </Shadow>
        </View>

        {/* ── Botão Sair ── */}
        <Shadow
          distance={1}
          startColor="#00000040"
          offset={[0, 4]}
          style={{ width: "100%", borderRadius: 12 }}
          containerStyle={{
            width: "60%",
            alignSelf: "center",
            marginBottom: 30,
          }}
        >
          <TouchableOpacity
            style={s.btnSair}
            onPress={lidarComLogout}
            activeOpacity={0.85}
          >
            <Text style={s.btnSairTexto}>Sair da conta</Text>
            <MaterialIcons name="logout" size={20} color="#fff" />
          </TouchableOpacity>
        </Shadow>
      </View>

      {/* ── Rodapé Branco ── */}
      <View style={s.rodapeBranco}>
        <Image
          source={require("../../assets/images/logo-ifrs.png")}
          style={s.logoFooter}
          resizeMode="contain"
        />
        <Text style={s.textoRodape}>
          Análise e Desenvolvimento de Sistemas{" "}
          <Text style={{ color: VERDE_MID }}>2026</Text>
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
    backgroundColor: VERDE_MID,
  },
  topoBranco: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 42,
    fontFamily: "InterBlack",
    color: VERDE_DARK,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  logoTopo: {
    width: 100,
    height: 100,
  },
  areaVerde: {
    flex: 1,
    paddingHorizontal: 24,
  },
  saudacao: {
    fontSize: 32,
    fontFamily: "InterBold",
    color: "#fff",
    lineHeight: 32,
    marginTop: 30,
  },
  areaServicos: {
    flex: 1,
    paddingVertical: 36,
    alignItems: "center",
  },
  btnBranco: {
    backgroundColor: "#fff",
    width: "100%",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnBrancoTexto: {
    fontSize: 18,
    fontFamily: "InterSemiBold",
    color: TEXTO_FORTE,
  },
  btnSair: {
    backgroundColor: VERMELHO,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    width: "100%",
    borderRadius: 12,
    gap: 10,
  },
  btnSairTexto: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "InterSemiBold",
  },
  rodapeBranco: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
  },
  logoFooter: {
    width: 240,
    height: 80,
    marginBottom: 2,
  },
  textoRodape: {
    color: "#666",
    fontSize: 12,
    fontFamily: "InterBold",
  },
});
