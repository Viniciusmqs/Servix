import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

interface Notification {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  date: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', icon: '✅', title: 'Serviço confirmado', subtitle: 'Marco Ferreira confirmou seu agendamento para amanhã às 9h.', date: 'Agora', read: false },
  { id: '2', icon: '💬', title: 'Nova mensagem', subtitle: 'Sandra: "Olá! Posso ir amanhã de manhã verificar o ar."', date: '1h atrás', read: false },
  { id: '3', icon: '⭐', title: 'Avalie o serviço', subtitle: 'Como foi o serviço de Ana Souza? Deixe sua avaliação.', date: 'Ontem', read: true },
  { id: '4', icon: '💡', title: 'Oferta especial', subtitle: 'Desconto de 10% em serviços de limpeza esta semana!', date: '2 dias', read: true },
  { id: '5', icon: '🔧', title: 'Proposta recebida', subtitle: 'Carlos Lima enviou uma proposta para seu pedido de hidráulica.', date: '3 dias', read: true },
  { id: '6', icon: '🎉', title: 'Bem-vindo à Servix!', subtitle: 'Encontre os melhores profissionais da sua cidade.', date: '30 dias', read: true },
];

export function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    Alert.alert('Limpar notificações', 'Deseja remover todas as notificações?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar tudo', style: 'destructive', onPress: () => setNotifications([]) },
    ]);
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>
          Notificações{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </Text>
        <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllRow} onPress={handleMarkAllRead}>
          <Ionicons name="checkmark-done" size={16} color={Colors.primary} />
          <Text style={styles.markAllText}>Marcar todas como lidas</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.read && styles.cardUnread]}
            onPress={() => handleMarkRead(item.id)}
            onLongPress={() =>
              Alert.alert('Opções', item.title, [
                { text: 'Fechar' },
                { text: 'Excluir', style: 'destructive', onPress: () => handleDelete(item.id) },
              ])
            }
          >
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>{item.icon}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              <Text style={styles.cardDate}>{item.date}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>Sem notificações</Text>
            <Text style={styles.emptySubText}>Você está em dia!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  pageTitle: { fontSize: 17, fontWeight: '700', color: Colors.white },
  clearBtn: { padding: 4 },
  clearBtnText: { color: Colors.error, fontSize: 14, fontWeight: '500' },
  markAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  markAllText: { color: Colors.primary, fontSize: 13, fontWeight: '500' },
  list: { paddingHorizontal: 20, paddingTop: 12, gap: 8, paddingBottom: 20, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
    gap: 12,
  },
  cardUnread: { borderColor: Colors.primary + '55' },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 20 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: Colors.white, marginBottom: 3 },
  cardSubtitle: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
  cardDate: { fontSize: 11, color: Colors.textMuted, marginTop: 6 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  empty: { flex: 1, paddingTop: 80, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  emptySubText: { color: Colors.textMuted, fontSize: 13 },
});
