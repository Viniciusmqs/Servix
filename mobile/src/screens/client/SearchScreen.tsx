import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { CATEGORIES } from '../../constants/categories';
import { providerService } from '../../services/provider.service';
import { Provider } from '../../types/models';
import { ClientRootParamList } from '../../navigation/ClientNavigator';
import { Avatar } from '../../components/Avatar';

const RECENT_SEARCHES = ['Eletricista', 'Encanador', 'Pintor', 'Faxina'];

type Props = {
  navigation?: NativeStackNavigationProp<ClientRootParamList, 'Search'>;
  route?: RouteProp<ClientRootParamList, 'Search'>;
};

export function SearchScreen({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<ClientRootParamList>>();
  const category = route?.params?.category;
  const [query, setQuery] = useState(category ?? '');
  const [results, setResults] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await providerService.search(text);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search when navigated with a category param
  useEffect(() => {
    if (category && category.length >= 2) {
      handleSearch(category);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar serviços ou profissionais..."
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={handleSearch}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => navigation.navigate('SearchFilter', { initialCategory: query || undefined })}
          >
            <Ionicons name="options" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {query.length === 0 ? (
            <>
              <Text style={styles.sectionTitle}>Buscas recentes</Text>
              <View style={styles.chips}>
                {RECENT_SEARCHES.map((term) => (
                  <TouchableOpacity
                    key={term}
                    style={styles.chip}
                    onPress={() => handleSearch(term)}
                  >
                    <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.chipText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Categorias populares</Text>
              <View style={styles.categoriesGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryItem}
                    onPress={() => handleSearch(cat.name)}
                  >
                    <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {loading ? 'Buscando...' : `${results.length} resultado(s)`}
              </Text>
              {results.filter((p): p is Provider => Boolean(p?.name)).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.resultCard}
                  onPress={() => navigation.navigate('ProviderProfile', { providerId: p.id })}
                >
                  <Avatar name={p?.name} avatarUrl={p?.avatarUrl} size={48} />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{p?.name ?? '—'}</Text>
                    <Text style={styles.resultSpecialty}>{p?.specialty ?? ''}</Text>
                    <Text style={styles.resultRating}>
                      ⭐ {p?.rating != null ? p.rating.toFixed(1) : '—'} · {p?.city ?? ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: { flex: 1, color: Colors.white, fontSize: 14 },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: { color: Colors.textSecondary, fontSize: 13 },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 8,
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    padding: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryEmoji: { fontSize: 24, marginBottom: 4 },
  categoryName: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    alignItems: 'center',
    gap: 14,
  },
  resultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultAvatarText: { color: Colors.white, fontSize: 18, fontWeight: '700' },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: '600', color: Colors.white },
  resultSpecialty: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  resultRating: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
});
