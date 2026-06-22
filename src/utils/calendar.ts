import type { Booking } from '../types';

/** Format a yyyy-mm-dd (or ISO) date as an all-day iCal date value: YYYYMMDD. */
function toICalDate(dateString: string): string {
  const d = new Date(dateString);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/** Add one day to a YYYYMMDD string — iCal all-day DTEND is exclusive. */
function nextDay(yyyymmdd: string): string {
  const y = Number(yyyymmdd.slice(0, 4));
  const m = Number(yyyymmdd.slice(4, 6)) - 1;
  const d = Number(yyyymmdd.slice(6, 8));
  const dt = new Date(Date.UTC(y, m, d + 1));
  return `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, '0')}${String(dt.getUTCDate()).padStart(2, '0')}`;
}

function escapeICalText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/**
 * Build an RFC 5545 .ics calendar event for a booking and trigger a download.
 * The rental is modelled as an all-day event spanning the booking dates.
 */
export function downloadBookingICS(booking: Booking): void {
  const title = booking.equipment?.title || 'Equipment Rental';
  const location = booking.equipment?.location || '';
  const start = toICalDate(booking.start_date);
  const end = nextDay(toICalDate(booking.end_date)); // DTEND is exclusive for all-day events
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const descriptionParts = [
    `Rental of ${title}`,
    booking.owner?.full_name ? `Owner: ${booking.owner.full_name}` : '',
    `Status: ${booking.status}`,
    `Total: $${booking.total_amount}`,
  ].filter(Boolean);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Islakayd//Equipment Rental//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:booking-${booking.id}@islakayd`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeICalText(`Rental: ${title}`)}`,
    `DESCRIPTION:${escapeICalText(descriptionParts.join('\n'))}`,
    location ? `LOCATION:${escapeICalText(location)}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeICalText(`Reminder: ${title} rental starts tomorrow`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rental-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
