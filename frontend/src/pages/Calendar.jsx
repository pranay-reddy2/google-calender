import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useCalendarStore } from "../store/useCalendarStore";
import { useAuthStore } from "../store/useAuthStore";
import { useHolidayStore } from "../store/useHolidayStore";

import CalendarHeader from "../components/CalendarHeader";
import CalendarSidebar from "../components/CalendarSidebar";
import CalendarView from "../components/CalendarView";
import EventModal from "../components/EventModal";
import NotificationCenter from "../components/NotificationCenter";
import UpcomingEvents from "../components/UpcomingEvents";
import HolidaySettings from "../components/HolidaySettings";

function Calendar() {
  const { user, logout } = useAuthStore();
  const {
    fetchCalendars,
    fetchSharedCalendars,
    fetchMyInvitations,
    fetchEvents,
    currentDate,
    currentView,
    selectedCalendars,
  } = useCalendarStore();

  const { fetchHolidays, fetchPreferences } = useHolidayStore();

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showUpcomingEvents, setShowUpcomingEvents] = useState(false);
  const [showHolidaySettings, setShowHolidaySettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true); // New state for sidebar toggle

  // 🔹 Initial load — fetch calendars, invitations, and preferences
  useEffect(() => {
    const initializeCalendar = async () => {
      try {
        await fetchCalendars();
        await fetchSharedCalendars();
        await fetchMyInvitations();
        await fetchPreferences();
      } catch (err) {
        console.error("Failed to initialize calendar:", err);
      }
    };
    initializeCalendar();
  }, []);

  // 🔹 Fetch events and holidays when date/view/calendars change
  useEffect(() => {
    if (selectedCalendars.length === 0) return;

    const { start, end } = getDateRange(currentDate, currentView);

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    Promise.all([
      fetchEvents(start, end).catch((err) =>
        console.error("Failed to fetch events:", err)
      ),
      fetchHolidays(startStr, endStr).catch((err) =>
        console.error("Failed to fetch holidays:", err)
      ),
    ]);
  }, [currentDate, currentView, selectedCalendars]);

  // 🔹 Date range helper
  const getDateRange = (date, view) => {
    const start = new Date(date);
    const end = new Date(date);

    if (view === "day") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (view === "week") {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      end.setDate(start.getDate() + 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (view === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 30);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleEventSaved = async () => {
    // Refresh events after save/delete
    const { start, end } = getDateRange(currentDate, currentView);
    await fetchEvents(start, end);
  };

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container">
        <CalendarHeader
          onCreateEvent={handleCreateEvent}
          onLogout={logout}
          user={user}
          onEventClick={handleEditEvent}
          onToggleUpcoming={() => setShowUpcomingEvents(!showUpcomingEvents)}
          onOpenHolidaySettings={() => setShowHolidaySettings(true)}
          onToggleSidebar={handleToggleSidebar}
        />

        <div className="main-wrapper">
          {showSidebar && <CalendarSidebar onCreateEvent={handleCreateEvent} />}
          <CalendarView onEventClick={handleEditEvent} />

          {showUpcomingEvents && (
            <div
              style={{
                width: "320px",
                borderLeft: "1px solid var(--color-border-light)",
                background: "var(--color-bg-primary)",
                overflowY: "auto",
                padding: "var(--space-4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-4)",
                }}
              >
                <h2
                  style={{
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "var(--font-weight-medium)",
                    color: "var(--color-primary-text)",
                    margin: 0,
                  }}
                >
                  Upcoming Events
                </h2>
                <button
                  onClick={() => setShowUpcomingEvents(false)}
                  className="icon-button"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
              <UpcomingEvents onEventClick={handleEditEvent} />
            </div>
          )}
        </div>

        <NotificationCenter />

        {showEventModal && (
          <EventModal
            event={selectedEvent}
            onClose={() => setShowEventModal(false)}
          />
        )}

        {showHolidaySettings && (
          <HolidaySettings
            isOpen={showHolidaySettings}
            onClose={() => setShowHolidaySettings(false)}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default Calendar;
