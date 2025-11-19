import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Registro = {
  dia: string;
  valor: number;
};

const coresBotoes = ["#FF6B6B", "#FFB86B", "#FFD93D", "#6BCB77", "#4D96FF"];

export default function HomeScreen() {
  const [valorHoje, setValorHoje] = useState<number | null>(null);
  const [historico, setHistorico] = useState<Registro[]>([]);

  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const data = await AsyncStorage.getItem("registros");
    if (data) {
      const registros: Registro[] = JSON.parse(data);
      setHistorico(registros);
      const hojeRegistro = registros.find((r) => r.dia === hoje);
      if (hojeRegistro) setValorHoje(hojeRegistro.valor);
    }
  }

  async function salvarValor() {
    if (!valorHoje) return;

    const novoHist = [
      ...historico.filter((item) => item.dia !== hoje),
      { dia: hoje, valor: valorHoje },
    ].sort((a, b) => (a.dia > b.dia ? 1 : -1));

    setHistorico(novoHist);
    await AsyncStorage.setItem("registros", JSON.stringify(novoHist));
  }

  function mediaSemana() {
    const ultimos7 = historico.slice(-7);
    if (ultimos7.length === 0) return "0";
    return (
      ultimos7.reduce((s, i) => s + Number(i.valor), 0) / ultimos7.length
    ).toFixed(1);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>DataWork – Registro Diário</Text>

      <Text style={styles.subtitle}>Como você está hoje?</Text>

      <View style={styles.buttonsRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => setValorHoje(n)}
            style={[
              styles.numberButton,
              { backgroundColor: coresBotoes[n - 1] },
              valorHoje === n && styles.numberButtonSelected,
            ]}
          >
            <Text style={styles.numberText}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Salvar Hoje" onPress={salvarValor} />

      {/* Média da semana */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Média da semana:</Text>
        <Text style={styles.sectionContent}>{mediaSemana()}</Text>
      </View>

      {/* Histórico */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimos registros:</Text>
        {historico.length === 0 ? (
          <Text style={styles.sectionContent}>Nenhum registro ainda.</Text>
        ) : (
          historico
            .slice()
            .reverse()
            .map((item) => (
              <Text key={item.dia} style={styles.listItem}>
                {item.dia}: {item.valor}
              </Text>
            ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { marginTop: 20, fontSize: 16 },
  buttonsRow: { flexDirection: "row", marginVertical: 15, justifyContent: "space-between" },
  numberButton: {
    padding: 15,
    borderRadius: 8,
    width: 50,
    alignItems: "center",
  },
  numberButtonSelected: {
    borderWidth: 3,
    borderColor: "#000",
  },
  numberText: { fontSize: 18, color: "#fff", fontWeight: "bold" },
  section: { marginTop: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  sectionContent: { fontSize: 16, marginTop: 5 },
  listItem: { padding: 5, fontSize: 16 },
});
