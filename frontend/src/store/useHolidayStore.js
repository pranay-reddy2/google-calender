import { create } from "zustand";

export const useHolidayStore = create((set, get) => ({
  holidays: [],
  preferences: [],
  isLoading: false,
  error: null,

  // 🔹 Load holidays for selected preferences
  fetchHolidays: async (startDate, endDate) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No auth token found — cannot fetch holidays");
      return;
    }

    // Convert Date objects to YYYY-MM-DD strings
    let startDateStr, endDateStr;

    if (startDate instanceof Date) {
      startDateStr = startDate.toISOString().split("T")[0];
    } else if (startDate) {
      startDateStr = startDate;
    } else {
      const currentYear = new Date().getFullYear();
      startDateStr = `${currentYear}-01-01`;
    }

    if (endDate instanceof Date) {
      endDateStr = endDate.toISOString().split("T")[0];
    } else if (endDate) {
      endDateStr = endDate;
    } else {
      const currentYear = new Date().getFullYear();
      endDateStr = `${currentYear}-12-31`;
    }

    set({ isLoading: true, error: null });

    try {
      // Build URL with query parameters
      const url = new URL("http://localhost:5050/api/holidays");
      url.searchParams.append("startDate", startDateStr);
      url.searchParams.append("endDate", endDateStr);

      console.log("Fetching holidays with URL:", url.toString());

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to load holidays:", res.status, errorText);
        throw new Error(`Failed to load holidays (${res.status})`);
      }

      const data = await res.json();
      console.log("Received holidays data:", data);
      console.log("Number of holidays:", data.holidays?.length || 0);
      set({ holidays: data.holidays || [] });
    } catch (err) {
      console.error("Error fetching holidays:", err);
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  // 🔹 Filter holidays for a specific date
  getHolidaysForDate: (date) => {
    const holidays = get().holidays;
    if (!date || holidays.length === 0) return [];

    const target = new Date(date);
    return holidays.filter((h) => {
      const hDate = new Date(h.date);
      return (
        hDate.getFullYear() === target.getFullYear() &&
        hDate.getMonth() === target.getMonth() &&
        hDate.getDate() === target.getDate()
      );
    });
  },

  // 🔹 Load user preferences
  fetchPreferences: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        "http://localhost:5050/api/holidays/preferences",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to load preferences:", text);
        throw new Error("Failed to load preferences");
      }

      const data = await res.json();
      console.log("Received preferences:", data);
      console.log("Number of preferences:", data.preferences?.length || 0);
      console.log(
        "Enabled preferences:",
        data.preferences?.filter((p) => p.isEnabled)
      );
      set({ preferences: data.preferences || [] });
    } catch (err) {
      console.error("Error fetching preferences:", err);
    }
  },

  // 🔹 Add a new holiday preference
  addPreference: async (countryCode, region = null) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        "http://localhost:5050/api/holidays/preferences",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            countryCode,
            region,
            isEnabled: true,
          }),
        }
      );

      if (res.ok) {
        console.log(
          `Added preference for ${countryCode}${region ? ` (${region})` : ""}`
        );
        await get().fetchPreferences();

        // Sync holidays for this country first
        const currentYear = new Date().getFullYear();
        console.log(`Syncing holidays for ${countryCode} ${currentYear}...`);
        await get().syncHolidays(countryCode, currentYear);

        // Then reload holidays
        await get().fetchHolidays(
          `${currentYear}-01-01`,
          `${currentYear}-12-31`
        );
      } else {
        console.error("Error adding preference:", await res.text());
      }
    } catch (err) {
      console.error("Error adding preference:", err);
    }
  },

  // 🔹 Toggle enable/disable preference
  togglePreference: async (pref) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        "http://localhost:5050/api/holidays/preferences",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            countryCode: pref.countryCode,
            region: pref.region,
            isEnabled: !pref.isEnabled,
          }),
        }
      );

      if (res.ok) {
        console.log(
          `Toggled preference for ${pref.countryCode} to ${!pref.isEnabled}`
        );
        await get().fetchPreferences();

        // Reload holidays with current year after toggling preference
        const currentYear = new Date().getFullYear();
        await get().fetchHolidays(
          `${currentYear}-01-01`,
          `${currentYear}-12-31`
        );
      } else {
        console.error("Error toggling preference:", await res.text());
      }
    } catch (err) {
      console.error("Error toggling preference:", err);
    }
  },

  // 🔹 Sync holidays for a country (call this after adding preferences)
  syncHolidays: async (countryCode, year) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5050/api/holidays/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ countryCode, year }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to sync holidays:", errorText);
        return;
      }

      const data = await res.json();
      console.log("Sync result:", data);
      return data;
    } catch (err) {
      console.error("Error syncing holidays:", err);
    }
  },

  // 🔹 Debug helper - check everything at once
  debugHolidaySystem: async () => {
    console.log("=== Holiday System Debug ===");

    // Check preferences
    await get().fetchPreferences();
    const prefs = get().preferences;
    console.log("Current preferences:", prefs);
    console.log(
      "Enabled preferences:",
      prefs.filter((p) => p.isEnabled)
    );

    if (prefs.length === 0) {
      console.warn("⚠️ No preferences set! Add preferences first.");
      return;
    }

    if (prefs.filter((p) => p.isEnabled).length === 0) {
      console.warn(
        "⚠️ No enabled preferences! Enable at least one preference."
      );
      return;
    }

    // Check holidays
    const currentYear = new Date().getFullYear();
    await get().fetchHolidays(`${currentYear}-01-01`, `${currentYear}-12-31`);
    const holidays = get().holidays;
    console.log("Current holidays:", holidays);
    console.log("Holiday count:", holidays.length);

    if (holidays.length === 0) {
      console.warn(
        "⚠️ No holidays found! Try syncing holidays for your preferred countries:"
      );
      prefs
        .filter((p) => p.isEnabled)
        .forEach((p) => {
          console.log(`- syncHolidays('${p.countryCode}', ${currentYear})`);
        });
    }

    console.log("=== End Debug ===");
  },
}));

// Expose to window for debugging
if (typeof window !== "undefined") {
  window.useHolidayStore = useHolidayStore;
}
