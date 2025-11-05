import { useState, useRef, useEffect } from "react";
import { useCalendarStore } from "../store/useCalendarStore";
import SearchBar from "./SearchBar";
import SettingsModal from "./SettingsModal";

function CalendarHeader({
  onCreateEvent,
  onLogout,
  user,
  onEventClick,
  onToggleUpcoming,
  onOpenHolidaySettings,
  onToggleSidebar,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const helpMenuRef = useRef(null);

  const { currentView, setView, currentDate, setDate } = useCalendarStore();

  // Close help menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(e.target)) {
        setShowHelpMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (currentView === "day") newDate.setDate(newDate.getDate() - 1);
    else if (currentView === "week") newDate.setDate(newDate.getDate() - 7);
    else if (currentView === "month") newDate.setMonth(newDate.getMonth() - 1);
    setDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === "day") newDate.setDate(newDate.getDate() + 1);
    else if (currentView === "week") newDate.setDate(newDate.getDate() + 7);
    else if (currentView === "month") newDate.setMonth(newDate.getMonth() + 1);
    setDate(newDate);
  };

  const handleToday = () => setDate(new Date());

  const getDateDisplay = () => {
    const options =
      currentView === "month"
        ? { year: "numeric", month: "long" }
        : { year: "numeric", month: "long", day: "numeric" };
    return currentDate.toLocaleDateString("en-US", options);
  };

  const handleViewChange = (view) => {
    setView(view);
    setShowViewDropdown(false);
  };

  return (
    <>
      <header className="top-header">
        {/* Left Section */}
        <div className="header-left">
          <button
            className="icon-button"
            title="Main menu"
            aria-label="Main menu"
            onClick={onToggleSidebar}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
                fill="currentColor"
              />
            </svg>
          </button>

          <svg
            className="logo"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
              fill="#4285F4"
            />
          </svg>

          {/* Buttons moved before date */}
          <div className="header-center">
            <span className="calendar-label text-lg font-medium mr-2">
              Calendar
            </span>

            <button onClick={handleToday} className="today-button">
              Today
            </button>
            <button
              onClick={handlePrevious}
              className="icon-button"
              title="Previous"
              aria-label="Previous"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="icon-button"
              title="Next"
              aria-label="Next"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          <h1 className="current-date">{getDateDisplay()}</h1>
        </div>

        {/* Right Section */}
        <div className="header-right" ref={helpMenuRef}>
          <SearchBar onEventClick={onEventClick} />

          {/* Question Mark Dropdown */}
          <div className="relative">
            <button
              className="icon-button"
              title="Help"
              aria-label="Help"
              onClick={() => setShowHelpMenu((prev) => !prev)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"
                  fill="currentColor"
                />
              </svg>
            </button>

            {showHelpMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-neutral-800">
                  Help
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-neutral-800">
                  Training
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-neutral-800">
                  Send feedback to Google
                </button>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="icon-button"
            title="Settings"
            aria-label="Settings"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* View Switcher */}
          <div className="view-switcher-container">
            <button
              className="view-switcher"
              onClick={() => setShowViewDropdown(!showViewDropdown)}
              aria-expanded={showViewDropdown}
              aria-haspopup="true"
            >
              <span className="view-switcher-text">
                {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
              </span>
              <svg
                className="dropdown-arrow"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7 10l5 5 5-5z" fill="currentColor" />
              </svg>
            </button>

            {showViewDropdown && (
              <div className="view-switcher-dropdown">
                <button
                  className={`view-option ${
                    currentView === "day" ? "active" : ""
                  }`}
                  onClick={() => handleViewChange("day")}
                >
                  Day
                </button>
                <button
                  className={`view-option ${
                    currentView === "week" ? "active" : ""
                  }`}
                  onClick={() => handleViewChange("week")}
                >
                  Week
                </button>
                <button
                  className={`view-option ${
                    currentView === "month" ? "active" : ""
                  }`}
                  onClick={() => handleViewChange("month")}
                >
                  Month
                </button>
                <button
                  className={`view-option ${
                    currentView === "schedule" ? "active" : ""
                  }`}
                  onClick={() => handleViewChange("schedule")}
                >
                  Schedule
                </button>
              </div>
            )}
          </div>

          {/* Google Apps Icon */}
          <button
            className="icon-button"
            title="Google apps"
            aria-label="Google apps"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Avatar */}
          <div className="user-avatar">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </header>

      {showViewDropdown && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
          }}
          onClick={() => setShowViewDropdown(false)}
        />
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}

export default CalendarHeader;
