import { useEffect } from "react";
import { useCalendarStore } from "../store/useCalendarStore";
import MonthView from "./views/MonthView";
import WeekView from "./views/WeekView";
import DayView from "./views/DayView";
import ScheduleView from "./views/ScheduleView";

/**
 * Hook to schedule and debug reminders
 */
function useReminders(events = []) {
  useEffect(() => {
    if (!("Notification" in window)) {
      console.warn("❌ Notifications not supported by this browser.");
      return;
    }

    console.log("🔔 Checking notification permission...");
    Notification.requestPermission().then((permission) => {
      console.log("🔔 Notification permission:", permission);
      if (permission !== "granted") {
        console.warn("⚠️ Notifications blocked by user.");
      }
    });

    const timers = [];

    console.log("🗓️ Scheduling reminders for events:", events);

    events.forEach((event, index) => {
      if (!event.reminders || event.reminders.length === 0) {
        console.log(`ℹ️ Event ${index}: "${event.title}" has no reminders.`);
        return;
      }

      const startTime = new Date(event.start_time);
      if (isNaN(startTime)) {
        console.warn(
          `⚠️ Event ${index}: Invalid start_time:`,
          event.start_time
        );
        return;
      }

      const startMillis = startTime.getTime();

      event.reminders.forEach((r, rIndex) => {
        const minutesBefore = parseInt(r.minutes_before || 0, 10);
        if (isNaN(minutesBefore)) {
          console.warn(
            `⚠️ Event ${index} reminder ${rIndex} has invalid minutes_before:`,
            r
          );
          return;
        }

        const notifyAt = startMillis - minutesBefore * 60 * 1000;
        const now = Date.now();
        const delay = notifyAt - now;

        console.log(
          `⏰ Reminder scheduled for "${event.title}" — ${minutesBefore} min before start. ` +
            `Start: ${startTime.toLocaleString()}, Notify At: ${new Date(
              notifyAt
            ).toLocaleString()}, Delay: ${delay}ms`
        );

        if (delay > 0) {
          const timer = setTimeout(() => {
            console.log(`🚨 Triggering notification for "${event.title}"`);
            new Notification(event.title || "Event Reminder", {
              body: `Starts at ${startTime.toLocaleTimeString()}`,
              icon: "/icon.png",
            });
          }, delay);

          timers.push(timer);
        } else {
          console.log(
            `⚠️ Skipped reminder for "${event.title}" (already past time).`
          );
        }
      });
    });

    return () => {
      console.log("🧹 Clearing all reminder timers...");
      timers.forEach(clearTimeout);
    };
  }, [events]);
}

/**
 * Main Calendar View Component
 */
function CalendarView({ onEventClick }) {
  const { currentView, events } = useCalendarStore();

  useReminders(events); // hook handles all notifications

  return (
    <div
      className="
        flex-1 overflow-auto 
        p-4 
        scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 
        transition-colors duration-300
      "
      style={{
        backgroundColor: "var(--color-bg-primary)",
        color: "var(--color-text-primary)",
      }}
    >
      {currentView === "month" && <MonthView onEventClick={onEventClick} />}
      {currentView === "week" && <WeekView onEventClick={onEventClick} />}
      {currentView === "day" && <DayView onEventClick={onEventClick} />}
      {currentView === "schedule" && (
        <ScheduleView onEventClick={onEventClick} />
      )}
    </div>
  );
}

export default CalendarView;
