import { useState } from 'react';
import { Download, FileText, Printer, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import {
  getBookingsReport,
  generateCSV,
  generateHTML,
  downloadCSV,
  downloadHTML,
  openPrintPreview,
} from '../../services/reportService';

export default function ExportReportsPanel() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handleExportCSV = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const report = await getBookingsReport(user.id, startDate, endDate);
      const csv = generateCSV(report);
      const filename = `bookings-report-${startDate}-to-${endDate}.csv`;
      downloadCSV(filename, csv);
      showToast('Report exported as CSV', 'success');
    } catch {
      showToast('Failed to export CSV', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportHTML = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const report = await getBookingsReport(user.id, startDate, endDate);
      const html = generateHTML(report);
      const filename = `bookings-report-${startDate}-to-${endDate}.html`;
      downloadHTML(filename, html);
      showToast('Report exported as HTML', 'success');
    } catch {
      showToast('Failed to export HTML', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const report = await getBookingsReport(user.id, startDate, endDate);
      const html = generateHTML(report);
      openPrintPreview(html);
      showToast('Print preview opened', 'success');
    } catch {
      showToast('Failed to open print preview', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Export Reports</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Generate and export rental reports for analysis and record-keeping
        </p>
      </div>

      {/* Date Range Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Report Period</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            Reports include all bookings, revenue calculations, and customer ratings for the selected period.
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CSV Export */}
        <button
          onClick={handleExportCSV}
          disabled={loading}
          className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all disabled:opacity-50 text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Export CSV</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Download as spreadsheet (Excel compatible)
          </p>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            <Download className="w-4 h-4" />
            Export CSV
          </div>
        </button>

        {/* HTML Export */}
        <button
          onClick={handleExportHTML}
          disabled={loading}
          className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all disabled:opacity-50 text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Export HTML</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Download as webpage (viewable in browser)
          </p>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
            <Download className="w-4 h-4" />
            Export HTML
          </div>
        </button>

        {/* Print Preview */}
        <button
          onClick={handlePrint}
          disabled={loading}
          className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all disabled:opacity-50 text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <Printer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Print / PDF</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Open in print dialog (save as PDF)
          </p>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-medium">
            <Printer className="w-4 h-4" />
            Print Preview
          </div>
        </button>
      </div>

      {/* Quick Presets */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Presets:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Last 7 Days', days: 7 },
            { label: 'Last 30 Days', days: 30 },
            { label: 'Last 90 Days', days: 90 },
            { label: 'Year to Date', days: 365 },
          ].map((preset) => (
            <button
              key={preset.days}
              onClick={() => {
                const end = new Date();
                const start = new Date(end);
                start.setDate(start.getDate() - preset.days);
                setStartDate(start.toISOString().split('T')[0]);
                setEndDate(end.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
