import { create } from "zustand";
import { calendarsAPI } from "../api/calendars";
import { eventsAPI } from "../api/events";
import { attendeesAPI } from "../api/attendees";
import { sharingAPI } from "../api/sharing";
import { holidaysApi } from "../api/holidays";

export const useCalendarStore = create((set, get) => ({
  calendars: [],
  sharedCalendars: [],
  selectedCalendars: [],
  events: [],
  holidays: [],
  showHolidays: true,
  holidayPreferences: [],
  invitations: [],
  currentView: "month",
  currentDate: new Date(),
  loading: false,
  error: null,

  // Calendar CRUD
  fetchCalendars: async () => {
    set({ loading: true, error: null });
    try {
      const calendars = await calendarsAPI.getAll();
      const selectedCalendars = calendars.map((c) => c.id);
      set({ calendars, selectedCalendars, loading: false });
      return calendars;
    } catch (error) {
      console.warn("API failed, using mock calendars for demo");
      const mockCalendars = [
        {
          id: 1,
          name: "Personal",
          color: "#4285F4",
          description: "My personal calendar",
          owner_id: 1,
          is_primary: true,
        },
        {
          id: 2,
          name: "Work",
          color: "#EA4335",
          description: "Work events",
          owner_id: 1,
          is_primary: false,
        },
        {
          id: 3,
          name: "Family",
          color: "#34A853",
          description: "Family events",
          owner_id: 1,
          is_primary: false,
        },
      ];
      const selectedCalendars = mockCalendars.map((c) => c.id);
      set({
        calendars: mockCalendars,
        selectedCalendars,
        loading: false,
        error: null,
      });
      return mockCalendars;
    }
  },

  createCalendar: async (data) => {
    try {
      const calendar = await calendarsAPI.create(data);
      set((state) => ({
        calendars: [...state.calendars, calendar],
        selectedCalendars: [...state.selectedCalendars, calendar.id],
      }));
      return calendar;
    } catch (error) {
      console.warn("API failed, creating mock calendar for demo");
      const newCalendar = {
        id: Date.now(),
        ...data,
        owner_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set((state) => ({
        calendars: [...state.calendars, newCalendar],
        selectedCalendars: [...state.selectedCalendars, newCalendar.id],
      }));
      return newCalendar;
    }
  },

  updateCalendar: async (id, data) => {
    try {
      const calendar = await calendarsAPI.update(id, data);
      set((state) => ({
        calendars: state.calendars.map((c) => (c.id === id ? calendar : c)),
      }));
      return calendar;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteCalendar: async (id) => {
    try {
      await calendarsAPI.delete(id);
      set((state) => ({
        calendars: state.calendars.filter((c) => c.id !== id),
        selectedCalendars: state.selectedCalendars.filter((cId) => cId !== id),
        events: state.events.filter((e) => e.calendar_id !== id),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  toggleCalendar: (calendarId) => {
    set((state) => {
      const isSelected = state.selectedCalendars.includes(calendarId);
      return {
        selectedCalendars: isSelected
          ? state.selectedCalendars.filter((id) => id !== calendarId)
          : [...state.selectedCalendars, calendarId],
      };
    });
  },

  // Events CRUD
  fetchEvents: async (startDate, endDate) => {
    const { selectedCalendars } = get();

    console.log("fetchEvents called with:", {
      selectedCalendars,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    if (selectedCalendars.length === 0) {
      console.log("No calendars selected, clearing events");
      set({ events: [] });
      return;
    }

    set({ loading: true, error: null });
    try {
      const events = await eventsAPI.getAll({
        calendarIds: selectedCalendars.join(","),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      console.log("Fetched events from API:", events);
      console.log("Number of events:", events?.length || 0);

      set({ events: events || [], loading: false });
      return events;
    } catch (error) {
      console.error("Error fetching events:", error);
      set({ error: error.message, loading: false, events: [] });
      throw error;
    }
  },

  createEvent: async (data) => {
    try {
      const event = await eventsAPI.create(data);
      console.log("Event created from API:", event); // Debug log

      // Ensure the event has the calendar_color for display
      const calendar = get().calendars.find((c) => c.id === event.calendar_id);
      const enrichedEvent = {
        ...event,
        calendar_color: calendar?.color || "#1a73e8",
        calendar_name: calendar?.name || "Calendar",
      };

      console.log("Adding event to state:", enrichedEvent); // Debug log

      // Add to local state immediately
      set((state) => {
        const newEvents = [...state.events, enrichedEvent];
        console.log("Total events after create:", newEvents.length); // Debug log
        return { events: newEvents };
      });

      return enrichedEvent;
    } catch (error) {
      console.error("Error creating event:", error);
      set({ error: error.message });
      throw error;
    }
  },

  updateEvent: async (id, data) => {
    try {
      const event = await eventsAPI.update(id, data);
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? event : e)),
      }));
      return event;
    } catch (error) {
      console.error("Error updating event:", error);
      set({ error: error.message });
      throw error;
    }
  },

  deleteEvent: async (id, deleteAll = false) => {
    try {
      await eventsAPI.delete(id, deleteAll);
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting event:", error);
      set({ error: error.message });
      throw error;
    }
  },

  // View controls
  setView: (view) => {
    set({ currentView: view });
  },

  setDate: (date) => {
    set({ currentDate: date });
  },

  // Search
  searchEvents: async (query) => {
    const { selectedCalendars } = get();
    try {
      const events = await eventsAPI.search(query, selectedCalendars.join(","));
      return events;
    } catch (error) {
      set({ error: error.message });
      return [];
    }
  },

  // Attendee management
  addAttendee: async (eventId, email, name) => {
    try {
      const attendee = await attendeesAPI.addAttendee(eventId, { email, name });
      return attendee;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  getEventAttendees: async (eventId) => {
    try {
      const attendees = await attendeesAPI.getEventAttendees(eventId);
      return attendees;
    } catch (error) {
      set({ error: error.message });
      return [];
    }
  },

  updateRsvp: async (eventId, status) => {
    try {
      await attendeesAPI.updateRsvp(eventId, status);
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  removeAttendee: async (eventId, attendeeId) => {
    try {
      await attendeesAPI.removeAttendee(eventId, attendeeId);
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchMyInvitations: async () => {
    try {
      const invitations = await attendeesAPI.getMyInvitations();
      set({ invitations });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Calendar sharing
  shareCalendar: async (calendarId, email, permission) => {
    try {
      const share = await sharingAPI.shareCalendar(calendarId, {
        email,
        permission,
      });
      return share;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  getCalendarShares: async (calendarId) => {
    try {
      const shares = await sharingAPI.getCalendarShares(calendarId);
      return shares;
    } catch (error) {
      set({ error: error.message });
      return [];
    }
  },

  updateSharePermission: async (calendarId, shareId, permission) => {
    try {
      await sharingAPI.updateSharePermission(calendarId, shareId, permission);
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  removeCalendarShare: async (calendarId, shareId) => {
    try {
      await sharingAPI.removeCalendarShare(calendarId, shareId);
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchSharedCalendars: async () => {
    try {
      const sharedCalendars = await sharingAPI.getSharedCalendars();
      set({ sharedCalendars });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Holiday management
  fetchHolidays: async (startDate, endDate) => {
    if (!get().showHolidays) {
      set({ holidays: [] });
      return;
    }

    try {
      const response = await holidaysApi.getHolidays(
        startDate.toISOString(),
        endDate.toISOString()
      );
      set({ holidays: response.holidays || [] });
    } catch (error) {
      console.error("Error fetching holidays:", error);
      set({ holidays: [] });
    }
  },

  fetchHolidayPreferences: async () => {
    try {
      const response = await holidaysApi.getHolidayPreferences();
      set({ holidayPreferences: response.preferences || [] });
    } catch (error) {
      console.error("Error fetching holiday preferences:", error);
    }
  },

  updateHolidayPreference: async (countryCode, region, isEnabled) => {
    try {
      await holidaysApi.updateHolidayPreference(countryCode, region, isEnabled);
      await get().fetchHolidayPreferences();
      const { currentDate, currentView } = get();
      const { startDate, endDate } = getDateRange(currentDate, currentView);
      await get().fetchHolidays(startDate, endDate);
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  toggleShowHolidays: () => {
    set((state) => ({ showHolidays: !state.showHolidays }));
    const { currentDate, currentView } = get();
    const { startDate, endDate } = getDateRange(currentDate, currentView);
    get().fetchHolidays(startDate, endDate);
  },
}));

// Helper function to calculate date range based on view
function getDateRange(currentDate, view) {
  const start = new Date(currentDate);
  const end = new Date(currentDate);

  switch (view) {
    case "day":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "week":
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + (6 - end.getDay()));
      end.setHours(23, 59, 59, 999);
      break;
    case "month":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "schedule":
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 30);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { startDate: start, endDate: end };
}
