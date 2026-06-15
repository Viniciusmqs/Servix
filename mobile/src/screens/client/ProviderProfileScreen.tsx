import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { providerService } from '../../services/provider.service';
import { favoritesService } from '../../services/favorites.service';
import { Provider } from '../../types/models';
import { Image } from 'react-native';
import { ClientRootParamList } from '../../navigation/ClientNavigator';
import { Avatar } from '../../components/Avatar';

const PORTFOLIO_SEEDS: Record<string, string[]> = {
  'Elétrica':       ['electrical-panel','wiring-work','circuit-board','power-outlet','light-fixture','electrical-box'],
  'Hidráulica':     ['plumbing-pipe','water-tap','bathroom-sink','shower','pipe-repair','water-heater'],
  'Limpeza':        ['clean-house','mopping-floor','cleaning-supplies','sparkling-kitchen','vacuum','organized-room'],
  'Pintura':        ['painting-wall','paint-roller','colorful-room','fresh-paint','brushwork','interior-design'],
  'Jardinagem':     ['garden-flowers','lawn-care','pruning','green-plants','landscape','outdoor-garden'],
  'Reformas':       ['renovation-room','construction','new-bathroom','tile-work','modern-kitchen','remodel'],
  'TI':             ['computer-setup','network-cables','server-room','tech-support','wifi-router','laptop-repair'],
  'Ar-condicionado':['air-conditioner','hvac-unit','cooling-system','split-ac','ventilation','ac-installation'],
  'Segurança':      ['security-camera','cctv-system','alarm-panel','gate-access','monitoring','surveillance'],
  'Mudança':        ['moving-boxes','moving-truck','packing','furniture-move','relocation','delivery'],
};

function getPortfolioImages(category: string, count = 6): string[] {
  const seeds = PORTFOLIO_SEEDS[category] ?? ['home-service','professional-work','quality-service','handyman','skilled-worker','service-done'];
  return Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/${seeds[i % seeds.length]}/400/300`);
}

type Props = {
  navigation: NativeStackNavigationProp<ClientRootParamList, 'ProviderProfile'>;
  route: RouteProp<ClientRootParamList, 'ProviderProfile'>;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={s <= Math.round(rating) ? 'star' : 'star-outline'}
          size={16}
          color={Colors.warning}
        />
      ))}
    </View>
  );
}

export function ProviderProfileScreen({ navigation, route }: Props) {
  const { providerId } = route.params;
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    providerService.getById(providerId).then(setProvider).catch(() => {});
    favoritesService.getAll()
      .then((list) => setIsFavorite(list.some((f) => f.providerId === providerId)))
      .catch(() => {});
  }, [providerId]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoritesService.remove(providerId);
        setIsFavorite(false);
      } else {
        await favoritesService.add(providerId);
        setIsFavorite(true);
      }
    } catch {}
  };

  const p = provider ?? {
    id: providerId,
    userId: '',
    name: 'Marco Silva',
    specialty: 'Eletricista',
    bio: 'Profissional com mais de 10 anos de experiência em instalações elétricas residenciais e comerciais.',
    rating: 4.8,
    reviewCount: 127,
    city: 'São Paulo',
    available: true,
    services: ['Instalação elétrica', 'Tomadas', 'Disjuntores', 'Quadro de luz'],
    portfolio: [],
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteBtn} onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? Colors.error : Colors.white}
            />
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <View style={styles.heroAvatarWrapper}>
              <Avatar name={p?.name} avatarUrl={provider?.avatarUrl} size={88} />
            </View>
            <Text style={styles.heroName}>{p.name}</Text>
            <Text style={styles.heroSpecialty}>{p.specialty}</Text>
            {p.available && (
              <View style={styles.availableBadge}>
                <View style={styles.availableDot} />
                <Text style={styles.availableText}>Disponível</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.ratingRow}>
          <StarRating rating={p.rating} />
          <Text style={styles.ratingText}>{p.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({p.reviewCount} avaliações)</Text>
          <Text style={styles.city}>· {p.city}</Text>
        </View>
        <TouchableOpacity
          style={styles.seeAllReviews}
          onPress={() => navigation.navigate('ProviderReviews', { providerId: p.id, providerName: p.name })}
        >
          <Text style={styles.seeAllReviewsText}>Ver todas as avaliações →</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.bioText}>{p.bio}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços</Text>
          <View style={styles.chips}>
            {p.services.map((s, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfólio</Text>
          <View style={styles.portfolio}>
            {getPortfolioImages(p.specialty, 6).map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.portfolioItem} resizeMode="cover" />
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Booking', { providerId: p.id })}
          >
            <Text style={styles.primaryBtnText}>Solicitar orçamento</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => navigation.navigate('Chat', { requestId: p.id, providerName: p.name })}
          >
            <Text style={styles.outlineBtnText}>Enviar mensagem</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  heroHeader: {
    backgroundColor: Colors.surface,
    paddingTop: 20,
    paddingBottom: 28,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 20,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: { alignItems: 'center' },
  heroAvatarWrapper: {
    marginBottom: 12,
    borderWidth: 3,
    borderColor: Colors.background,
    borderRadius: 44,
    overflow: 'hidden',
  },
  heroName: { fontSize: 20, fontWeight: '700', color: Colors.white },
  heroSpecialty: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,200,150,0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
    gap: 6,
  },
  availableDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.secondary },
  availableText: { color: Colors.secondary, fontSize: 13, fontWeight: '600' },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  ratingText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  reviewCount: { fontSize: 13, color: Colors.textMuted },
  city: { fontSize: 13, color: Colors.textMuted },
  seeAllReviews: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 4,
  },
  seeAllReviewsText: { color: Colors.primary, fontSize: 13, marginBottom: 8 },
  section: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: 12 },
  bioText: { fontSize: 14, color: Colors.textMuted, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipText: { color: Colors.textSecondary, fontSize: 13 },
  portfolio: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  portfolioItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  actions: { paddingHorizontal: 20, paddingTop: 24, gap: 12 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  outlineBtn: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: { color: Colors.textSecondary, fontSize: 16 },
});
