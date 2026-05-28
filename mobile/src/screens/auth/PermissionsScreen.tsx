import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Permissions'>;
  route: RouteProp<AuthStackParamList, 'Permissions'>;
};

export function PermissionsScreen({ navigation, route }: Props) {
  const { isProvider } = route.params;
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const { setAuth, token } = useAuthStore();

  const PERMISSIONS = [
    {
      icon: 'location-outline' as const,
      title: 'Localização',
      description: 'Para encontrar prestadores próximos a você',
      value: locationEnabled,
      onToggle: setLocationEnabled,
      color: Colors.primary,
    },
    {
      icon: 'notifications-outline' as const,
      title: 'Notificações',
      description: 'Para receber atualizações sobre seus serviços',
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
      color: Colors.warning,
    },
    {
      icon: 'camera-outline' as const,
      title: 'Câmera',
      description: 'Para enviar fotos dos serviços necessários',
      value: cameraEnabled,
      onToggle: setCameraEnabled,
      color: Colors.secondary,
    },
  ];

  const handleContinue = async () => {
    if (isProvider) {
      navigation.navigate('ProviderRegister1');
    } else {
      try {
        setLoading(true);
        const updatedUser = await authService.setRole('CLIENT');
        if (token) setAuth(updatedUser, token);
        useAuthStore.getState().setNeedsOnboarding(false);
      } catch {
        Alert.alert('Erro', 'Não foi possível definir seu perfil. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Permissões necessárias</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Para que o Servix funcione melhor, precisamos das seguintes permissões:
        </Text>

        <View style={styles.permissionsList}>
          {PERMISSIONS.map((perm) => (
            <View key={perm.title} style={styles.permissionCard}>
              <View style={[styles.permissionIcon, { backgroundColor: perm.color + '22' }]}>
                <Ionicons name={perm.icon} size={24} color={perm.color} />
              </View>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>{perm.title}</Text>
                <Text style={styles.permissionDesc}>{perm.description}</Text>
              </View>
              <Switch
                value={perm.value}
                onValueChange={perm.onToggle}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          Você pode alterar essas permissões a qualquer momento nas configurações do dispositivo.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.btnDisabled]}
          onPress={handleContinue}
          disabled={loading}
        >
          <Text style={styles.primaryBtnText}>
            {loading ? 'Aguarde...' : 'Continuar'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  container: { flex: 1, padding: 20 },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionsList: { gap: 12 },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionInfo: { flex: 1 },
  permissionTitle: { fontSize: 15, fontWeight: '600', color: Colors.white },
  permissionDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2, lineHeight: 18 },
  note: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 24,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
