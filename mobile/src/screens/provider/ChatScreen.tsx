import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { chatService, ChatMessage } from '../../services/chat.service';
import { requestService } from '../../services/request.service';
import { useAuthStore } from '../../store/auth.store';
import { ProviderRootParamList } from '../../navigation/ProviderNavigator';

type Props = {
  navigation: NativeStackNavigationProp<ProviderRootParamList, 'ProviderChat'>;
  route: RouteProp<ProviderRootParamList, 'ProviderChat'>;
};

export function ProviderChatScreen({ navigation, route }: Props) {
  const { requestId, clientName } = route.params;
  const user = useAuthStore((s) => s.user);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    Promise.allSettled([
      chatService.getMessages(requestId),
      requestService.getById(requestId),
    ]).then(([msgs, req]) => {
      if (msgs.status === 'fulfilled') setMessages(msgs.value);
      if (req.status === 'fulfilled') {
        const r = req.value;
        // Provider receives from client; if somehow provider is also stored in req, pick client
        setReceiverId(r.clientId);
      }
    }).finally(() => setLoading(false));
    chatService.markAsRead(requestId).catch(() => {});
  }, [requestId]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    if (!receiverId) {
      Alert.alert('Erro', 'Não foi possível identificar o cliente. Verifique se o pedido existe.');
      return;
    }
    const content = text.trim();
    setText('');
    setSending(true);
    try {
      const msg = await chatService.sendMessage(requestId, content, receiverId);
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      setText(content);
      const errMsg = e?.response?.data?.message ?? 'Não foi possível enviar a mensagem.';
      Alert.alert('Erro', errMsg);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === user?.id;
    const time = new Date(item.createdAt).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={styles.bubbleText}>{item.content}</Text>
        </View>
        <Text style={styles.messageTime}>{time}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>{clientName?.[0]?.toUpperCase() ?? 'C'}</Text>
              </View>
              <Text style={styles.headerName}>{clientName}</Text>
            </View>
            <View style={{ width: 22 }} />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.secondary} size="large" />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Nenhuma mensagem ainda. Inicie a conversa! 👋</Text>
                </View>
              }
              onContentSizeChange={() => {
                if (messages.length > 0) listRef.current?.scrollToEnd({ animated: false });
              }}
            />
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Digite uma mensagem..."
              placeholderTextColor={Colors.textMuted}
              value={text}
              onChangeText={setText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Ionicons name="send" size={18} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  headerName: { fontSize: 15, fontWeight: '600', color: Colors.white },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messagesList: { paddingHorizontal: 16, paddingVertical: 16, gap: 12, flexGrow: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center' },
  messageRow: { alignItems: 'flex-start', maxWidth: '80%' },
  messageRowMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 2 },
  bubbleMe: { backgroundColor: Colors.secondary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: Colors.inputBackground, borderBottomLeftRadius: 4 },
  bubbleText: { color: Colors.white, fontSize: 14, lineHeight: 20 },
  messageTime: { fontSize: 11, color: Colors.textMuted },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.white,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});
