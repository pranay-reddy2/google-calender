import { useDrop } from "react-dnd";
import { useCalendarStore } from "../../store/useCalendarStore";
import { useHolidayStore } from "../../store/useHolidayStore";
import { DraggableEvent, ItemTypes } from "../DraggableEvent";

function DayView({ onEventClick }) {
  const { currentDate, events, updateEvent, showHolidays } = useCalendarStore();
  const { getHolidaysForDate } = useHolidayStore();

  const dayEvents = events.filter((event) => {
    const eventDate = new Date(event.start_time);
    return eventDate.toDateString() === currentDate.toDateString();
  });

  const dayHolidays = showHolidays ? getHolidaysForDate(currentDate) : [];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const handleEventDrop = async (event, hour) => {
    const newStartTime = new Date(currentDate);
    newStartTime.setHours(hour, 0, 0, 0);

    const oldStartTime = new Date(event.start_time);
    const oldEndTime = new Date(event.end_time);
    const duration = oldEndTime - oldStartTime;

    const newEndTime = new Date(newStartTime.getTime() + duration);

    try {
      await updateEvent(event.id, {
        ...event,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
      });
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  const handleEventResize = async (event, durationChangeMinutes) => {
    const newEndTime = new Date(event.end_time);
    newEndTime.setMinutes(newEndTime.getMinutes() + durationChangeMinutes);

    try {
      await updateEvent(event.id, {
        ...event,
        endTime: newEndTime.toISOString(),
      });
    } catch (error) {
      console.error("Failed to resize event:", error);
    }
  };

  function TimeSlot({ hour }) {
    const [{ isOver }, drop] = useDrop(
      () => ({
        accept: ItemTypes.EVENT,
        drop: (item) => handleEventDrop(item.event, hour),
        collect: (monitor) => ({
          isOver: monitor.isOver(),
        }),
      }),
      [hour]
    );

    const hourEvents = dayEvents.filter(
      (event) => new Date(event.start_time).getHours() === hour
    );

    return (
      <div
        ref={drop}
        className={`relative min-h-[80px] border-b transition-colors duration-200
        dark:border-gray-800 border-gray-200
        ${
          isOver
            ? "bg-blue-900/30 dark:bg-blue-900/40"
            : "bg-white dark:bg-black"
        }`}
      >
        {hourEvents.map((event) => (
          <DraggableEvent
            key={event.id}
            event={event}
            onEventClick={onEventClick}
            onResizeEnd={handleEventResize}
            className="mx-2 mt-2 px-3 py-2 rounded text-sm text-white cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
            style={{
              backgroundColor: event.color || event.calendar_color || "#1a73e8",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col rounded-2xl overflow-hidden transition-colors duration-300 bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b py-4 px-6 sticky top-0 z-10 bg-gray-50 dark:bg-[#0d0d0d] border-gray-200 dark:border-gray-800">
        <h3 className="text-2xl font-medium mb-2 text-gray-800 dark:text-gray-200">
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
          {isToday() && (
            <span className="ml-2 text-sm text-blue-500 dark:text-blue-400 font-semibold">
              Today
            </span>
          )}
        </h3>

        {/* Holidays */}
        {dayHolidays.length > 0 && (
          <div className="flex flex-col gap-1">
            {dayHolidays.map((holiday) => (
              <div
                key={holiday.id}
                className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 truncate w-fit"
              >
                🎉 {holiday.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hourly grid */}
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        <div className="grid grid-cols-[80px_1fr]">
          {hours.map((hour) => (
            <div key={hour} className="contents">
              {/* Time Label */}
              <div className="text-xs text-right pr-4 pt-2 border-r text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black">
                {hour === 0
                  ? "12 AM"
                  : hour < 12
                  ? `${hour} AM`
                  : hour === 12
                  ? "12 PM"
                  : `${hour - 12} PM`}
              </div>
              {/* Time Slot */}
              <TimeSlot hour={hour} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DayView;
