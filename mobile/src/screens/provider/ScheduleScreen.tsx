import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { requestService } from '../../services/request.service';
import { ProviderRootParamList } from '../../navigation/ProviderNavigator';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type ScheduleEntry = {
  time: string;
  client: string;
  service: string;
  color: string;
  requestId: string;
  status: string;
};

type ScheduleMap = Record<number, ScheduleEntry[]>;

const STATUS_COLOR: Record<string, string> = {
  ACCEPTED: Colors.secondary,
  IN_PROGRESS: Colors.primary,
  COMPLETED: Colors.success,
};

const STATUS_LABEL: Record<string, string> = {
  ACCEPTED: 'Aceito',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
};

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return { cells, daysInMonth };
}

export function ProviderScheduleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProviderRootParamList>>();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [scheduleMap, setScheduleMap] = useState<ScheduleMap>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cal = buildCalendar(year, month);
  const monthName = new Date(year, month).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  const todayDay = now.getMonth() === month && now.getFullYear() === year ? now.getDate() : -1;
  const daySchedule = scheduleMap[selectedDay] ?? [];

  const loadSchedule = async () => {
    const received = await requestService.getReceivedRequests();
    const map: ScheduleMap = {};

    received.forEach((r) => {
      if (!['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(r.status)) return;
      const dateStr = r.scheduledAt ?? r.createdAt;
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (date.getFullYear() !== year || date.getMonth() !== month) return;
      const day = date.getDate();
      if (!map[day]) map[day] = [];
      map[day].push({
        time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        client: r.clientName ?? 'Cliente',
        service: r.title,
        color: STATUS_COLOR[r.status] ?? Colors.textMuted,
        requestId: r.id,
        status: r.status,
      });
    });

    setScheduleMap(map);
  };

  useEffect(() => {
    setLoading(true);
    loadSchedule().catch(() => {}).finally(() => setLoading(false));
  }, [year, month]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSchedule().catch(() => {});
    setRefreshing(false);
  };

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
    setSelectedDay(1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
    setSelectedDay(1);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.secondary} />}
      >
        <Text style={styles.pageTitle}>Agenda</Text>

        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthName}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.dayLabels}>
          {DAYS.map((d) => (
            <Text key={d} style={styles.dayLabel}>{d}</Text>
          ))}
        </View>

        {loading ? (
          <View style={styles.calendarLoading}>
            <ActivityIndicator color={Colors.secondary} />
          </View>
        ) : (
          <View style={styles.calendar}>
            {cal.cells.map((day, i) =>
              day === null ? (
                <View key={`e-${i}`} style={styles.dayCell} />
              ) : (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    day === todayDay && styles.dayCellToday,
                    selectedDay === day && styles.dayCellSelected,
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text
                    style={[
                      styles.dayCellText,
                      selectedDay === day && styles.dayCellTextSelected,
                      day === todayDay && selectedDay !== day && styles.dayCellTodayText,
                    ]}
                  >
                    {day}
                  </Text>
                  {scheduleMap[day] && selectedDay !== day && (
                    <View style={styles.eventDot} />
                  )}
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        <View style={styles.selectedDayHeader}>
          <Text style={styles.selectedDayTitle}>
            Serviços do dia {selectedDay}
          </Text>
          {daySchedule.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{daySchedule.length}</Text>
            </View>
          )}
        </View>

        {daySchedule.length === 0 ? (
          <View style={styles.emptyDay}>
            <Ionicons name="calendar-outline" size={40} color={Colors.border} />
            <Text style={styles.emptyDayText}>Nenhum serviço agendado</Text>
          </View>
        ) : (
          daySchedule.map((item, i) => (
            <View key={i} style={[styles.scheduleCard, { borderLeftColor: item.color }]}>
              <View style={styles.scheduleLeft}>
                <Text style={[styles.scheduleTime, { color: item.color }]}>{item.time}</Text>
                <View style={[styles.statusDot, { backgroundColor: item.color }]} />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleService}>{item.service}</Text>
                <Text style={styles.scheduleClient}>{item.client}</Text>
                <Text style={[styles.scheduleStatus, { color: item.color }]}>
                  {STATUS_LABEL[item.status] ?? item.status}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewServiceBtn}
                onPress={() =>
                  navigation.navigate('ServiceStatus', {
                    requestId: item.requestId,
                    clientName: item.client,
                  })
                }
              >
                <Text style={styles.viewServiceBtnText}>Ver</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthTitle: { fontSize: 15, fontWeight: '600', color: Colors.white, textTransform: 'capitalize' },
  dayLabels: { flexDirection: 'row', paddingHorizontal: 14, marginBottom: 8 },
  dayLabel: { width: '14.28%', textAlign: 'center', color: Colors.textMuted, fontSize: 12 },
  calendarLoading: { height: 200, alignItems: 'center', justifyContent: 'center' },
  calendar: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, marginBottom: 24 },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCellToday: {},
  dayCellSelected: { backgroundColor: Colors.secondary, borderRadius: 20 },
  dayCellText: { color: Colors.textSecondary, fontSize: 14 },
  dayCellTodayText: { color: Colors.secondary, fontWeight: '700' },
  dayCellTextSelected: { color: Colors.white, fontWeight: '700' },
  eventDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.secondary, marginTop: 2 },
  selectedDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 14,
    gap: 10,
  },
  selectedDayTitle: { fontSize: 16, fontWeight: '700', color: Colors.white },
  countBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  emptyDay: { paddingVertical: 32, alignItems: 'center', gap: 10 },
  emptyDayText: { color: Colors.textMuted, fontSize: 14 },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  scheduleLeft: { alignItems: 'center', gap: 4 },
  scheduleTime: { fontSize: 13, fontWeight: '700', width: 44, textAlign: 'center' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  scheduleInfo: { flex: 1 },
  scheduleService: { fontSize: 14, fontWeight: '600', color: Colors.white },
  scheduleClient: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  scheduleStatus: { fontSize: 11, fontWeight: '600', marginTop: 3 },
  viewServiceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
  },
  viewServiceBtnText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
});
