import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { ClientRootParamList } from '../../navigation/ClientNavigator';
import { useAuthStore } from '../../store/auth.store';

type Props = {
  navigation: NativeStackNavigationProp<ClientRootParamList, 'Settings'>;
};

type ModalType = 'profile' | 'addresses' | 'payment' | 'faq' | null;

const FAQ_ITEMS = [
  { q: 'Como solicitar um serviço?', a: 'Pesquise um prestador pela tela Buscar, acesse o perfil e toque em "Solicitar orçamento".' },
  { q: 'Como funciona o pagamento?', a: 'O pagamento é feito de forma segura via MercadoPago. Aceitamos Pix, cartão de crédito e boleto bancário.' },
  { q: 'Como cancelar um serviço?', a: 'Acesse "Serviços", selecione o pedido e toque em "Cancelar serviço". Cancelamentos gratuitos até 24h antes.' },
  { q: 'Como avaliar um prestador?', a: 'Após a conclusão, vá em "Serviços" > aba "Concluídos" e toque em "Avaliar".' },
  { q: 'Os prestadores são verificados?', a: 'Sim. Todos passam por verificação de identidade e análise de histórico antes de entrar na plataforma.' },
];

export function SettingsScreen({ navigation }: Props) {
  const { user, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editPhone, setEditPhone] = useState(user?.phone ?? '');

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Conta</Text>
        <View style={styles.optionsList}>
          {([
            { icon: 'person-outline', label: 'Dados pessoais', modal: 'profile' },
            { icon: 'location-outline', label: 'Endereços salvos', modal: 'addresses' },
            { icon: 'card-outline', label: 'Métodos de pagamento', modal: 'payment' },
          ] as const).map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={styles.optionItem}
              onPress={() => setActiveModal(opt.modal as ModalType)}
            >
              <View style={styles.optionIcon}>
                <Ionicons name={opt.icon} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.optionLabel}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Preferências</Text>
        <View style={styles.optionsList}>
          <View style={styles.optionItem}>
            <View style={styles.optionIcon}>
              <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.optionLabel}>Notificações push</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
          <View style={styles.optionItem}>
            <View style={styles.optionIcon}>
              <Ionicons name="moon-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.optionLabel}>Tema escuro</Text>
            <Switch
              value={true}
              onValueChange={() => Alert.alert('Tema', 'Tema claro chegando em breve!')}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Suporte</Text>
        <View style={styles.optionsList}>
          <TouchableOpacity style={styles.optionItem} onPress={() => setActiveModal('faq')}>
            <View style={styles.optionIcon}>
              <Ionicons name="help-circle-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.optionLabel}>Ajuda e FAQ</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() =>
              Alert.alert('Falar com Suporte', 'Como prefere entrar em contato?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'WhatsApp', onPress: () => Linking.openURL('https://wa.me/5511999990000') },
                { text: 'Email', onPress: () => Linking.openURL('mailto:suporte@servix.com.br') },
              ])
            }
          >
            <View style={styles.optionIcon}>
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.optionLabel}>Falar com suporte</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() =>
              Alert.alert(
                'Política de Privacidade',
                'A Servix coleta apenas dados necessários para os serviços. Seus dados são protegidos com criptografia e nunca vendidos a terceiros.\n\nPara solicitar exclusão da conta: suporte@servix.com.br\n\nVersão 1.0 — Junho 2026.',
                [{ text: 'OK' }]
              )
            }
          >
            <View style={styles.optionIcon}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.optionLabel}>Política de privacidade</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Dados pessoais */}
      <Modal visible={activeModal === 'profile'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Dados pessoais</Text>
            <TouchableOpacity onPress={() => { Alert.alert('Salvo!', 'Dados atualizados.'); setActiveModal(null); }}>
              <Text style={styles.modalSaveBtn}>Salvar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.fieldLabel}>Nome completo</Text>
            <TextInput style={styles.fieldInput} value={editName} onChangeText={setEditName} placeholderTextColor={Colors.textMuted} />
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={[styles.fieldInput, styles.fieldInputDisabled]} value={user?.email ?? ''} editable={false} placeholderTextColor={Colors.textMuted} />
            <Text style={styles.fieldNote}>O email não pode ser alterado.</Text>
            <Text style={styles.fieldLabel}>Telefone</Text>
            <TextInput style={styles.fieldInput} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" placeholder="(11) 99999-0000" placeholderTextColor={Colors.textMuted} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Endereços */}
      <Modal visible={activeModal === 'addresses'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Endereços salvos</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.modalContent}>
            <View style={styles.addressCard}>
              <Ionicons name="home" size={20} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressLabel}>Casa</Text>
                <Text style={styles.addressValue}>Rua das Flores, 123 – Pinheiros, SP</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </View>
            <TouchableOpacity style={styles.addAddressBtn} onPress={() => Alert.alert('Em breve', 'Adicionar endereço estará disponível em breve.')}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.addAddressText}>Adicionar endereço</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Pagamentos */}
      <Modal visible={activeModal === 'payment'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Métodos de pagamento</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.modalContent}>
            <View style={styles.paymentCard}>
              <Text style={styles.paymentIcon}>💳</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentLabel}>MercadoPago</Text>
                <Text style={styles.paymentSub}>Pix · Cartão de crédito · Boleto</Text>
              </View>
              <View style={styles.paymentBadge}>
                <Text style={styles.paymentBadgeText}>Ativo</Text>
              </View>
            </View>
            <Text style={styles.paymentNote}>
              Os pagamentos são processados com segurança via MercadoPago. Você escolhe a forma de pagamento no momento do checkout.
            </Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* FAQ */}
      <Modal visible={activeModal === 'faq'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ajuda e FAQ</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {FAQ_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.faqItem}
                onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  <Ionicons name={expandedFaq === i ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
                </View>
                {expandedFaq === i && <Text style={styles.faqAnswer}>{item.a}</Text>}
              </TouchableOpacity>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.white, textAlign: 'center' },
  scrollView: { flex: 1 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginHorizontal: 20, marginTop: 24, marginBottom: 8,
  },
  optionsList: { paddingHorizontal: 20, gap: 4 },
  optionItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border, gap: 14,
  },
  optionIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(37,99,235,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  optionLabel: { flex: 1, fontSize: 15, color: Colors.textSecondary },
  logoutSection: { paddingHorizontal: 20, marginTop: 24 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.error + '44',
    gap: 10, backgroundColor: Colors.surface,
  },
  logoutText: { color: Colors.error, fontSize: 15, fontWeight: '500' },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.white },
  modalSaveBtn: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  modalContent: { flex: 1, padding: 20 },
  fieldLabel: { fontSize: 13, color: Colors.textMuted, marginBottom: 6, marginTop: 16 },
  fieldInput: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, height: 50, paddingHorizontal: 14, color: Colors.white, fontSize: 15,
  },
  fieldInputDisabled: { opacity: 0.6 },
  fieldNote: { fontSize: 12, color: Colors.textMuted, marginTop: 6 },
  addressCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 12,
  },
  addressLabel: { fontSize: 14, fontWeight: '600', color: Colors.white },
  addressValue: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  addAddressBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14 },
  addAddressText: { color: Colors.primary, fontSize: 15, fontWeight: '500' },
  paymentCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  paymentIcon: { fontSize: 32 },
  paymentLabel: { fontSize: 15, fontWeight: '600', color: Colors.white },
  paymentSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  paymentBadge: {
    backgroundColor: 'rgba(0,200,150,0.15)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  paymentBadgeText: { color: Colors.secondary, fontSize: 12, fontWeight: '600' },
  paymentNote: { fontSize: 13, color: Colors.textMuted, lineHeight: 20 },
  faqItem: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.white },
  faqAnswer: { fontSize: 13, color: Colors.textMuted, lineHeight: 20, marginTop: 10 },
});
