import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { requestService } from '../../services/request.service';
import { paymentService } from '../../services/payment.service';
import { ServiceRequest } from '../../types/models';

type Transaction = {
  id: string;
  desc: string;
  client: string;
  value: number;
  date: string;
  type: 'credit';
};

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function startOfWeek(): Date {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function EarningsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [thisWeek, setThisWeek] = useState(0);
  const [thisMonth, setThisMonth] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadEarnings = async () => {
    const received = await requestService.getReceivedRequests();
    const completed = received.filter((r) => r.status === 'COMPLETED');

    const weekStart = startOfWeek();
    const monthStart = startOfMonth();

    let totalVal = 0;
    let weekVal = 0;
    let monthVal = 0;
    const txns: Transaction[] = [];

    completed.forEach((r) => {
      const value = r.budgetMax ?? r.budgetMin ?? 0;
      const date = new Date(r.updatedAt ?? r.createdAt);
      totalVal += value;
      if (date >= weekStart) weekVal += value;
      if (date >= monthStart) monthVal += value;
      txns.push({
        id: r.id,
        desc: r.title,
        client: r.clientName ?? 'Cliente',
        value,
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        type: 'credit',
      });
    });

    txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setTotal(totalVal);
    setThisWeek(weekVal);
    setThisMonth(monthVal);
    setTotalServices(completed.length);
    setTransactions(txns);
  };

  useEffect(() => {
    loadEarnings().catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEarnings().catch(() => {});
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Text style={styles.pageTitle}>Ganhos</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.secondary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.secondary} />}
      >
        <Text style={styles.pageTitle}>Ganhos</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total acumulado</Text>
          <Text style={styles.balanceValue}>{formatBRL(total)}</Text>
          <TouchableOpacity
            style={styles.withdrawBtn}
            onPress={async () => {
              if (total <= 0) {
                Alert.alert('Saldo insuficiente', 'Você não possui ganhos para sacar ainda.');
                return;
              }
              try {
                const pref = await paymentService.createPreference(
                  'saque-teste',
                  'Saque Servix - teste API',
                  total
                );
                const url = pref.sandboxInitPoint || pref.initPoint;
                Alert.alert(
                  '✅ API MercadoPago OK',
                  `Preferência: ${pref.preferenceId}\n\nAbre sandbox para confirmar o fluxo de pagamento.`,
                  [
                    { text: 'Fechar', style: 'cancel' },
                    { text: 'Abrir Checkout', onPress: () => Linking.openURL(url) },
                  ]
                );
              } catch (e: any) {
                const msg = e?.response?.data?.message ?? e?.message ?? 'Erro desconhecido';
                Alert.alert('Erro na API', `${msg}\n\nVerifique MP_ACCESS_TOKEN no servidor.`);
              }
            }}
          >
            <Ionicons name="arrow-down-circle-outline" size={18} color={Colors.white} />
            <Text style={styles.withdrawBtnText}>Solicitar saque</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatBRL(thisWeek)}</Text>
            <Text style={styles.statLabel}>Esta semana</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatBRL(thisMonth)}</Text>
            <Text style={styles.statLabel}>Este mês</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>{totalServices}</Text>
            <Text style={styles.statLabel}>Serviços</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Serviços concluídos</Text>

        {transactions.length === 0 ? (
          <View style={styles.emptyTransactions}>
            <Ionicons name="wallet-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyTransactionsText}>Nenhum serviço concluído ainda</Text>
            <Text style={styles.emptyTransactionsSub}>
              Aceite pedidos para começar a ganhar
            </Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((t) => (
              <View key={t.id} style={styles.transactionItem}>
                <View style={styles.creditIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDesc}>{t.desc}</Text>
                  <Text style={styles.transactionClient}>{t.client}</Text>
                  <Text style={styles.transactionDate}>{t.date}</Text>
                </View>
                <Text style={styles.creditValue}>{formatBRL(t.value)}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  balanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  balanceLabel: { fontSize: 14, color: Colors.textMuted, marginBottom: 8 },
  balanceValue: { fontSize: 36, fontWeight: '800', color: Colors.primary, marginBottom: 20 },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  withdrawBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { fontSize: 13, fontWeight: '700', color: Colors.secondary, textAlign: 'center' },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  transactionsList: { paddingHorizontal: 20, gap: 8 },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  creditIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: { flex: 1 },
  transactionDesc: { fontSize: 13, color: Colors.white, fontWeight: '600' },
  transactionClient: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  transactionDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  creditValue: { fontSize: 14, fontWeight: '700', color: Colors.success },
  emptyTransactions: { paddingVertical: 40, alignItems: 'center', gap: 8 },
  emptyTransactionsText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  emptyTransactionsSub: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', paddingHorizontal: 40 },
});
