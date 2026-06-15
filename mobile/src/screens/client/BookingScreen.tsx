import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { requestService } from '../../services/request.service';
import { ClientRootParamList } from '../../navigation/ClientNavigator';

type Props = {
  navigation: NativeStackNavigationProp<ClientRootParamList, 'Booking'>;
  route: RouteProp<ClientRootParamList, 'Booking'>;
};

export function BookingScreen({ navigation, route }: Props) {
  const { providerId } = route.params;
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [urgency, setUrgency] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para adicionar fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris].slice(0, 5));
    }
  };

  const handleRemovePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((p) => p !== uri));
  };

  const handleSubmit = async () => {
    if (!serviceType || !description || !address) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios.');
      return;
    }
    try {
      setLoading(true);
      const created = await requestService.create({
        title: serviceType,
        description,
        category: serviceType,
        address,
        preferredDate: date || undefined,
        urgency,
        providerId,
      });
      navigation.navigate('Confirmation', { requestId: created.id });
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar a solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Solicitar orçamento</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Tipo de serviço *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Instalação de tomadas"
              placeholderTextColor={Colors.textMuted}
              value={serviceType}
              onChangeText={setServiceType}
            />

            <Text style={styles.label}>Descrição *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Descreva detalhes do serviço..."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Endereço *</Text>
            <TextInput
              style={styles.input}
              placeholder="Rua, número, bairro, cidade"
              placeholderTextColor={Colors.textMuted}
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.label}>Data preferida</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={Colors.textMuted}
              value={date}
              onChangeText={setDate}
            />

            <Text style={styles.label}>Urgência</Text>
            <View style={styles.urgencyRow}>
              {(['NORMAL', 'URGENT'] as const).map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.urgencyChip, urgency === u && styles.urgencyChipActive]}
                  onPress={() => setUrgency(u)}
                >
                  <Text style={[styles.urgencyText, urgency === u && styles.urgencyTextActive]}>
                    {u === 'NORMAL' ? 'Normal' : 'Urgente'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Fotos (opcional)</Text>
            {photos.length > 0 && (
              <View style={styles.photosRow}>
                {photos.map((uri) => (
                  <TouchableOpacity key={uri} onPress={() => handleRemovePhoto(uri)} style={styles.photoWrapper}>
                    <Image source={{ uri }} style={styles.photoThumb} />
                    <View style={styles.photoRemove}>
                      <Ionicons name="close" size={12} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ))}
                {photos.length < 5 && (
                  <TouchableOpacity style={styles.photoAdd} onPress={handlePickPhotos}>
                    <Ionicons name="add" size={28} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            )}
            {photos.length === 0 && (
              <TouchableOpacity style={styles.uploadArea} onPress={handlePickPhotos}>
                <Ionicons name="camera-outline" size={32} color={Colors.textMuted} />
                <Text style={styles.uploadText}>Toque para adicionar fotos</Text>
                <Text style={styles.uploadSubtext}>Até 5 fotos · JPG, PNG</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? 'Enviando...' : 'Enviar solicitação'}
              </Text>
            </TouchableOpacity>
            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
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
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    color: Colors.white,
    fontSize: 14,
    marginBottom: 20,
  },
  textarea: { height: 110, paddingTop: 14 },
  urgencyRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  urgencyChip: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  urgencyChipActive: { borderColor: Colors.primary, backgroundColor: 'rgba(37,99,235,0.1)' },
  urgencyText: { color: Colors.textMuted, fontSize: 14 },
  urgencyTextActive: { color: Colors.primary, fontWeight: '600' },
  uploadArea: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  uploadText: { color: Colors.textMuted, fontSize: 14 },
  uploadSubtext: { color: Colors.textMuted, fontSize: 12 },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  photoWrapper: { position: 'relative' },
  photoThumb: { width: 80, height: 80, borderRadius: 10 },
  photoRemove: {
    position: 'absolute', top: 4, right: 4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  photoAdd: {
    width: 80, height: 80, borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
