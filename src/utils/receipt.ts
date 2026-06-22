import type { Booking } from '../types';

function fmtDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('default', { year: 'numeric', month: 'short', day: 'numeric' });
}

function money(n: number): string {
  return `$${(n ?? 0).toFixed(2)}`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Opens a print-friendly receipt for a booking in a new window and triggers
 * the browser's print dialog (which doubles as "Save as PDF"). Self-contained
 * HTML so it does not depend on the app's stylesheet.
 */
export function printBookingReceipt(booking: Booking): void {
  const title = booking.equipment?.title || 'Equipment Rental';
  const owner = booking.owner?.full_name || 'Owner';
  const renter = booking.renter?.full_name || 'Renter';
  const shortId = booking.id.slice(0, 8).toUpperCase();
  const paid = booking.payment_status === 'paid';

  const row = (label: string, value: string, strong = false) => `
    <div class="row${strong ? ' strong' : ''}">
      <span>${escapeHtml(label)}</span>
      <span>${escapeHtml(value)}</span>
    </div>`;

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Receipt ${escapeHtml(shortId)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif; color: #111827; margin: 0; padding: 40px; background: #f9fafb; }
  .sheet { max-width: 640px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; box-shadow: 0 2px 20px rgba(0,0,0,.06); }
  .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
  .brand .mark { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg,#2dd4bf,#10b981,#0891b2); }
  .brand .name { font-size: 20px; font-weight: 700; letter-spacing: -.02em; }
  .brand .name span { color: #0891b2; }
  .muted { color: #6b7280; font-size: 13px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .paid { background: #d1fae5; color: #047857; }
  .unpaid { background: #fef3c7; color: #b45309; }
  h1 { font-size: 15px; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin: 28px 0 12px; }
  .item { font-size: 18px; font-weight: 600; margin-bottom: 2px; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
  .row.strong { font-weight: 700; font-size: 16px; border-bottom: none; border-top: 2px solid #111827; margin-top: 6px; padding-top: 14px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; }
  .foot { margin-top: 32px; font-size: 12px; color: #9ca3af; text-align: center; }
  @media print { body { background: #fff; padding: 0; } .sheet { box-shadow: none; } .noprint { display: none; } }
  .btn { display:inline-block; margin: 24px auto 0; padding: 10px 20px; background:#10b981; color:#fff; border:none; border-radius:10px; font-weight:600; cursor:pointer; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="head">
      <div>
        <div class="brand"><div class="mark"></div><div class="name">Isla<span>kayd</span></div></div>
        <div class="muted">Rental Receipt</div>
      </div>
      <div style="text-align:right">
        <div class="badge ${paid ? 'paid' : 'unpaid'}">${paid ? 'PAID' : booking.payment_status.toUpperCase()}</div>
        <div class="muted" style="margin-top:8px">Receipt #${escapeHtml(shortId)}</div>
        <div class="muted">${fmtDate(booking.created_at)}</div>
      </div>
    </div>

    <h1>Rental</h1>
    <div class="item">${escapeHtml(title)}</div>
    <div class="grid2 muted" style="margin-top:10px">
      <div>Owner: ${escapeHtml(owner)}</div>
      <div>Renter: ${escapeHtml(renter)}</div>
      <div>From: ${fmtDate(booking.start_date)}</div>
      <div>To: ${fmtDate(booking.end_date)}</div>
      <div>Duration: ${booking.total_days} day${booking.total_days === 1 ? '' : 's'}</div>
      <div>Status: ${escapeHtml(booking.status)}</div>
    </div>

    <h1>Charges</h1>
    ${row(`Daily rate × ${booking.total_days}`, money(booking.subtotal))}
    ${row('Service fee', money(booking.service_fee))}
    ${row('Refundable deposit', money(booking.deposit_amount))}
    ${row('Total', money(booking.total_amount), true)}

    <div class="foot">Thank you for renting with Islakayd. The deposit is refundable on safe return of the equipment.</div>
    <div class="noprint" style="text-align:center"><button class="btn" onclick="window.print()">Print / Save as PDF</button></div>
  </div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 350); };</script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=720,height=900');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
