import { Pedometer } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

interface PedometerState {
  isAvailable: boolean;
  isLoading: boolean;
  todaySteps: number;
  error: string | null;
  permissionGranted: boolean;
}

function getStartOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function usePedometer() {
  const [state, setState] = useState<PedometerState>({
    isAvailable: false,
    isLoading: true,
    todaySteps: 0,
    error: null,
    permissionGranted: false,
  });

  const subscriptionRef = useRef<Pedometer.Subscription | null>(null);

  // --- iOS implementation ---
  const initIOS = useCallback(async () => {
    const available = await Pedometer.isAvailableAsync();
    if (!available) {
      setState((s) => ({ ...s, isAvailable: false, isLoading: false }));
      return;
    }

    try {
      const result = await Pedometer.getStepCountAsync(
        getStartOfDay(),
        new Date(),
      );
      setState({
        isAvailable: true,
        isLoading: false,
        todaySteps: result.steps,
        error: null,
        permissionGranted: true,
      });
    } catch (e) {
      setState((s) => ({
        ...s,
        isAvailable: true,
        isLoading: false,
        error: String(e),
        permissionGranted: true,
      }));
    }

    subscriptionRef.current = Pedometer.watchStepCount((result) => {
      setState((s) => ({ ...s, todaySteps: s.todaySteps + result.steps }));
    });
  }, []);

  // --- Android implementation ---
  const fetchAndroidSteps = useCallback(async () => {
    try {
      const HC = await import("react-native-health-connect");
      const result = await HC.readRecords("Steps", {
        timeRangeFilter: {
          operator: "between",
          startTime: getStartOfDay().toISOString(),
          endTime: new Date().toISOString(),
        },
      });
      const total = (result.records as any[]).reduce(
        (sum: number, r: any) => sum + (r.count ?? 0),
        0,
      );
      setState((s) => ({
        ...s,
        isAvailable: true,
        isLoading: false,
        todaySteps: total,
        error: null,
        permissionGranted: true,
      }));
    } catch (e) {
      console.error("fetchAndroidSteps error:", e);
      setState((s) => ({ ...s, isLoading: false, error: String(e) }));
    }
  }, []);

  const initAndroid = useCallback(async () => {
    try {
      const HC = await import("react-native-health-connect");
      const sdkStatus = await HC.getSdkStatus();
      const initialized = await HC.initialize();
      if (!initialized) {
        setState({
          isAvailable: false,
          isLoading: false,
          todaySteps: 0,
          error: "Health Connect not available on this device",
          permissionGranted: false,
        });
        return;
      }

      // Check existing permissions on init
      const granted = await HC.getGrantedPermissions();
      const hasSteps = (granted as any[]).some(
        (p: any) => p.recordType === "Steps" && p.accessType === "read",
      );

      if (!hasSteps) {
        setState({
          isAvailable: true,
          isLoading: false,
          todaySteps: 0,
          error: null,
          permissionGranted: false,
        });
        return;
      }

      await fetchAndroidSteps();
    } catch (e) {
      console.error("initAndroid error:", e);
      setState({
        isAvailable: false,
        isLoading: false,
        todaySteps: 0,
        error: String(e),
        permissionGranted: false,
      });
    }
  }, [fetchAndroidSteps]);

  useEffect(() => {
    if (Platform.OS === "ios") {
      initIOS();
    } else if (Platform.OS === "android") {
      initAndroid();
    } else {
      setState({
        isAvailable: false,
        isLoading: false,
        todaySteps: 0,
        error: "Unsupported platform",
        permissionGranted: false,
      });
    }

    return () => {
      subscriptionRef.current?.remove();
    };
  }, []);

  // Re-fetch on Android when app is opened
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active" && state.permissionGranted) {
        fetchAndroidSteps();
      }
    };
    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, [fetchAndroidSteps, state.permissionGranted]);

  const requestPermission = useCallback(async () => {
    if (Platform.OS !== "android") return;

    const tryRequest = async (): Promise<boolean> => {
      const HC = await import("react-native-health-connect");
      const granted = await HC.requestPermission([
        { accessType: "read", recordType: "Steps" },
      ]);
      return (granted as any[]).some((p: any) => p.recordType === "Steps");
    };

    try {
      const hasSteps = await tryRequest();
      if (hasSteps) {
        await fetchAndroidSteps();
      } else {
        setState((s) => ({ ...s, permissionGranted: false }));
      }
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      try {
        const hasSteps = await tryRequest();
        if (hasSteps) {
          await fetchAndroidSteps();
        } else {
          setState((s) => ({ ...s, permissionGranted: false }));
        }
      } catch (e2) {
        setState((s) => ({ ...s, error: String(e2) }));
      }
    }
  }, [fetchAndroidSteps]);
  const refresh = useCallback(() => {
    if (Platform.OS === "android") return fetchAndroidSteps();
    return Promise.resolve();
  }, [fetchAndroidSteps]);

  return { ...state, refresh, requestPermission };
}
