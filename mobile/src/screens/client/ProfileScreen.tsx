import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/auth.store';
import { ClientRootParamList } from '../../navigation/ClientNavigator';
import { requestService } from '../../services/request.service';
import { favoritesService } from '../../services/favorites.service';
import { api } from '../../services/api';
import { Avatar } from '../../components/Avatar';

export function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<ClientRootParamList>>();
  const [stats, setStats] = useState({ services: 0, favorites: 0, reviews: 0 });

  useEffect(() => {
    Promise.allSettled([
      requestService.getMyRequests(),
      favoritesService.getAll(),
      api.get('/reviews/my?size=1'),
    ]).then(([reqs, favs, revs]) => {
      setStats({
        services: reqs.status === 'fulfilled' ? reqs.value.length : 0,
        favorites: favs.status === 'fulfilled' ? favs.value.length : 0,
        reviews: revs.status === 'fulfilled' ? (revs.value.data?.totalElements ?? 0) : 0,
      });
    });
  }, []);

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const STATS = [
    { label: 'Serviços', value: String(stats.services) },
    { label: 'Favoritos', value: String(stats.favorites) },
    { label: 'Avaliações', value: String(stats.reviews) },
  ];

  const OPTIONS = [
    {
      icon: 'time-outline',
      label: 'Histórico de serviços',
      onPress: () => navigation.navigate('Tabs' as any),
    },
    {
      icon: 'notifications-outline',
      label: 'Notificações',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      icon: 'settings-outline',
      label: 'Configurações',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'help-circle-outline',
      label: 'Ajuda e suporte',
      onPress: () =>
        Alert.alert(
          'Ajuda e Suporte',
          'Entre em contato com nossa equipe:\n\nEmail: suporte@servix.com.br\nWhatsApp: (11) 99999-0000\n\nHorário: Seg–Sex, 8h–18h',
          [
            { text: 'Fechar' },
            {
              text: 'Enviar email',
              onPress: () => Linking.openURL('mailto:suporte@servix.com.br'),
            },
          ]
        ),
    },
    {
      icon: 'shield-outline',
      label: 'Privacidade',
      onPress: () =>
        Alert.alert(
          'Política de Privacidade',
          'A Servix coleta apenas dados necessários para prestação dos serviços. Seus dados pessoais são protegidos e nunca são vendidos a terceiros.\n\nVocê pode solicitar a exclusão da sua conta a qualquer momento pelo suporte.',
          [{ text: 'OK' }]
        ),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar name={user?.name} avatarUrl={(user as any)?.avatarUrl} size={88} />
          <Text style={styles.name}>{user?.name ?? 'Usuário'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
          {user?.phone && <Text style={styles.phone}>{user.phone}</Text>}
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.optionsList}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.label} style={styles.optionItem} onPress={opt.onPress}>
              <View style={styles.optionIcon}>
                <Ionicons name={opt.icon as any} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.optionLabel}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  name: { fontSize: 20, fontWeight: '700', color: Colors.white, marginTop: 14 },
  email: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  phone: { fontSize: 14, color: Colors.textMuted, marginTop: 2 },
  editBtn: {
    marginTop: 14,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnText: { color: Colors.textSecondary, fontSize: 14 },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  optionsList: { paddingHorizontal: 20, paddingTop: 16, gap: 4 },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(37,99,235,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: { flex: 1, fontSize: 15, color: Colors.textSecondary },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error + '44',
    gap: 10,
  },
  logoutText: { color: Colors.error, fontSize: 15, fontWeight: '500' },
});
