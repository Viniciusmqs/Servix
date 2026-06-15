import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Linking } from 'react-native';
import { Colors } from '../../constants/colors';
import { requestService } from '../../services/request.service';
import { ServiceRequest } from '../../types/models';
import { ClientRootParamList } from '../../navigation/ClientNavigator';

type Props = {
  navigation: NativeStackNavigationProp<ClientRootParamList, 'Tracking'>;
  route: RouteProp<ClientRootParamList, 'Tracking'>;
};

const STATUS_TIMELINE: Record<string, { label: string; desc: string }[]> = {
  PENDING: [
    { label: 'Aguardando', desc: 'Aguardando prestador aceitar' },
    { label: 'Em andamento', desc: 'Profissional a caminho' },
    { label: 'Concluído', desc: 'Serviço finalizado' },
  ],
  ACCEPTED: [
    { label: 'Agendado', desc: 'Contratação confirmada' },
    { label: 'Em andamento', desc: 'Profissional a caminho' },
    { label: 'Concluído', desc: 'Serviço finalizado' },
  ],
  IN_PROGRESS: [
    { label: 'Agendado', desc: 'Contratação confirmada' },
    { label: 'Em andamento', desc: 'Profissional a caminho' },
    { label: 'Concluído', desc: 'Serviço finalizado' },
  ],
  COMPLETED: [
    { label: 'Agendado', desc: 'Contratação confirmada' },
    { label: 'Em andamento', desc: 'Profissional em execução' },
    { label: 'Concluído', desc: 'Serviço finalizado' },
  ],
};

function getTimelineState(status: string) {
  const steps = STATUS_TIMELINE[status] ?? STATUS_TIMELINE.ACCEPTED;
  const doneIndex = status === 'COMPLETED' ? 3 : status === 'IN_PROGRESS' ? 1 : status === 'ACCEPTED' ? 0 : 0;
  const activeIndex = status === 'COMPLETED' ? -1 : status === 'IN_PROGRESS' ? 1 : status === 'ACCEPTED' ? 1 : 0;
  return steps.map((s, i) => ({
    ...s,
    done: i < doneIndex,
    active: i === activeIndex,
  }));
}

export function TrackingScreen({ navigation, route }: Props) {
  const { requestId, providerName: paramProviderName } = route.params;
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestService.getById(requestId)
      .then(setRequest)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [requestId]);

  const providerName = request?.providerName ?? paramProviderName ?? 'Prestador';
  const timeline = getTimelineState(request?.status ?? 'ACCEPTED');

  const handleCancel = () => {
    Alert.alert('Cancelar serviço', 'Tem certeza que deseja cancelar?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await requestService.cancel(requestId);
          } catch {}
          navigation.navigate('Tabs');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acompanhar serviço</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.providerCard}>
            <View style={styles.providerInfo}>
              <View style={styles.providerAvatar}>
                <Text style={styles.providerAvatarText}>{providerName[0]?.toUpperCase() ?? 'P'}</Text>
              </View>
              <View>
                <Text style={styles.providerName}>{providerName}</Text>
                <Text style={styles.providerSpecialty}>{request?.category ?? 'Serviço'}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => navigation.navigate('Chat', { requestId, providerName })}
            >
              <Ionicons name="chatbubble" size={18} color={Colors.primary} />
              <Text style={styles.chatBtnText}>Chat</Text>
            </TouchableOpacity>
          </View>

          {request && (
            <View style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>{request.title}</Text>
              <Text style={styles.serviceAddress}>📍 {request.address}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.mapPlaceholder}
            onPress={() => {
              const addr = request?.address ?? '';
              const encoded = encodeURIComponent(addr);
              Linking.openURL(`maps://?q=${encoded}`).catch(() =>
                Linking.openURL(`https://maps.google.com/?q=${encoded}`)
              );
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.mapIcon}>🗺️</Text>
            <Text style={styles.mapText}>{request?.address ?? 'Endereço do serviço'}</Text>
            <View style={styles.mapOpenBtn}>
              <Ionicons name="navigate" size={14} color={Colors.primary} />
              <Text style={styles.mapOpenText}>Abrir no Mapa</Text>
            </View>
          </TouchableOpacity>

          {request?.status === 'IN_PROGRESS' && (
            <View style={styles.statusCard}>
              <Text style={styles.statusIcon}>📍</Text>
              <Text style={styles.statusText}>{providerName.split(' ')[0]} está a caminho</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Status do serviço</Text>
          <View style={styles.timeline}>
            {timeline.map((step, i) => (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineDot,
                      step.done && styles.timelineDotDone,
                      step.active && styles.timelineDotActive,
                    ]}
                  >
                    {step.done && <Text style={styles.dotCheck}>✓</Text>}
                  </View>
                  {i < timeline.length - 1 && (
                    <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      step.active && styles.timelineLabelActive,
                      step.done && styles.timelineLabelDone,
                    ]}
                  >
                    {step.label}
                  </Text>
                  <Text style={styles.timelineDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {request?.status !== 'COMPLETED' && request?.status !== 'CANCELLED' && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancelar serviço</Text>
            </TouchableOpacity>
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.white },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  providerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  providerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerAvatarText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  providerName: { fontSize: 15, fontWeight: '600', color: Colors.white },
  providerSpecialty: { fontSize: 12, color: Colors.textMuted },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  chatBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  serviceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  serviceTitle: { fontSize: 14, fontWeight: '600', color: Colors.white },
  serviceAddress: { fontSize: 12, color: Colors.textMuted },
  mapPlaceholder: {
    height: 160,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  mapIcon: { fontSize: 40 },
  mapText: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', paddingHorizontal: 16 },
  mapOpenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  mapOpenText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  statusIcon: { fontSize: 20 },
  statusText: { color: Colors.white, fontSize: 14, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: 16 },
  timeline: { marginBottom: 24 },
  timelineItem: { flexDirection: 'row', gap: 14, marginBottom: 4 },
  timelineLeft: { alignItems: 'center', width: 24 },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  timelineDotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dotCheck: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.border, marginVertical: 4, minHeight: 32 },
  timelineLineDone: { backgroundColor: Colors.success },
  timelineContent: { flex: 1, paddingBottom: 24 },
  timelineLabel: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  timelineLabelActive: { color: Colors.primary },
  timelineLabelDone: { color: Colors.success },
  timelineDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  cancelBtn: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
});
