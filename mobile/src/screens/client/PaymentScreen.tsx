import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Linking, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { ClientRootParamList } from '../../navigation/ClientNavigator';
import { paymentService } from '../../services/payment.service';

type Props = {
  navigation: NativeStackNavigationProp<ClientRootParamList, 'Payment'>;
  route: RouteProp<ClientRootParamList, 'Payment'>;
};

const SERVICE_VALUE = 250.0;
const PLATFORM_FEE = SERVICE_VALUE * 0.05;
const TOTAL = SERVICE_VALUE + PLATFORM_FEE;

export function PaymentScreen({ navigation, route }: Props) {
  const requestId = (route.params as any)?.requestId as string | undefined;
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'card' | 'pix' | 'boleto'>('card');

  const methods = [
    { id: 'card' as const, label: 'Cartão de crédito', icon: '💳' },
    { id: 'pix' as const, label: 'Pix', icon: '⚡' },
    { id: 'boleto' as const, label: 'Boleto bancário', icon: '📄' },
  ];

  const handlePay = async () => {
    try {
      setLoading(true);
      const pref = await paymentService.createPreference(
        requestId ?? 'demo',
        'Serviço Servix',
        TOTAL
      );
      // Abre o checkout do MercadoPago no navegador
      // Em sandbox usa sandboxInitPoint; em produção usa initPoint
      const url = pref.sandboxInitPoint || pref.initPoint;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        // Navega para confirmação enquanto o usuário completa o pagamento
        navigation.navigate('Confirmation', { requestId });
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o checkout de pagamento.');
      }
    } catch {
      // Se o backend não tiver credenciais válidas, continua mesmo assim (sandbox/demo)
      Alert.alert(
        'Pagamento em sandbox',
        'Configure MP_ACCESS_TOKEN no servidor para ativar pagamentos reais. Continuando em modo demo.',
        [{ text: 'OK', onPress: () => navigation.navigate('Confirmation', { requestId }) }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagamento</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Serviço</Text>
              <Text style={styles.summaryValue}>R$ {SERVICE_VALUE.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxa da plataforma (5%)</Text>
              <Text style={styles.summaryValue}>R$ {PLATFORM_FEE.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>R$ {TOTAL.toFixed(2)}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Forma de pagamento</Text>
          <View style={styles.methodsGrid}>
            {methods.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodCard, method === m.id && styles.methodCardActive]}
                onPress={() => setMethod(m.id)}
              >
                <Text style={styles.methodIcon}>{m.icon}</Text>
                <Text style={[styles.methodLabel, method === m.id && styles.methodLabelActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.mpBadge}>
            <Text style={styles.mpBadgeText}>🔒 Pagamento seguro via</Text>
            <Text style={styles.mpBadgeBrand}>MercadoPago</Text>
          </View>

          <View style={styles.mpInfo}>
            <Text style={styles.mpInfoText}>
              Ao confirmar, você será redirecionado para o checkout seguro do MercadoPago para concluir o pagamento.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.payBtn, loading && styles.payBtnDisabled]}
            onPress={handlePay}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.payBtnText}>Pagar R$ {TOTAL.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.white },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.textMuted, marginBottom: 12, marginTop: 8 },
  summaryCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 24,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { fontSize: 14, color: Colors.textMuted },
  summaryValue: { fontSize: 14, color: Colors.white, fontWeight: '500' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: Colors.white },
  totalValue: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  methodsGrid: { flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  methodCard: {
    flex: 1, minWidth: '28%', backgroundColor: Colors.surface, borderRadius: 12,
    padding: 14, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  methodCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '18' },
  methodIcon: { fontSize: 24 },
  methodLabel: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  methodLabelActive: { color: Colors.primary, fontWeight: '600' },
  mpBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginBottom: 12,
  },
  mpBadgeText: { color: Colors.textMuted, fontSize: 13 },
  mpBadgeBrand: { color: '#00B1EA', fontSize: 14, fontWeight: '700' },
  mpInfo: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
  mpInfoText: { fontSize: 13, color: Colors.textMuted, lineHeight: 20, textAlign: 'center' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: Colors.border },
  payBtn: {
    backgroundColor: Colors.primary, height: 54, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
