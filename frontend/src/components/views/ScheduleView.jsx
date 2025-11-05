// src/components/ScheduleView.jsx
import React, { useMemo } from "react";
import { useCalendarStore } from "../../store/useCalendarStore";
import { useHolidayStore } from "../../store/useHolidayStore";

// --- Helper Functions (moved outside component) ---

/**
 * Helper to format event times
 */
const formatEventTime = (event) => {
  if (event.is_all_day) {
    return "All-day";
  }
  try {
    const options = { hour: "numeric", minute: "2-digit" };
    const start = new Date(event.start_time).toLocaleTimeString(
      "en-US",
      options
    );
    const end = new Date(event.end_time).toLocaleTimeString("en-US", options);
    return `${start} - ${end}`;
  } catch {
    return "Invalid time";
  }
};

/**
 * Helper to get a clean date string key
 */
const getDateKey = (date) => {
  try {
    return new Date(date).toDateString();
  } catch {
    return null;
  }
};

// --- Main ScheduleView Component ---

function ScheduleView({ onEventClick }) {
  const { events, showHolidays } = useCalendarStore();
  const { holidays } = useHolidayStore();

  /**
   * This useMemo block is already well-optimized.
   * 1. Sorts events once.
   * 2. Groups events and holidays into a Map.
   * 3. Converts map to array and sorts chronologically.
   */
  const sortedDays = useMemo(() => {
    const grouped = new Map();

    // 1. Sort all events by start time
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );

    // 2. Group sorted events
    sortedEvents.forEach((event) => {
      const dateKey = getDateKey(event.start_time);
      if (!dateKey) return;

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, { events: [], holidays: [] });
      }
      grouped.get(dateKey).events.push(event);
    });

    // 3. Group holidays
    if (showHolidays) {
      holidays.forEach((holiday) => {
        const dateKey = getDateKey(holiday.date);
        if (!dateKey) return;

        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, { events: [], holidays: [] });
        }
        grouped.get(dateKey).holidays.push(holiday);
      });
    }

    // 4. Convert map to array and sort by date
    const allEntries = Array.from(grouped.entries());
    allEntries.sort((a, b) => new Date(a[0]) - new Date(b[0]));

    return allEntries;
  }, [events, holidays, showHolidays]);

  return (
    <div className="h-full overflow-auto bg-white dark:bg-zinc-900 p-6">
      <h2 className="text-2xl font-normal text-zinc-800 dark:text-zinc-200 mb-6">
        Schedule
      </h2>

      {/* Render the memoized and sorted data */}
      {sortedDays.length > 0 ? (
        sortedDays.map(([dateStr, dayData]) => (
          <ScheduleDay
            key={dateStr}
            dateStr={dateStr}
            dayData={dayData}
            onEventClick={onEventClick}
          />
        ))
      ) : (
        /* Empty State */
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          <span className="material-icons-outlined text-5xl mb-3 opacity-30">
            event_busy
          </span>
          <div className="text-lg">No events or holidays scheduled</div>
        </div>
      )}
    </div>
  );
}
export default ScheduleView;

// --- Sub-Components (for Modularity and Readability) ---

/**
 * Renders all items for a single day.
 */
const ScheduleDay = React.memo(({ dateStr, dayData, onEventClick }) => {
  const { events: dateEvents, holidays: dateHolidays } = dayData;

  const dateLabel = new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mb-8">
      {/* Date Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
          {dateLabel}
        </div>
        {dateHolidays.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full text-xs text-red-700 dark:text-red-300">
            <span>🎉</span>
            <span>{dateHolidays[0].name}</span>
          </div>
        )}
      </div>

      {/* Holiday details */}
      {dateHolidays.length > 0 && (
        <div className="mb-3 space-y-2">
          {dateHolidays.map((holiday) => (
            <ScheduleHolidayItem key={holiday.id} holiday={holiday} />
          ))}
        </div>
      )}

      {/* Events */}
      {dateEvents.length > 0 && (
        <div className="space-y-2">
          {dateEvents.map((event) => (
            <ScheduleEventItem
              key={event.id}
              event={event}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      )}
    </div>
  );
});

/**
 * Renders a single holiday card.
 */
const ScheduleHolidayItem = React.memo(({ holiday }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
    <span className="text-2xl">🎉</span>
    <div className="flex-1">
      <div className="font-medium text-red-800 dark:text-red-200">
        {holiday.name}
      </div>
      {holiday.description && (
        <div className="text-sm text-red-600 dark:text-red-300 mt-0.5">
          {holiday.description}
        </div>
      )}
      <div className="flex gap-2 mt-1">
        {holiday.isNational && (
          <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded">
            National Holiday
          </span>
        )}
      </div>
    </div>
  </div>
));

/**
 * Renders a single event card.
 */
const ScheduleEventItem = React.memo(({ event, onEventClick }) => {
  // Define click handler inside to ensure React.memo works
  const handleClick = () => onEventClick(event);

  return (
    <div
      className="flex gap-3 p-3 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
      onClick={handleClick}
    >
      {/*
       * LAYOUT FIX: Parent `flex` container no longer has `items-start`,
       * so `h-full` will now correctly stretch the bar.
       */}
      <div
        className="w-1 h-full rounded-full flex-shrink-0"
        style={{
          backgroundColor: event.calendar_color || "#1a73e8",
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {formatEventTime(event)}
          </span>
        </div>
        <div className="font-medium text-zinc-800 dark:text-zinc-200 mb-1">
          {event.title}
        </div>
        {event.location && (
          <div className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            <span className="material-icons-outlined text-sm">place</span>
            {event.location}
          </div>
        )}
        {event.description && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
            {event.description}
          </div>
        )}
      </div>
    </div>
  );
});
