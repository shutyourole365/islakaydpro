/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';

export interface ReportData {
  bookings: any[];
  equipment: any[];
  revenue: number;
  averageRating: number;
  period: string;
}

export async function getBookingsReport(
  userId: string,
  startDate: string,
  endDate: string
): Promise<ReportData> {
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select(`
      *,
      equipment:equipment_id(id, name, category)
    `)
    .eq('owner_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  if (bookingsError) throw bookingsError;

  const { data: equipment, error: equipmentError } = await supabase
    .from('equipment')
    .select('*')
    .eq('owner_id', userId);

  if (equipmentError) throw equipmentError;

  const revenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
  const ratings = bookings?.filter(b => b.rating).map(b => b.rating) || [];
  const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b) / ratings.length : 0;

  return {
    bookings: bookings || [],
    equipment: equipment || [],
    revenue,
    averageRating,
    period: `${startDate} to ${endDate}`,
  };
}

export function generateCSV(reportData: ReportData): string {
  const headers = ['Booking ID', 'Renter', 'Equipment', 'Start Date', 'End Date', 'Total Price', 'Status', 'Rating'];
  const rows = reportData.bookings.map(b => [
    b.id,
    b.renter_name || 'N/A',
    b.equipment?.name || 'Unknown',
    new Date(b.start_date).toLocaleDateString(),
    new Date(b.end_date).toLocaleDateString(),
    `$${b.total_price?.toFixed(2) || '0.00'}`,
    b.status || 'pending',
    b.rating ? `${b.rating}/5` : 'N/A',
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csv;
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateHTML(reportData: ReportData): string {
  const bookingRows = reportData.bookings
    .map(b => `
      <tr>
        <td>${escapeHtml(b.id)}</td>
        <td>${escapeHtml(b.renter_name || 'N/A')}</td>
        <td>${escapeHtml(b.equipment?.name || 'Unknown')}</td>
        <td>${new Date(b.start_date).toLocaleDateString()}</td>
        <td>${new Date(b.end_date).toLocaleDateString()}</td>
        <td>$${b.total_price?.toFixed(2) || '0.00'}</td>
        <td>${escapeHtml(b.status || 'pending')}</td>
        <td>${b.rating ? `${b.rating}/5` : 'N/A'}</td>
      </tr>
    `)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Rental Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        h1 { color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; }
        .summary { background: #f0fdfa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .summary-row { display: flex; gap: 30px; flex-wrap: wrap; }
        .summary-item { flex: 1; min-width: 200px; }
        .summary-item strong { display: block; color: #0d9488; margin-bottom: 5px; }
        .summary-item span { font-size: 24px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #0d9488; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>Equipment Rental Report</h1>
      <p>Period: ${escapeHtml(reportData.period)}</p>

      <div class="summary">
        <h2 style="color: #0d9488; margin-top: 0;">Summary</h2>
        <div class="summary-row">
          <div class="summary-item">
            <strong>Total Rentals</strong>
            <span>${reportData.bookings.length}</span>
          </div>
          <div class="summary-item">
            <strong>Total Revenue</strong>
            <span>$${reportData.revenue.toFixed(2)}</span>
          </div>
          <div class="summary-item">
            <strong>Average Rating</strong>
            <span>${reportData.averageRating.toFixed(1)}/5</span>
          </div>
          <div class="summary-item">
            <strong>Equipment Count</strong>
            <span>${reportData.equipment.length}</span>
          </div>
        </div>
      </div>

      <h2>Booking Details</h2>
      <table>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Renter</th>
            <th>Equipment</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Total Price</th>
            <th>Status</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          ${bookingRows}
        </tbody>
      </table>

      <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>This is an automated report from IslaKayden Equipment Rental Platform</p>
      </div>
    </body>
    </html>
  `;
}

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadHTML(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function openPrintPreview(content: string): void {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    window.addEventListener('load', () => {
      URL.revokeObjectURL(url);
    }, { once: true });
  }
}
