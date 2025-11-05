import { formatDateTime, formatTime, getTimezoneAbbreviation } from '../utils/timezoneUtils';
import { useAuthStore } from '../store/useAuthStore';
import { useState, useEffect } from 'react';
import { availabilityAPI } from '../api/availability';

/**
 * TimeDisplay component - automatically displays times in user's timezone
 * @param {Date|string} time - The time to display
 * @param {string} format - 'datetime', 'time', 'date'
 * @param {boolean} showTimezone - Whether to show timezone abbreviation
 * @param {string} className - Additional CSS classes
 */
function TimeDisplay({ time, format = 'datetime', showTimezone = false, className = '' }) {
  const [userTimezone, setUserTimezone] = useState('UTC');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserTimezone();
  }, []);

  const loadUserTimezone = async () => {
    try {
      const data = await availabilityAPI.getUserTimezone();
      setUserTimezone(data.timezone || 'UTC');
    } catch (error) {
      // Fallback to browser timezone
      setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !time) {
    return <span className={className}>--</span>;
  }

  const dateObj = typeof time === 'string' ? new Date(time) : time;

  let formattedTime = '';

  switch (format) {
    case 'time':
      formattedTime = formatTime(dateObj, userTimezone);
      break;
    case 'date':
      formattedTime = dateObj.toLocaleDateString('en-US', {
        timeZone: userTimezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      break;
    case 'datetime':
    default:
      formattedTime = formatDateTime(dateObj, userTimezone);
      break;
  }

  if (showTimezone) {
    const tzAbbr = getTimezoneAbbreviation(userTimezone, dateObj);
    formattedTime += ` ${tzAbbr}`;
  }

  return <span className={className} title={dateObj.toISOString()}>{formattedTime}</span>;
}

export default TimeDisplay;
