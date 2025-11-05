import { useCalendarStore } from "../../store/useCalendarStore";
import { useHolidayStore } from "../../store/useHolidayStore";

const formatEventTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

function MonthView({ onEventClick }) {
  const { currentDate, events, showHolidays } = useCalendarStore();
  const { getHolidaysForDate } = useHolidayStore();

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
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

  const getEventsForDay = (date) =>
    events
      .filter(
        (event) =>
          new Date(event.start_time).toDateString() === date.toDateString()
      )
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );

  const getHolidaysForDay = (date) =>
    showHolidays ? getHolidaysForDate(date) : [];

  const isToday = (date) => date.toDateString() === new Date().toDateString();

  const days = getDaysInMonth();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="h-full flex flex-col transition-colors duration-300 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-black">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#0d0d0d] text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 border-t border-l border-gray-200 dark:border-gray-800">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day.date);
          const dayHolidays = getHolidaysForDay(day.date);
          const totalItems = dayEvents.length + dayHolidays.length;
          const maxDisplayItems = 3;
          const today = isToday(day.date);

          return (
            <div
              key={index}
              className="relative flex flex-col p-1.5 border-r border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black transition-colors"
            >
              {/* Date number */}
              <div className="flex justify-end mb-1">
                <span
                  className={`w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full ${
                    today
                      ? "bg-blue-600 text-white"
                      : day.isCurrentMonth
                      ? "text-gray-700 dark:text-gray-300"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {day.date.getDate()}
                </span>
              </div>

              {/* Events and Holidays */}
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayHolidays.slice(0, maxDisplayItems).map((holiday) => (
                  <div
                    key={holiday.id}
                    title={holiday.description || holiday.name}
                    className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-700 text-green-800 dark:text-white truncate"
                  >
                    {holiday.name}
                  </div>
                ))}

                {dayEvents
                  .slice(0, maxDisplayItems - dayHolidays.length)
                  .map((event) => {
                    const color =
                      event.color || event.calendar_color || "#1a73e8";
                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        title={event.title}
                        className="px-1 py-0.5 flex items-center gap-1.5 text-xs rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="truncate text-gray-700 dark:text-gray-200">
                          {event.is_all_day ? (
                            event.title
                          ) : (
                            <>
                              <span className="font-medium">
                                {formatEventTime(event.start_time)}
                              </span>{" "}
                              {event.title}
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}

                {totalItems > maxDisplayItems && (
                  <div className="text-xs px-1.5 py-0.5 text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 rounded transition">
                    +{totalItems - maxDisplayItems} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthView;
