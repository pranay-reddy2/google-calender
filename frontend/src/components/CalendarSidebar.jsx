import { useState, useRef, useEffect } from "react";
import { useCalendarStore } from "../store/useCalendarStore";
import { useHolidayStore } from "../store/useHolidayStore";
import CalendarShareModal from "./CalendarShareModal";
import EventModal from "./EventModal";

function CalendarSidebar({ onCreateEvent }) {
  const {
    calendars,
    sharedCalendars,
    selectedCalendars,
    showHolidays,
    toggleShowHolidays,
    toggleCalendar,
    createCalendar,
    currentDate,
    setDate,
    fetchEvents,
    currentView,
  } = useCalendarStore();

  const { getHolidaysForDate } = useHolidayStore();

  const [showNewCalendar, setShowNewCalendar] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState("");
  const [shareCalendar, setShareCalendar] = useState(null);
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);

  const createDropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        createDropdownRef.current &&
        !createDropdownRef.current.contains(e.target)
      ) {
        setShowCreateDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Refresh events after modal closes
  const handleEventSaved = async () => {
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

    const { start, end } = getDateRange(currentDate, currentView);
    await fetchEvents(start, end);
  };

  // Calendar List Handlers
  const handleCreateCalendar = async (e) => {
    e.preventDefault();
    if (!newCalendarName.trim()) return;
    try {
      await createCalendar({
        name: newCalendarName,
        description: "",
        color: getRandomColor(),
      });
      setNewCalendarName("");
      setShowNewCalendar(false);
    } catch (error) {
      console.error("Failed to create calendar:", error);
    }
  };

  const getRandomColor = () => {
    const colors = [
      "#1a73e8",
      "#d93025",
      "#f4b400",
      "#0f9d58",
      "#ab47bc",
      "#ff6d00",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Mini Calendar Logic
  const getMiniCalendarDays = () => {
    const year = miniCalendarDate.getFullYear();
    const month = miniCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    return days;
  };

  const isToday = (date) => date.toDateString() === new Date().toDateString();
  const isSelected = (date) =>
    date.toDateString() === currentDate.toDateString();
  const handlePrevMonth = () =>
    setMiniCalendarDate(
      new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() - 1)
    );
  const handleNextMonth = () =>
    setMiniCalendarDate(
      new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1)
    );
  const handleDateClick = (date) => setDate(date);

  // Check if a date has holidays
  const hasHoliday = (date) => {
    if (!showHolidays) return false;
    const holidays = getHolidaysForDate(date);
    return holidays.length > 0;
  };

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const days = getMiniCalendarDays();

  return (
    <>
      <aside
        className="w-sidebar p-2 overflow-y-auto h-sidebar scrollbar-thin"
        style={{
          borderRight: "1px solid var(--color-border-light)",
          background: "var(--color-bg-primary)",
        }}
      >
        {/* === Create Button === */}
        <div className="relative inline-block my-2" ref={createDropdownRef}>
          <div
            className="flex items-center rounded-[28px] shadow hover:shadow-md transition-shadow"
            style={{ background: "var(--color-bg-primary)" }}
          >
            <button
              className="inline-flex items-center gap-2 px-6 pr-4 h-14 bg-none border-none rounded-l-[28px] text-sm font-medium cursor-pointer"
              style={{ color: "var(--color-primary-text)" }}
              onClick={() => setShowEventModal(true)}
            >
              <svg width="36" height="36" viewBox="0 0 36 36">
                <path fill="#34A853" d="M16 16v14h4V20z" />
                <path fill="#4285F4" d="M30 16H20l-4 4h14z" />
                <path fill="#FBBC04" d="M6 16v4h10l4-4z" />
                <path fill="#EA4335" d="M20 16V6h-4v14z" />
                <path fill="none" d="M0 0h36v36H0z" />
              </svg>
              <span>Create</span>
            </button>
            <button
              className="h-14 w-11 border-none bg-none rounded-r-[28px] cursor-pointer flex items-center justify-center text-2xl"
              style={{
                color: "var(--color-secondary-text)",
                borderLeft: "1px solid var(--color-border-light)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--color-bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
              onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              aria-haspopup="true"
              aria-expanded={showCreateDropdown}
            >
              <span className="material-icons-outlined">arrow_drop_down</span>
            </button>
          </div>

          {showCreateDropdown && (
            <div
              className="absolute top-[60px] left-0 w-45 rounded-lg shadow-lg z-50 py-2 animate-fadeIn"
              style={{
                background: "var(--color-bg-primary)",
                border: "1px solid var(--color-border-light)",
              }}
            >
              <button
                className="flex items-center gap-3 w-full border-none bg-none text-left px-4 py-2 text-sm cursor-pointer"
                style={{ color: "var(--color-primary-text)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--color-bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onClick={() => {
                  setShowEventModal(true);
                  setShowCreateDropdown(false);
                }}
              >
                <span
                  className="material-icons-outlined text-xl"
                  style={{ color: "var(--color-secondary-text)" }}
                >
                  event
                </span>
                <span>Event</span>
              </button>
              <button
                className="flex items-center gap-3 w-full border-none bg-none text-left px-4 py-2 text-sm cursor-pointer"
                style={{ color: "var(--color-primary-text)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--color-bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onClick={() => {
                  setShowEventModal(true);
                  setShowCreateDropdown(false);
                }}
              >
                <span
                  className="material-icons-outlined text-xl"
                  style={{ color: "var(--color-secondary-text)" }}
                >
                  task_alt
                </span>
                <span>Task</span>
              </button>
            </div>
          )}
        </div>

        {/* === Mini Calendar === */}
        <div className="mb-6 px-2">
          <div className="flex justify-between items-center mb-3 px-1">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-primary-text)" }}
            >
              {miniCalendarDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <div className="flex gap-0">
              <button
                className="w-8 h-8 border-none bg-none rounded-full flex items-center justify-center cursor-pointer transition-colors"
                style={{ color: "var(--color-secondary-text)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--color-bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onClick={handlePrevMonth}
              >
                <span className="material-icons-outlined text-[18px]">
                  chevron_left
                </span>
              </button>
              <button
                className="w-8 h-8 border-none bg-none rounded-full flex items-center justify-center cursor-pointer transition-colors"
                style={{ color: "var(--color-secondary-text)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--color-bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onClick={handleNextMonth}
              >
                <span className="material-icons-outlined text-[18px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="text-center text-[11px] font-medium py-1"
                style={{ color: "var(--color-secondary-text)" }}
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, index) => (
              <button
                key={index}
                className="aspect-square border-none rounded-full text-xs cursor-pointer flex flex-col items-center justify-center relative transition-colors"
                style={{
                  background: isSelected(day.date)
                    ? "var(--color-accent-blue)"
                    : isToday(day.date)
                    ? "var(--color-blue-50)"
                    : "transparent",
                  color: isSelected(day.date)
                    ? "white"
                    : isToday(day.date)
                    ? "var(--color-accent-blue)"
                    : !day.isCurrentMonth
                    ? "var(--color-tertiary-text)"
                    : "var(--color-primary-text)",
                  opacity: !day.isCurrentMonth ? "0.5" : "1",
                  fontWeight:
                    isToday(day.date) || isSelected(day.date) ? "600" : "400",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected(day.date)) {
                    e.currentTarget.style.background = isToday(day.date)
                      ? "var(--color-blue-50)"
                      : "var(--color-bg-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected(day.date)) {
                    e.currentTarget.style.background = isToday(day.date)
                      ? "var(--color-blue-50)"
                      : "transparent";
                  }
                }}
                onClick={() => handleDateClick(day.date)}
              >
                <span>{day.date.getDate()}</span>
                {/* Holiday Dot */}
                {hasHoliday(day.date) && (
                  <div
                    className="absolute bottom-1 w-1 h-1 rounded-full"
                    style={{
                      backgroundColor: isSelected(day.date)
                        ? "white"
                        : "#d93025",
                    }}
                    title="Holiday"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* === My Calendars === */}
        <div className="mb-6 px-2">
          <div className="flex justify-between items-center mb-2 px-2">
            <h3
              className="text-sm font-medium m-0"
              style={{ color: "var(--color-primary-text)" }}
            >
              My calendars
            </h3>
            <button
              className="w-8 h-8 border-none bg-none rounded-full flex items-center justify-center cursor-pointer"
              style={{ color: "var(--color-secondary-text)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--color-bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
              onClick={() => setShowNewCalendar(!showNewCalendar)}
            >
              <span className="material-icons-outlined text-[18px]">add</span>
            </button>
          </div>

          {showNewCalendar && (
            <form
              className="p-2 rounded mb-2"
              style={{ background: "var(--color-bg-hover)" }}
              onSubmit={handleCreateCalendar}
            >
              <input
                type="text"
                placeholder="Calendar name"
                value={newCalendarName}
                onChange={(e) => setNewCalendarName(e.target.value)}
                className="input-field mb-2 text-sm"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button type="submit" className="btn-primary px-3 py-1 text-sm">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCalendar(false)}
                  className="btn-secondary px-3 py-1 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="flex flex-col gap-0.5">
            {calendars.map((calendar) => (
              <div
                key={calendar.id}
                className="flex items-center gap-1 rounded-[20px] transition-colors group"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--color-bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <label className="flex items-center gap-3 px-3 py-1.5 flex-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedCalendars.includes(calendar.id)}
                    onChange={() => toggleCalendar(calendar.id)}
                    className="cursor-pointer w-4 h-4 accent-google-blue-600"
                  />
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: calendar.color }}
                  />
                  <span
                    className="flex-1 text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ color: "var(--color-primary-text)" }}
                  >
                    {calendar.name}
                  </span>
                </label>
                {calendar.owner_id && (
                  <button
                    className="w-8 h-8 bg-none border-none rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    style={{ color: "var(--color-secondary-text)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--color-border-light)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                    onClick={() => setShareCalendar(calendar)}
                    title="More options"
                  >
                    <span className="material-icons-outlined text-[18px]">
                      more_vert
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* === Shared Calendars === */}
        {sharedCalendars && sharedCalendars.length > 0 && (
          <div className="mb-6 px-2">
            <div className="flex justify-between items-center mb-2 px-2">
              <h3
                className="text-sm font-medium m-0"
                style={{ color: "var(--color-primary-text)" }}
              >
                Shared with me
              </h3>
            </div>

            <div className="flex flex-col gap-0.5">
              {sharedCalendars.map((calendar) => (
                <div
                  key={calendar.id}
                  className="flex items-center gap-1 rounded-[20px] transition-colors group"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--color-bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <label className="flex items-center gap-3 px-3 py-1.5 flex-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedCalendars.includes(calendar.id)}
                      onChange={() => toggleCalendar(calendar.id)}
                      className="cursor-pointer w-4 h-4 accent-google-blue-600"
                    />
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: calendar.color }}
                    />
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span
                        className="text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{ color: "var(--color-primary-text)" }}
                      >
                        {calendar.name}
                      </span>
                      <span
                        className="material-icons-outlined text-[14px] flex-shrink-0"
                        style={{ color: "var(--color-tertiary-text)" }}
                        title="Shared calendar"
                      >
                        people
                      </span>
                    </div>
                  </label>
                  <div
                    className="px-2 text-xs whitespace-nowrap"
                    style={{ color: "var(--color-secondary-text)" }}
                  >
                    {calendar.permission === "manage"
                      ? "Manage"
                      : calendar.permission === "edit"
                      ? "Edit"
                      : "View"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === Other Calendars (Holidays) === */}
        <div className="mb-6 px-2">
          <div className="flex justify-between items-center mb-2 px-2">
            <h3
              className="text-sm font-medium m-0"
              style={{ color: "var(--color-primary-text)" }}
            >
              Other calendars
            </h3>
          </div>

          <div className="flex flex-col gap-0.5">
            <div
              className="flex items-center gap-1 rounded-[20px] transition-colors"
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--color-bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <label className="flex items-center gap-3 px-3 py-1.5 flex-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showHolidays}
                  onChange={toggleShowHolidays}
                  className="cursor-pointer w-4 h-4 accent-google-blue-600"
                />
                <span
                  className="material-icons-outlined text-[16px] flex-shrink-0"
                  style={{ color: "var(--color-secondary-text)" }}
                >
                  event
                </span>
                <span
                  className="flex-1 text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ color: "var(--color-primary-text)" }}
                >
                  Holidays
                </span>
              </label>
            </div>
          </div>
        </div>

        {shareCalendar && (
          <CalendarShareModal
            calendar={shareCalendar}
            onClose={() => setShareCalendar(null)}
          />
        )}
      </aside>

      {/* EventModal - Single unified modal */}
      {showEventModal && (
        <EventModal
          event={null}
          onClose={() => setShowEventModal(false)}
          onEventSaved={handleEventSaved}
        />
      )}
    </>
  );
}

export default CalendarSidebar;
