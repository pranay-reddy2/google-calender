import { useDrag } from 'react-dnd';
import { useRef, useState, useEffect } from 'react';

const ItemTypes = {
  EVENT: 'event'
};

function DraggableEvent({ event, onEventClick, onResizeEnd, style, className }) {
  const [isResizing, setIsResizing] = useState(false);
  const [initialHeight, setInitialHeight] = useState(0);
  const [initialY, setInitialY] = useState(0);
  const eventRef = useRef(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EVENT,
    item: () => {
      if (isResizing) return null;
      return { event };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !isResizing,
  }), [event, isResizing]);

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setInitialHeight(eventRef.current.offsetHeight);
    setInitialY(e.clientY);

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - initialY;
      const newHeight = Math.max(40, initialHeight + deltaY);
      if (eventRef.current) {
        eventRef.current.style.height = `${newHeight}px`;
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (eventRef.current && onResizeEnd) {
        const newHeight = eventRef.current.offsetHeight;
        const durationChange = Math.round((newHeight - initialHeight) / 60 * 60); // Assuming 1px = 1 minute
        onResizeEnd(event, durationChange);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const combinedRef = (el) => {
    eventRef.current = el;
    drag(el);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div
      ref={combinedRef}
      className={`${className} ${isDragging ? 'opacity-50' : ''} group relative`}
      style={{ ...style, cursor: isResizing ? 'ns-resize' : 'grab' }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isResizing && onEventClick) {
          onEventClick(event);
        }
      }}
    >
      <div className="font-medium truncate">{formatTime(event.start_time)}</div>
      <div className="truncate">{event.title}</div>
      {event.location && (
        <div className="text-xs opacity-90 truncate flex items-center gap-1">
          <span className="material-icons-outlined" style={{ fontSize: '12px' }}>place</span>
          {event.location}
        </div>
      )}

      {/* Resize handle */}
      {onResizeEnd && (
        <div
          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeStart}
          style={{ background: 'rgba(255,255,255,0.3)' }}
        />
      )}
    </div>
  );
}

export { DraggableEvent, ItemTypes };
