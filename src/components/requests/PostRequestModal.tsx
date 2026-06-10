import { useState } from 'react';
import { X, Send, Calendar, MapPin, DollarSign, Tag } from 'lucide-react';

export interface EquipmentRequest {
  id: string;
  title: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  budget: string;
  description: string;
  postedAt: string;
  contactName: string;
}

interface PostRequestModalProps {
  onSubmit: (request: Omit<EquipmentRequest, 'id' | 'postedAt'>) => void;
  onClose: () => void;
}

const CATEGORIES = [
  'Construction', 'Photography', 'Power Tools', 'Audio & Video',
  'Landscaping', 'Events', 'Vehicles', 'Medical', 'Industrial', 'Other',
];

export default function PostRequestModal({ onSubmit, onClose }: PostRequestModalProps) {
  const [form, setForm] = useState({
    title: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
    contactName: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.category) e.category = 'Required';
    if (!form.location.trim()) e.location = 'Required';
    if (!form.startDate) e.startDate = 'Required';
    if (!form.endDate) e.endDate = 'Required';
    if (!form.contactName.trim()) e.contactName = 'Required';
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = 'Must be after start date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  const field = (label: string, name: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={ev => setForm(f => ({ ...f, [name]: ev.target.value }))}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
          errors[name] ? 'border-red-400' : 'border-gray-300'
        }`}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Post Equipment Request</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-teal-50 rounded-lg p-3">
            <Tag className="w-4 h-4 text-teal-500 shrink-0" />
            Tell owners what equipment you need and they'll reach out to you.
          </div>

          {field('What equipment do you need?', 'title', 'text', 'e.g. CAT 320 Excavator for 5 days')}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.category ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              <option value="">Select category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            {field('Location', 'location', 'text', 'City, State')}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.startDate ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> End Date
              </label>
              <input
                type="date"
                value={form.endDate}
                min={form.startDate || new Date().toISOString().split('T')[0]}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.endDate ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
            {field('Budget (optional)', 'budget', 'text', 'e.g. $200/day or $800 total')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details (optional)</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Any specific requirements, delivery needs, certifications required…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {field('Your Name', 'contactName', 'text', 'How owners should address you')}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              Post Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
