import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useCalendarStore } from "./store/useCalendarStore";

import Login from "./pages/Login";
import Calendar from "./pages/Calendar";

// ✅ Fallback client ID if env var is missing
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "689854857229-bdmk4ped13lh65dheqtd76dpformsa65.apps.googleusercontent.com";

function App() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  const { initTheme } = useThemeStore();

  const {
    fetchCalendars,
    fetchSharedCalendars,
    fetchEvents,
    currentDate,
    currentView,
    selectedCalendars,
  } = useCalendarStore();

  // 🔹 Initialize user and theme
  useEffect(() => {
    loadUser();
    initTheme();
  }, [loadUser, initTheme]);

  // 🔹 Fetch calendars after login
  useEffect(() => {
    if (!isAuthenticated) return;
    const initializeCalendars = async () => {
      await fetchCalendars();
      await fetchSharedCalendars();
    };
    initializeCalendars();
  }, [isAuthenticated, fetchCalendars, fetchSharedCalendars]);

  // 🔹 Fetch events whenever view/date/calendars change
  useEffect(() => {
    if (!isAuthenticated || selectedCalendars.length === 0) return;

    const getDateRange = (date, view) => {
      const start = new Date(date);
      const end = new Date(date);

      switch (view) {
        case "day":
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case "week":
          start.setDate(start.getDate() - start.getDay());
          start.setHours(0, 0, 0, 0);
          end.setDate(start.getDate() + 6);
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
        default:
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
      }

      return { startDate: start, endDate: end };
    };

    const { startDate, endDate } = getDateRange(currentDate, currentView);
    fetchEvents(startDate, endDate);
  }, [
    isAuthenticated,
    currentDate,
    currentView,
    selectedCalendars,
    fetchEvents,
  ]);

  // 🔹 Loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Wrap with GoogleOAuthProvider
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen">
        <BrowserRouter
          future={{
            v7_startTransition: true,
          }}
        >
          <Routes>
            <Route
              path="/login"
              element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/"
              element={
                isAuthenticated ? <Calendar /> : <Navigate to="/login" />
              }
            />
          </Routes>
        </BrowserRouter>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
