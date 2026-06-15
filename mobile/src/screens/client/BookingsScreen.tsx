import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  PENDING: 'Pendente',
  ACCEPTED: 'Aceito',
};

export function BookingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientRootParamList>>();
  const [tab, setTab] = useState<Tab>('active');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    requestService.getMyRequests().then(setRequests).catch(() => {});
  }, []);

  const filtered = requests.filter((r) => {
    if (tab === 'active') return ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(r.status);
    if (tab === 'completed') return r.status === 'COMPLETED';
    return r.status === 'CANCELLED';
  });

  const displayData = filtered;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.pageTitle}>Meus Serviços</Text>

      <View style={styles.tabs}>
        {(['active', 'completed', 'cancelled'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'active' ? 'Em andamento' : t === 'completed' ? 'Concluídos' : 'Cancelados'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Avatar name={item.providerName ?? item.title} avatarUrl={(item as any).providerAvatarUrl} size={46} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.providerName ?? item.title}</Text>
                <Text style={styles.cardCategory}>{item.title} · {item.category}</Text>
                <Text style={styles.cardDate}>{item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString('pt-BR') : new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] ?? Colors.textMuted) + '22' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] ?? Colors.textMuted }]}>
                  {STATUS_LABELS[item.status] ?? item.status}
                </Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              {item.status === 'COMPLETED' ? (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('ReviewService', { requestId: item.id, providerName: item.providerName ?? 'Prestador' })}
                >
                  <Text style={styles.actionBtnText}>Avaliar</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('Tracking', { requestId: item.id, providerName: item.providerName ?? undefined })}
                >
                  <Text style={styles.actionBtnText}>Acompanhar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.actionBtnOutline}
                onPress={() => navigation.navigate('Chat', { requestId: item.id, providerName: item.providerName ?? 'Prestador' })}
              >
                <Text style={styles.actionBtnOutlineText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum serviço encontrado</Text>
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
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: Colors.white },
  cardCategory: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  cardDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    height: 36,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  actionBtnOutline: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnOutlineText: { color: Colors.textSecondary, fontSize: 13 },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
});
