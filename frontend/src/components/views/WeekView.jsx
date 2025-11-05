import React, { useMemo } from "react";
import { useDrop } from "react-dnd";
import { useCalendarStore } from "../../store/useCalendarStore";
import { useHolidayStore } from "../../store/useHolidayStore";
import { DraggableEvent, ItemTypes } from "../DraggableEvent";
import WorkingHoursOverlay from "../WorkingHoursOverlay";

function WeekView({ onEventClick }) {
  const {
    currentDate,
    events = [],
    updateEvent,
    showHolidays,
  } = useCalendarStore();
  const { getHolidaysForDate } = useHolidayStore();

  // Generate 7 days for the current week
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hourHeight = 64;

  const timezoneLabel = useMemo(() => {
    const offsetMinutes = -new Date().getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const abs = Math.abs(offsetMinutes);
    const hh = String(Math.floor(abs / 60)).padStart(2, "0");
    const mm = String(abs % 60).padStart(2, "0");
    return `GMT${sign}${hh}:${mm}`;
  }, []);

  const { eventsByDay, allDayEventsByDay } = useMemo(() => {
    const dayMap = new Map();
    const allDayMap = new Map();
    weekDays.forEach((day) => {
      const str = day.toDateString();
      dayMap.set(str, []);
      allDayMap.set(str, []);
    });
    for (const ev of events) {
      const start = new Date(ev.start_time);
      const str = start.toDateString();
      if (ev.is_all_day) allDayMap.get(str)?.push(ev);
      else dayMap.get(str)?.push(ev);
    }
    return { eventsByDay: dayMap, allDayEventsByDay: allDayMap };
  }, [events, weekDays]);

  const getTimedEventsForDay = (day) =>
    eventsByDay.get(day.toDateString()) || [];
  const getAllDayEventsForDay = (day) =>
    allDayEventsByDay.get(day.toDateString()) || [];
  const getHolidayNames = (d) =>
    showHolidays ? getHolidaysForDate(d) || [] : [];

  const handleEventDrop = async (event, date, hour) => {
    const newStart = new Date(date);
    newStart.setHours(hour, 0, 0, 0);
    const oldStart = new Date(event.start_time);
    const duration = new Date(event.end_time).getTime() - oldStart.getTime();
    const newEnd = new Date(newStart.getTime() + duration);
    await updateEvent(event.id, {
      ...event,
      start_time: newStart.toISOString(),
      end_time: newEnd.toISOString(),
    });
  };

  const handleEventResize = async (event, durationChangeMinutes) => {
    const newEnd = new Date(event.end_time);
    newEnd.setMinutes(newEnd.getMinutes() + durationChangeMinutes);
    await updateEvent(event.id, { ...event, end_time: newEnd.toISOString() });
  };

  const calculateEventStyle = (event) => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time || event.start_time);
    const durationMinutes = Math.max(
      (end.getTime() - start.getTime()) / 60000,
      15
    );
    const top =
      ((start.getHours() * 60 + start.getMinutes()) / 60) * hourHeight;
    const height = (durationMinutes / 60) * hourHeight;
    return {
      position: "absolute",
      top,
      height,
      backgroundColor: event.color || event.calendar_color || "#2563EB",
      left: "0.25rem",
      right: "0.25rem",
      borderRadius: "6px",
    };
  };

  function TimeSlot({ date, hour }) {
    const [{ isOver }, drop] = useDrop(
      () => ({
        accept: ItemTypes.EVENT,
        drop: (item) => handleEventDrop(item.event, date, hour),
        collect: (m) => ({ isOver: m.isOver() }),
      }),
      [date, hour]
    );
    return (
      <div
        ref={drop}
        className={`relative h-[${hourHeight}px] border-b border-gray-200 dark:border-gray-800 ${
          isOver ? "bg-blue-900/30" : ""
        }`}
      ></div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-black text-gray-900 dark:text-white">
      <div className="rounded-2xl overflow-hidden shadow-inner bg-white dark:bg-black">
        {/* Header */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 bg-gray-50 dark:bg-black">
          {/* Timezone column */}
          <div className="w-[92px] min-w-[92px] border-r border-gray-200 dark:border-gray-800 flex items-center justify-center">
            <div className="text-[12px] text-gray-500 dark:text-gray-400 font-medium">
              {timezoneLabel}
            </div>
          </div>

          {/* Day header */}
          <div className="flex-1 grid grid-cols-7 divide-x divide-gray-200 dark:divide-gray-800">
            {weekDays.map((day) => {
              const isToday = new Date().toDateString() === day.toDateString();
              const holidays = getHolidayNames(day);
              const allDayEvents = getAllDayEventsForDay(day).slice(0, 2);
              const more = getAllDayEventsForDay(day).length - 2;

              return (
                <div key={day} className="px-2 py-2 text-center">
                  <div className="text-[11px] uppercase text-gray-500 dark:text-gray-400 font-semibold">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div
                    className={`mt-2 w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  <div className="mt-2 min-h-[52px] flex flex-col gap-1 items-center">
                    {allDayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="px-2 py-1 rounded text-xs truncate w-full text-center text-white" // Event text is almost always white
                        style={{
                          backgroundColor:
                            ev.color || ev.calendar_color || "#2563EB",
                        }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {more > 0 && (
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        +{more} more
                      </div>
                    )}
                    {holidays.map((h) => (
                      <div
                        key={h.id || h.name}
                        className="text-[11px] text-green-500 dark:text-green-400 truncate w-full text-center"
                      >
                        🎉 {h.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main grid */}
        <div className="flex overflow-auto max-h-[72vh]">
          {/* Time column */}
          <div className="w-[92px] min-w-[92px] border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            {hours.map((h) => (
              <div
                key={h}
                className="h-[64px] border-b border-gray-200 dark:border-gray-800 text-right pr-3 text-xs text-gray-500 dark:text-gray-400 flex items-start justify-end"
              >
                <span className="mt-[-2px]">
                  {h === 0
                    ? ""
                    : h < 12
                    ? `${h} AM`
                    : h === 12
                    ? "12 PM"
                    : `${h - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex-1 grid grid-cols-7 relative">
            <div className="absolute inset-0 z-0">
              <WorkingHoursOverlay date={currentDate} viewType="week" />
            </div>

            {weekDays.map((day, i) => {
              const timedEvents = getTimedEventsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className="relative border-r border-gray-200 dark:border-gray-800 last:border-r-0"
                >
                  {hours.map((hour) => (
                    <TimeSlot key={`${i}-${hour}`} date={day} hour={hour} />
                  ))}
                  <div className="absolute inset-0">
                    {timedEvents.map((ev) => (
                      <DraggableEvent
                        key={ev.id}
                        event={ev}
                        onEventClick={onEventClick}
                        onResizeEnd={handleEventResize}
                        className="absolute px-2 py-1 rounded text-xs text-white truncate shadow" // Event text is white
                        style={calculateEventStyle(ev)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeekView;
