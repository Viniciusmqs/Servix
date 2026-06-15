import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { requestService } from '../../services/request.service';
import { ServiceRequest } from '../../types/models';
import { ProviderRootParamList } from '../../navigation/ProviderNavigator';

type Tab = 'new' | 'active' | 'done';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Novo',
  ACCEPTED: 'Aceito',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: Colors.warning,
  ACCEPTED: Colors.secondary,
  IN_PROGRESS: Colors.primary,
  COMPLETED: Colors.success,
  CANCELLED: Colors.error,
};

export function RequestsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProviderRootParamList>>();
  const [tab, setTab] = useState<Tab>('new');
  const [openRequests, setOpenRequests] = useState<ServiceRequest[]>([]);
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [open, my] = await Promise.allSettled([
      requestService.getOpenRequests(),
      requestService.getReceivedRequests(),
    ]);
    if (open.status === 'fulfilled') setOpenRequests(open.value);
    if (my.status === 'fulfilled') setMyRequests(my.value);
  }, []);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData().catch(() => {});
    setRefreshing(false);
  };

  const filtered: ServiceRequest[] =
    tab === 'new'
      ? openRequests
      : myRequests.filter((r) =>
          tab === 'active'
            ? ['ACCEPTED', 'IN_PROGRESS'].includes(r.status)
            : r.status === 'COMPLETED'
        );

  const TABS: [Tab, string, number][] = [
    ['new', 'Novos', openRequests.length],
    ['active', 'Em andamento', myRequests.filter((r) => ['ACCEPTED', 'IN_PROGRESS'].includes(r.status)).length],
    ['done', 'Concluídos', myRequests.filter((r) => r.status === 'COMPLETED').length],
  ];

  const handleQuickAccept = (item: ServiceRequest) => {
    Alert.alert(
      'Aceitar pedido',
      `Deseja aceitar "${item.title}" de ${item.clientName ?? 'cliente'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: async () => {
            try {
              await requestService.accept(item.id);
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

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Text style={styles.pageTitle}>Pedidos</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.secondary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.pageTitle}>Pedidos</Text>

      <View style={styles.tabs}>
        {TABS.map(([t, label, count]) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{label}</Text>
            {count > 0 && (
              <View style={[styles.badge, tab === t && styles.badgeActive]}>
                <Text style={[styles.badgeText, tab === t && styles.badgeTextActive]}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.secondary} />}
        renderItem={({ item }) => {
          const initial = (item.clientName ?? 'C')[0].toUpperCase();
          const statusColor = STATUS_COLORS[item.status] ?? Colors.textMuted;
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: Colors.primary + '33' }]}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardClient}>{item.clientName ?? 'Cliente'}</Text>
                  {item.address ? <Text style={styles.cardLocation}>📍 {item.address}</Text> : null}
                  <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {STATUS_LABEL[item.status] ?? item.status}
                  </Text>
                </View>
              </View>

              {item.budgetMax != null && (
                <View style={styles.budgetRow}>
                  <Ionicons name="cash-outline" size={14} color={Colors.success} />
                  <Text style={styles.budgetText}>
                    R$ {item.budgetMin?.toFixed(0)} – R$ {item.budgetMax?.toFixed(0)}
                  </Text>
                </View>
              )}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}
                >
                  <Text style={styles.viewBtnText}>Ver detalhes</Text>
                </TouchableOpacity>
                {tab === 'new' && (
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleQuickAccept(item)}
                  >
                    <Text style={styles.acceptBtnText}>Aceitar</Text>
                  </TouchableOpacity>
                )}
                {tab === 'active' && (
                  <TouchableOpacity
                    style={styles.activeBtn}
                    onPress={() => navigation.navigate('ServiceStatus', { requestId: item.id, clientName: item.clientName ?? 'Cliente' })}
                  >
                    <Text style={styles.activeBtnText}>Em andamento</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>
              {tab === 'new'
                ? 'Nenhum pedido novo disponível'
                : tab === 'active'
                ? 'Nenhum pedido em andamento'
                : 'Nenhum pedido concluído'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 8 },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 5,
  },
  tabActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  tabText: { fontSize: 11, color: Colors.textMuted },
  tabTextActive: { color: Colors.white, fontWeight: '600' },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  badgeText: { fontSize: 10, fontWeight: '700', color: Colors.textMuted },
  badgeTextActive: { color: Colors.white },
  list: { paddingHorizontal: 20, gap: 12, paddingBottom: 20 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.primary, fontSize: 18, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: Colors.white },
  cardClient: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  cardLocation: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  cardDate: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginTop: 2 },
  statusText: { fontSize: 10, fontWeight: '700' },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  budgetText: { fontSize: 12, color: Colors.success, fontWeight: '500' },
  cardActions: { flexDirection: 'row', gap: 10 },
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
  activeBtn: {
    flex: 1,
    height: 36,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  empty: { paddingTop: 60, alignItems: 'center', gap: 12 },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
});
