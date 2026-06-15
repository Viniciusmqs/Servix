import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { CATEGORIES } from '../../constants/categories';
import { useAuthStore } from '../../store/auth.store';
import { providerService } from '../../services/provider.service';
import { Provider } from '../../types/models';
import { ClientRootParamList } from '../../navigation/ClientNavigator';
import { Avatar } from '../../components/Avatar';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientRootParamList>>();
  const user = useAuthStore((s) => s.user);
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    providerService
      .getFeatured()
      .then((data) => {
        const valid = (data ?? []).filter((p): p is Provider => Boolean(p?.name));
        setProviders(valid);
      })
      .catch(() => {});
  }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'você';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Olá, {firstName} 👋</Text>
            <Text style={styles.headerSub}>O que precisa hoje?</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.bellBtn}>
              <Ionicons name="notifications-outline" size={22} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{firstName?.[0]?.toUpperCase() ?? '?'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Buscar serviços...</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Categorias</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              onPress={() => navigation.navigate('Search', { category: cat.name })}
            >
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Em destaque</Text>
        {providers.length === 0 ? (
          <View style={styles.emptyProviders}>
            <Text style={styles.emptyProvidersText}>Nenhum prestador em destaque</Text>
            <Text style={styles.emptyProvidersSubText}>Busque por serviços usando a barra acima</Text>
          </View>
        ) : (
          providers.map((p) => (
            <TouchableOpacity
              key={p?.id ?? Math.random().toString()}
              style={styles.providerCard}
              onPress={() => p?.id && navigation.navigate('ProviderProfile', { providerId: p.id })}
            >
              <Avatar name={p?.name} avatarUrl={p?.avatarUrl} size={52} />
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{p?.name ?? '—'}</Text>
                <Text style={styles.providerSpecialty}>{p?.specialty ?? ''}</Text>
                <View style={styles.providerMeta}>
                  <Text style={styles.providerRating}>
                    ⭐ {p?.rating != null ? p.rating.toFixed(1) : '—'}
                  </Text>
                  {p?.available === true && (
                    <View style={styles.availableBadge}>
                      <Text style={styles.availableText}>Disponível</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
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
  headerLeft: {},
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bellBtn: { padding: 4 },
  greeting: { fontSize: 20, fontWeight: '700', color: Colors.white },
  headerSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    marginBottom: 24,
  },
  searchPlaceholder: { color: Colors.textMuted, fontSize: 14 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginBottom: 28,
    gap: 8,
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    padding: 8,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryEmoji: { fontSize: 24 },
  categoryName: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    alignItems: 'center',
    gap: 14,
  },
  providerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerAvatarText: { color: Colors.white, fontSize: 20, fontWeight: '700' },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 15, fontWeight: '600', color: Colors.white },
  providerSpecialty: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  providerMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  providerRating: { fontSize: 13, color: Colors.textSecondary },
  availableBadge: {
    backgroundColor: 'rgba(0,200,150,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  availableText: { fontSize: 11, color: Colors.secondary, fontWeight: '600' },
  emptyProviders: { alignItems: 'center', paddingVertical: 32, marginHorizontal: 20 },
  emptyProvidersText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
  emptyProvidersSubText: { fontSize: 13, color: Colors.textMuted, marginTop: 6, textAlign: 'center' },
});
