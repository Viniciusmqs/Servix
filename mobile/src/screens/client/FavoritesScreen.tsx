import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { favoritesService, FavoriteItem } from '../../services/favorites.service';
import { ClientRootParamList } from '../../navigation/ClientNavigator';
import { Avatar } from '../../components/Avatar';

export function FavoritesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientRootParamList>>();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await favoritesService.getAll();
      setFavorites(data);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleRemove = (item: FavoriteItem) => {
    Alert.alert(
      'Remover favorito',
      `Remover ${item.providerName} dos favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoritesService.remove(item.providerId);
              setFavorites((prev) => prev.filter((f) => f.providerId !== item.providerId));
            } catch {
              Alert.alert('Erro', 'Não foi possível remover o favorito.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.pageTitle}>Favoritos</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProviderProfile', { providerId: item.providerId })}
          >
            <Avatar name={item.providerName} avatarUrl={item.providerAvatarUrl} size={52} />
            <View style={styles.cardInfo}>
              <Text style={styles.name}>{item.providerName}</Text>
              <Text style={styles.specialty}>{item.category}</Text>
              <Text style={styles.rating}>⭐ {Number(item.rating).toFixed(1)}</Text>
            </View>
            <TouchableOpacity style={styles.heartBtn} onPress={() => handleRemove(item)}>
              <Ionicons name="heart" size={22} color={Colors.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum favorito ainda</Text>
            <Text style={styles.emptySubText}>Toque no ♡ no perfil de um prestador</Text>
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
  list: { paddingHorizontal: 20, gap: 12, paddingBottom: 20, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 20, fontWeight: '700' },
  cardInfo: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.white },
  specialty: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  rating: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  heartBtn: { padding: 6 },
  empty: { paddingTop: 60, alignItems: 'center', gap: 8 },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
  emptySubText: { color: Colors.textMuted, fontSize: 13 },
});
