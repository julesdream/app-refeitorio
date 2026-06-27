import React, { useCallback, useMemo } from "react";
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
// CONSTANTS
// ──────────────────────────────────────────────
const COLORS = {
  verde_dark: "#1b5e20",
  verde_mid: "#007A1B",
  vermelho: "#c62828",
  texto_forte: "#333333",
  branco: "#fff",
} as const;

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────
interface Usuario {
  role: "ALUNO" | "SERVIDOR" | "ADMIN";
  name?: string;
  email?: string;
}

// ──────────────────────────────────────────────
// UTILITY FUNCTIONS
// ──────────────────────────────────────────────
function extrairPrimeiroNome(user: Usuario | null): string {
  if (!user) return "Aluno";

  if (user.name) {
    return user.name.split(" ")[0];
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "Aluno";
}

// ──────────────────────────────────────────────
// COMPONENTES
// ──────────────────────────────────────────────

interface TopoProps {}

function Topo({}: TopoProps) {
  return (
    <View style={s.topoBranco}>
      <Text style={s.headerTitle}>
        REFEITÓRIO{"\n"}IFRS
      </Text>
      <Image
        source={require("../../assets/images/logo-ifrs-branco.png")}
        style={s.logoTopo}
        resizeMode="contain"
      />
    </View>
  );
}

interface SaudacaoProps {
  nome: string;
}

function Saudacao({ nome }: SaudacaoProps) {
  return (
    <Text style={s.saudacao}>
      Olá, seja bem vindo{"\n"}
      {nome}!
    </Text>
  );
}

interface BotaoCardapioProps {
  onPress: () => void;
}

function BotaoCardapio({ onPress }: BotaoCardapioProps) {
  return (
    <Shadow
      distance={1}
      startColor="#1d5807"
      offset={[6, 8]}
      style={{ width: "100%", borderRadius: 12 }}
      containerStyle={{ width: "100%" }}
    >
      <TouchableOpacity
        style={s.btnBranco}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={s.btnBrancoTexto}>Cardápio Semanal</Text>
      </TouchableOpacity>
    </Shadow>
  );
}

interface BotaoCadastroProps {
  onPress: () => void;
}

function BotaoCadastro({ onPress }: BotaoCadastroProps) {
  return (
    <Shadow
      distance={1}
      startColor="#1d5807"
      offset={[6, 30]}
      style={{ width: "100%", borderRadius: 12, marginTop: 20 }}
      containerStyle={{ width: "100%" }}
    >
      <TouchableOpacity
        style={s.btnBranco}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={s.btnBrancoTexto}>Cadastrar Refeição</Text>
      </TouchableOpacity>
    </Shadow>
  );
}

interface BotaoSairProps {
  onPress: () => void;
}

function BotaoSair({ onPress }: BotaoSairProps) {
  return (
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
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={s.btnSairTexto}>Sair da conta</Text>
        <MaterialIcons name="logout" size={20} color={COLORS.branco} />
      </TouchableOpacity>
    </Shadow>
  );
}

interface RodapeProps {}

function Rodape({}: RodapeProps) {
  return (
    <View style={s.rodapeBranco}>
      <Image
        source={require("../../assets/images/logo-ifrs.png")}
        style={s.logoFooter}
        resizeMode="contain"
      />
      <Text style={s.textoRodape}>
        Análise e Desenvolvimento de Sistemas{" "}
        <Text style={{ color: COLORS.verde_mid }}>2026</Text>
      </Text>
    </View>
  );
}

// ──────────────────────────────────────────────
// TELA PRINCIPAL
// ──────────────────────────────────────────────
export default function MenuScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const nome = useMemo(() => extrairPrimeiroNome(user as Usuario | null), [user]);

  const isServidor = useMemo(() => {
    return user && (user as Usuario).role === "SERVIDOR";
  }, [user]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace("/");
  }, [logout, router]);

  const handleCardapio = useCallback(() => {
    router.push("/(tabs)/cardapio");
  }, [router]);

  const handleCadastro = useCallback(() => {
    router.push("/(tabs)/cadastroRefeicao");
  }, [router]);

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.branco} />

      {/* Topo Branco */}
      <Topo />

      {/* Área Verde Central */}
      <View style={s.areaVerde}>
        <Saudacao nome={nome} />

        {/* Botões de Serviço */}
        <View style={s.areaServicos}>
          <BotaoCardapio onPress={handleCardapio} />

          {isServidor && <BotaoCadastro onPress={handleCadastro} />}
        </View>

        {/* Botão Sair */}
        <BotaoSair onPress={handleLogout} />
      </View>

      {/* Rodapé Branco */}
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
    backgroundColor: COLORS.verde_mid,
  },
  topoBranco: {
    backgroundColor: COLORS.branco,
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
    color: COLORS.verde_dark,
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
    color: COLORS.branco,
    lineHeight: 32,
    marginTop: 30,
  },
  areaServicos: {
    flex: 1,
    paddingVertical: 36,
    alignItems: "center",
  },
  btnBranco: {
    backgroundColor: COLORS.branco,
    width: "100%",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnBrancoTexto: {
    fontSize: 18,
    fontFamily: "InterSemiBold",
    color: COLORS.texto_forte,
  },
  btnSair: {
    backgroundColor: COLORS.vermelho,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    width: "100%",
    borderRadius: 12,
    gap: 10,
  },
  btnSairTexto: {
    color: COLORS.branco,
    fontSize: 18,
    fontFamily: "InterSemiBold",
  },
  rodapeBranco: {
    backgroundColor: COLORS.branco,
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
