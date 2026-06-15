import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth.store';
import { requestService } from '../../services/request.service';
import { ServiceRequest } from '../../types/models';
import { ProviderRootParamList } from '../../navigation/ProviderNavigator';

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProviderHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProviderRootParamList>>();
  const user = useAuthStore((s) => s.user);
  const [openRequests, setOpenRequests] = useState<ServiceRequest[]>([]);
  const [received, setReceived] = useState<ServiceRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.name?.split(' ')[0] ?? 'você';

  const loadData = useCallback(async () => {
    const [open, my] = await Promise.allSettled([
      requestService.getOpenRequests(),
      requestService.getReceivedRequests(),
    ]);
    if (open.status === 'fulfilled') setOpenRequests(open.value);
    if (my.status === 'fulfilled') setReceived(my.value);
  }, []);

  useEffect(() => {
    loadData().catch(() => {});
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData().catch(() => {});
    setRefreshing(false);
  };

  const completed = received.filter((r) => r.status === 'COMPLETED');
  const active = received.filter((r) => ['ACCEPTED', 'IN_PROGRESS'].includes(r.status));
  const totalEarnings = completed.reduce((sum, r) => sum + (r.budgetMax ?? r.budgetMin ?? 0), 0);

  const STATS = [
    { label: 'Novas', value: openRequests.length.toString(), color: Colors.primary },
    { label: 'Ativas', value: active.length.toString(), color: Colors.secondary },
    { label: 'Ganhos', value: formatBRL(totalEarnings), color: Colors.warning },
  ];

  const todayRequests = active.filter((r) => {
    if (!r.scheduledAt) return false;
    const d = new Date(r.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const handleQuickAccept = (req: ServiceRequest) => {
    Alert.alert(
      'Aceitar pedido',
      `Deseja aceitar "${req.title}" de ${req.clientName ?? 'cliente'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: async () => {
            try {
              await requestService.accept(req.id);
              await loadData();
              Alert.alert('Aceito!', 'Pedido aceito com sucesso.');
            } catch {
              Alert.alert('Erro', 'Não foi possível aceitar o pedido.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.secondary} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {firstName} 🔧</Text>
            <Text style={styles.headerSub}>
              {todayRequests.length > 0
                ? `${todayRequests.length} serviço(s) hoje`
                : 'Agenda de hoje'}
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Novas solicitações</Text>
        {openRequests.length === 0 ? (
          <View style={styles.emptyRequests}>
            <Text style={styles.emptyText}>Nenhuma nova solicitação</Text>
          </View>
        ) : (
          openRequests.slice(0, 5).map((req) => (
            <View key={req.id} style={styles.requestCard}>
              <View style={styles.requestTop}>
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientAvatarText}>
                    {(req.clientName ?? 'C')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestTitle}>{req.title}</Text>
                  <Text style={styles.requestClient}>{req.clientName ?? 'Cliente'}</Text>
                  {req.address ? (
                    <Text style={styles.requestLocation}>📍 {req.address}</Text>
                  ) : null}
                  {req.budgetMax != null && (
                    <Text style={styles.requestBudget}>
                      R$ {req.budgetMin?.toFixed(0)} – R$ {req.budgetMax?.toFixed(0)}
                    </Text>
                  )}
                </View>
                <View style={styles.normalBadge}>
                  <Text style={styles.normalText}>Novo</Text>
                </View>
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => navigation.navigate('RequestDetail', { requestId: req.id })}
                >
                  <Text style={styles.viewBtnText}>Ver</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleQuickAccept(req)}
                >
                  <Text style={styles.acceptBtnText}>Aceitar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {openRequests.length > 5 && (
          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAllBtnText}>Ver todas ({openRequests.length})</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Agenda de hoje</Text>
        {todayRequests.length === 0 ? (
          <View style={styles.emptyRequests}>
            <Text style={styles.emptyText}>Nenhum agendamento para hoje</Text>
          </View>
        ) : (
          todayRequests.map((item) => {
            const time = item.scheduledAt
              ? new Date(item.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : '–';
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.scheduleCard}
                onPress={() => navigation.navigate('ServiceStatus', { requestId: item.id, clientName: item.clientName ?? 'Cliente' })}
              >
                <View style={styles.scheduleTime}>
                  <Text style={styles.scheduleTimeText}>{time}</Text>
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleService}>{item.title}</Text>
                  <Text style={styles.scheduleClient}>{item.clientName ?? 'Cliente'}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  greeting: { fontSize: 20, fontWeight: '700', color: Colors.white },
  headerSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  requestCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requestTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientAvatarText: { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  requestInfo: { flex: 1 },
  requestTitle: { fontSize: 14, fontWeight: '600', color: Colors.white },
  requestClient: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  requestLocation: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  requestBudget: { fontSize: 12, color: Colors.success, marginTop: 2, fontWeight: '500' },
  normalBadge: {
    backgroundColor: Colors.secondary + '22',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  normalText: { color: Colors.secondary, fontSize: 11, fontWeight: '600' },
  requestActions: { flexDirection: 'row', gap: 10 },
  viewBtn: {
    flex: 1,
    height: 36,
    backgroundColor: Colors.primary + '22',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  viewBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  acceptBtn: {
    flex: 1,
    height: 36,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  seeAllBtn: {
    marginHorizontal: 20,
    marginBottom: 16,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAllBtnText: { color: Colors.textMuted, fontSize: 13 },
  emptyRequests: { padding: 20, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  scheduleTime: { width: 52, alignItems: 'center' },
  scheduleTimeText: { fontSize: 14, fontWeight: '700', color: Colors.secondary },
  scheduleInfo: {},
  scheduleService: { fontSize: 14, fontWeight: '600', color: Colors.white },
  scheduleClient: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
});
