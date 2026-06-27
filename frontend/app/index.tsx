import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { useAuth } from "../src/contexts/AuthContext";
import { Redirect } from "expo-router";
import { Shadow } from "react-native-shadow-2";

// ──────────────────────────────────────────────
// Paleta
// ──────────────────────────────────────────────
const VERDE_DARK = "#1e6e24";
const VERDE_MID = "#2e7d32";
const TEXTO_FORTE = "#1a1a1a";
const TEXTO_SUAVE = "#8a9a8a";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Por favor, preencha o e-mail e a senha.");
      return;
    }
    try {
      await login(email, password);
    } catch (error: any) {
      console.log("ERRO REAL:", error);
      alert("Usuário ou senha incorretos.");
    }
  };

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/menu" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={s.container}
    >
      <Image
        source={require("../assets/images/logo-ifrs-watermark.png")}
        style={s.decorWatermark}
        resizeMode="contain"
        blurRadius={8}
      />

      <ScrollView
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cabeçalho ── */}
        <View style={s.headerWrap}>
          <Text style={s.title}>REFEITÓRIO{"\n"}IFRS</Text>
          <Text style={s.subtitle}>CAMPUS BENTO GONÇALVES</Text>
        </View>

        {/* ── Card de Login ── */}
        <Shadow
          distance={1}
          startColor="#00000015"
          offset={[0, 6]}
          style={{ width: "100%", borderRadius: 16 }}
          containerStyle={{ width: "100%", marginTop: 80 }}
        >
          <View style={s.card}>
            <Text style={s.cardTitle}>Entre com sua conta</Text>

            <TextInput
              style={s.input}
              placeholder="E-mail"
              placeholderTextColor={TEXTO_SUAVE}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={s.input}
              placeholder="Senha"
              placeholderTextColor={TEXTO_SUAVE}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Shadow
              distance={1}
              startColor="#52525256"
              offset={[0, 3]}
              style={{ width: "100%", borderRadius: 10 }}
              containerStyle={{ width: "100%", marginTop: 6 }}
            >
              <TouchableOpacity
                style={s.button}
                onPress={handleLogin}
                activeOpacity={0.85}
              >
                <Text style={s.buttonText}>Continuar</Text>
              </TouchableOpacity>
            </Shadow>
          </View>
        </Shadow>

        {/* ── Espaçador Flexível ── */}
        <View style={{ flex: 1, minHeight: 40 }} />

        {/* ── Rodapé ── */}
        <View style={s.footerWrap}>
          <Image
            source={require("../assets/images/logo-ifrs.png")}
            style={s.logoFooter}
            resizeMode="contain"
          />
          <Text style={s.footer}>
            Análise e Desenvolvimento de Sistemas{" "}
            <Text style={{ color: VERDE_MID }}>2026</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ──────────────────────────────────────────────
// Estilos
// ──────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 100,
  },
  decorWatermark: {
    position: "absolute",
    bottom: "22%",
    right: -160,
    width: 480,
    height: 480,
    opacity: 0.7,
  },
  headerWrap: {
    marginBottom: 60,
  },
  title: {
    fontSize: 52,
    fontFamily: "InterBlack",
    color: VERDE_DARK,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "InterSemiBold",
    color: TEXTO_FORTE,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: "InterRegular",
    color: TEXTO_FORTE,
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fafafa",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 14,
    color: TEXTO_FORTE,
  },
  button: {
    backgroundColor: VERDE_MID,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "InterSemiBold",
  },
  footerWrap: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "transparent",
  },
  logoFooter: {
    width: 240,
    height: 80,
    marginBottom: 2,
  },
  footer: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    fontFamily: "InterBold",
  },
});
