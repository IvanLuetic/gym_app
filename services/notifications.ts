import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("workouts", {
      name: "Podsjetnici za trening",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  return finalStatus === "granted";
}

/**
 * Schedules a weekly repeating local notification for a given day/time.
 * `day` follows JS Date.getDay() convention: 0 = Sunday ... 6 = Saturday.
 * Returns the notification identifier so it can be cancelled later.
 */
export async function scheduleWeeklyWorkoutNotification(
  day: number,
  time: string,
  label: string,
): Promise<string | null> {
  const [hour, minute] = time.split(":").map(Number);

  // Subtract 2 hours for the reminder
  let notifHour = hour - 2;
  let notifDay = day;

  if (notifHour < 0) {
    notifHour += 24;
    notifDay = day - 1;
    if (notifDay < 0) notifDay = 6; // wrap Sunday -> Saturday
  }

  // expo-notifications weekday: 1 = Sunday ... 7 = Saturday
  const weekday = notifDay + 1;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Trening za 2 sata! 💪",
        body: `${label} počinje u ${time}.`,
      },
      trigger: {
        type: "weekly" as const,
        channelId: "workouts",
        weekday,
        hour: notifHour,
        minute,
      } as any,
    });
    return id;
  } catch (e) {
    console.error("Failed to schedule notification:", e);
    return null;
  }
}
export async function cancelNotification(id: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {
    console.error("Failed to cancel notification:", e);
  }
}
