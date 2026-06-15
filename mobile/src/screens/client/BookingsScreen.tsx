import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { requestService } from '../../services/request.service';
import { ServiceRequest } from '../../types/models';
import { ClientRootParamList } from '../../navigation/ClientNavigator';
import { Avatar } from '../../components/Avatar';

type Tab = 'active' | 'completed' | 'cancelled';

const STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS: Colors.primary,
  COMPLETED: Colors.success,
  CANCELLED: Colors.error,
  PENDING: Colors.warning,
  ACCEPTED: Colors.secondary,
};

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  PENDING: 'Aguardando',
  ACCEPTED: 'Aceito',
};

export function BookingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientRootParamList>>();
  const [tab, setTab] = useState<Tab>('active');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => requestService.getMyRequests().then(setRequests).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const TABS: [Tab, string][] = [
    ['active', 'Em andamento'],
    ['completed', 'Concluídos'],
    ['cancelled', 'Cancelados'],
  ];

  const filtered = requests.filter((r) => {
    if (tab === 'active') return ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(r.status);
    if (tab === 'completed') return r.status === 'COMPLETED';
    return r.status === 'CANCELLED';
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.pageTitle}>Meus Serviços</Text>

      <View style={styles.tabs}>
        {TABS.map(([t, label]) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
        renderItem={({ item }) => {
          const statusColor = STATUS_COLORS[item.status] ?? Colors.textMuted;
          const hasProvider = !!item.providerId;
          const isActive = ['ACCEPTED', 'IN_PROGRESS'].includes(item.status);
          const isCompleted = item.status === 'COMPLETED';
          const displayDate = item.scheduledAt
            ? new Date(item.scheduledAt).toLocaleDateString('pt-BR')
            : new Date(item.createdAt).toLocaleDateString('pt-BR');

          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Avatar name={item.providerName ?? item.title} size={46} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>
                    {item.providerName ?? 'Aguardando prestador'}
                  </Text>
                  <Text style={styles.cardCategory}>{item.title} · {item.category}</Text>
                  <Text style={styles.cardDate}>{displayDate}</Text>
                  {item.budgetMax != null && (
                    <Text style={styles.cardBudget}>
                      R$ {item.budgetMin?.toFixed(0)} – R$ {item.budgetMax?.toFixed(0)}
                    </Text>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                {isCompleted && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() =>
                      navigation.navigate('ReviewService', {
                        requestId: item.id,
                        providerName: item.providerName ?? 'Prestador',
                      })
                    }
                  >
                    <Ionicons name="star-outline" size={14} color={Colors.white} />
                    <Text style={styles.actionBtnText}>Avaliar</Text>
                  </TouchableOpacity>
                )}

                {isActive && hasProvider && (
                  <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() =>
                      navigation.navigate('Payment', {
                        requestId: item.id,
                        amount: item.budgetMax ?? item.budgetMin ?? 250,
                        providerName: item.providerName,
                      } as any)
                    }
                  >
                    <Ionicons name="card-outline" size={14} color={Colors.white} />
                    <Text style={styles.payBtnText}>Pagar</Text>
                  </TouchableOpacity>
                )}

                {!isCompleted && (
                  <TouchableOpacity
                    style={styles.actionBtnOutline}
                    onPress={() =>
                      navigation.navigate('Tracking', {
                        requestId: item.id,
                        providerName: item.providerName ?? undefined,
                      })
                    }
                  >
                    <Text style={styles.actionBtnOutlineText}>Acompanhar</Text>
                  </TouchableOpacity>
                )}

                {hasProvider && (
                  <TouchableOpacity
                    style={styles.chatBtnOutline}
                    onPress={() =>
                      navigation.navigate('Chat', {
                        requestId: item.id,
                        providerName: item.providerName ?? 'Prestador',
                      })
                    }
                  >
                    <Ionicons name="chatbubble-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.actionBtnOutlineText}>Chat</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="list-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>
              {tab === 'active'
                ? 'Nenhum serviço em andamento'
                : tab === 'completed'
                ? 'Nenhum serviço concluído'
                : 'Nenhum serviço cancelado'}
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
    paddingBottom: 16,
  },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 12, color: Colors.textMuted },
  tabTextActive: { color: Colors.white, fontWeight: '600' },
  list: { paddingHorizontal: 20, gap: 12, paddingBottom: 20 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: Colors.white },
  cardCategory: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  cardDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  cardBudget: { fontSize: 12, color: Colors.success, marginTop: 2, fontWeight: '500' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 2 },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 14,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    gap: 5,
  },
  actionBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 14,
    backgroundColor: Colors.success,
    borderRadius: 8,
    gap: 5,
  },
  payBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 5,
  },
  chatBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 5,
  },
  actionBtnOutlineText: { color: Colors.textMuted, fontSize: 13 },
  empty: { paddingTop: 60, alignItems: 'center', gap: 12 },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
});
