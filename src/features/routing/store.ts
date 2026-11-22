import { create } from 'zustand';
import type {
  ActiveTab,
  CompareMode,
  ModeFilter,
  OperatorFilter,
  PassengerType,
  TrafficMode,
} from './schemas';
import { findRoutes, type TransitRouteOption } from './router';
import { formatMinutesToHHMM, getCurrentWibMinutes } from './schedule';
import { CORRIDORS, STOPS } from '@/shared/data/bandungTransit';
import { trackEvent } from '@/shared/lib/analytics';

function formatRouteCorridors(route: TransitRouteOption): string {
  return route.legs.map((l) => l.corridorCode).join(' -> ');
}

function trackRouteSearch(
  next: {
    fromId: string;
    toId: string;
    modeFilter: ModeFilter;
    passengerType: PassengerType;
    trafficMode: TrafficMode;
  },
  routes: TransitRouteOption[],
  trigger: 'from' | 'to' | 'swap' | 'preset' | 'filter' | 'time'
): void {
  if (!next.fromId || !next.toId || next.fromId === next.toId) return;
  trackEvent('route_searched', {
    from_id: next.fromId,
    to_id: next.toId,
    route_pair: `${next.fromId}__${next.toId}`,
    mode_filter: next.modeFilter,
    passenger_type: next.passengerType,
    traffic_mode: next.trafficMode,
    results_count: routes.length,
    trigger,
  });
}

interface TransitStoreState {
  activeTab: ActiveTab;
  fromId: string;
  toId: string;
  modeFilter: ModeFilter;
  passengerType: PassengerType;
  trafficMode: TrafficMode;
  compareMode: CompareMode;
  departureTime: string;
  selectedRouteIndex: number;
  selectedStopId: string | null;
  focusRoute: boolean;
  filterCorridorId: string;
  operatorFilter: OperatorFilter;
  corridorQuery: string;
  simRunId: number;
  routes: TransitRouteOption[];

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setFromId: (id: string) => void;
  setToId: (id: string) => void;
  swapStops: () => void;
  applyPreset: (fromId: string, toId: string) => void;
  setModeFilter: (mode: ModeFilter) => void;
  setPassengerType: (type: PassengerType) => void;
  setTrafficMode: (mode: TrafficMode) => void;
  setCompareMode: (mode: CompareMode) => void;
  setDepartureTime: (time: string) => void;
  resetDepartureTimeToNow: () => void;
  setSelectedRouteIndex: (idx: number) => void;
  setSelectedStopId: (id: string | null) => void;
  toggleFocusRoute: () => void;
  setFocusRoute: (val: boolean) => void;
  setFilterCorridorId: (id: string) => void;
  setOperatorFilter: (op: OperatorFilter) => void;
  setCorridorQuery: (query: string) => void;
  triggerSimulation: (routeIndex?: number) => void;
}

function computeRoutes(state: {
  fromId: string;
  toId: string;
  modeFilter: ModeFilter;
  passengerType: PassengerType;
  trafficMode: TrafficMode;
  departureTime: string;
}): TransitRouteOption[] {
  return findRoutes(state.fromId, state.toId, {
    modeFilter: state.modeFilter,
    passengerType: state.passengerType,
    trafficMode: state.trafficMode,
    departureTime: state.departureTime,
  });
}

const initialDepartureTime = formatMinutesToHHMM(getCurrentWibMinutes());
const initialFrom = 'stasiun_hall';
const initialTo = 'dago_itb';

export const useTransitStore = create<TransitStoreState>((set, get) => ({
  activeTab: 'planner',
  fromId: initialFrom,
  toId: initialTo,
  modeFilter: 'all',
  passengerType: 'regular',
  trafficMode: 'normal',
  compareMode: 'motor',
  departureTime: initialDepartureTime,
  selectedRouteIndex: 0,
  selectedStopId: null,
  focusRoute: true,
  filterCorridorId: 'ALL',
  operatorFilter: 'ALL',
  corridorQuery: '',
  simRunId: 0,
  routes: computeRoutes({
    fromId: initialFrom,
    toId: initialTo,
    modeFilter: 'all',
    passengerType: 'regular',
    trafficMode: 'normal',
    departureTime: initialDepartureTime,
  }),

  setActiveTab: (activeTab) =>
    set((s) => {
      if (s.activeTab !== activeTab) {
        trackEvent('tab_switched', { tab: activeTab });
      }
      if (activeTab === 'corridors') {
        return { activeTab, focusRoute: false };
      }
      const routes = computeRoutes(s);
      return {
        activeTab,
        filterCorridorId: 'ALL',
        operatorFilter: 'ALL',
        focusRoute: true,
        selectedRouteIndex: 0,
        routes,
      };
    }),

  setFromId: (fromId) =>
    set((s) => {
      const next = { ...s, fromId };
      const routes = computeRoutes(next);
      trackRouteSearch(next, routes, 'from');
      return {
        fromId,
        activeTab: 'planner',
        filterCorridorId: 'ALL',
        operatorFilter: 'ALL',
        selectedRouteIndex: 0,
        selectedStopId: null,
        focusRoute: true,
        routes,
      };
    }),

  setToId: (toId) =>
    set((s) => {
      const next = { ...s, toId };
      const routes = computeRoutes(next);
      trackRouteSearch(next, routes, 'to');
      return {
        toId,
        activeTab: 'planner',
        filterCorridorId: 'ALL',
        operatorFilter: 'ALL',
        selectedRouteIndex: 0,
        selectedStopId: null,
        focusRoute: true,
        routes,
      };
    }),

  swapStops: () =>
    set((s) => {
      const next = { ...s, fromId: s.toId, toId: s.fromId };
      const routes = computeRoutes(next);
      trackRouteSearch(next, routes, 'swap');
      return {
        fromId: next.fromId,
        toId: next.toId,
        selectedRouteIndex: 0,
        focusRoute: true,
        routes,
      };
    }),

  applyPreset: (fromId, toId) =>
    set((s) => {
      const next = { ...s, fromId, toId };
      const routes = computeRoutes(next);
      trackRouteSearch(next, routes, 'preset');
      return {
        fromId,
        toId,
        activeTab: 'planner',
        filterCorridorId: 'ALL',
        operatorFilter: 'ALL',
        selectedRouteIndex: 0,
        selectedStopId: null,
        focusRoute: true,
        routes,
      };
    }),

  setModeFilter: (modeFilter) =>
    set((s) => {
      const next = { ...s, modeFilter };
      const routes = computeRoutes(next);
      trackRouteSearch(next, routes, 'filter');
      return { modeFilter, selectedRouteIndex: 0, routes };
    }),

  setPassengerType: (passengerType) =>
    set((s) => {
      const next = { ...s, passengerType };
      const routes = computeRoutes(next);
      trackRouteSearch(next, routes, 'filter');
      return { passengerType, routes };
    }),

  setTrafficMode: (trafficMode) =>
    set((s) => {
      const next = { ...s, trafficMode };
      const routes = computeRoutes(next);
      trackRouteSearch(next, routes, 'filter');
      return { trafficMode, routes };
    }),

  setCompareMode: (compareMode) => {
    trackEvent('compare_mode_switched', { compare_mode: compareMode });
    set({ compareMode });
  },

  setDepartureTime: (departureTime) =>
    set((s) => {
      const next = { ...s, departureTime };
      const routes = computeRoutes(next);
      trackRouteSearch(next, routes, 'time');
      return { departureTime, selectedRouteIndex: 0, routes };
    }),

  resetDepartureTimeToNow: () => {
    const nowStr = formatMinutesToHHMM(getCurrentWibMinutes());
    get().setDepartureTime(nowStr);
  },

  setSelectedRouteIndex: (selectedRouteIndex) =>
    set((s) => {
      const chosen = s.routes[selectedRouteIndex];
      if (chosen && s.selectedRouteIndex !== selectedRouteIndex) {
        trackEvent('route_option_selected', {
          option_index: selectedRouteIndex + 1,
          corridors: formatRouteCorridors(chosen),
          transfers: chosen.transfers,
          uses_angkot: chosen.usesAngkot,
          total_fare: chosen.totalFare,
        });
      }
      return { selectedRouteIndex };
    }),

  setSelectedStopId: (selectedStopId) => {
    if (selectedStopId && STOPS[selectedStopId]) {
      trackEvent('map_stop_inspected', {
        stop_id: selectedStopId,
        stop_name: STOPS[selectedStopId].name,
        action: 'view',
      });
    }
    set({ selectedStopId });
  },

  toggleFocusRoute: () => set((s) => ({ focusRoute: !s.focusRoute })),

  setFocusRoute: (focusRoute) => set({ focusRoute }),

  setFilterCorridorId: (id) =>
    set((s) => {
      const nextId = s.filterCorridorId === id ? 'ALL' : id;
      if (nextId !== 'ALL') {
        const corridor = CORRIDORS.find((c) => c.id === nextId);
        if (corridor) {
          trackEvent('corridor_explored', {
            corridor_id: corridor.id,
            corridor_code: corridor.code,
            operator: corridor.operator,
          });
        }
      }
      return {
        filterCorridorId: nextId,
        focusRoute: nextId !== 'ALL',
      };
    }),

  setOperatorFilter: (operatorFilter) =>
    set({
      operatorFilter,
      filterCorridorId: 'ALL',
      focusRoute: false,
    }),

  setCorridorQuery: (corridorQuery) => set({ corridorQuery }),

  triggerSimulation: (routeIndex) =>
    set((s) => ({
      selectedRouteIndex: routeIndex ?? s.selectedRouteIndex,
      focusRoute: true,
      simRunId: s.simRunId + 1,
    })),
}));
