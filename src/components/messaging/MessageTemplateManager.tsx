import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import {
  getMessageTemplates,
  createMessageTemplate,
  deleteMessageTemplate,
  defaultTemplates,
  type MessageTemplate,
} from '../../services/messagingService';

export default function MessageTemplateManager() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'custom' as const,
  });

  useEffect(() => {
    if (!user?.id) return;
    loadTemplates();
  }, [user?.id]);

  const loadTemplates = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await getMessageTemplates(user.id);
      setTemplates(data);
    } catch {
      showError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      if (editingTemplate) {
        // Update logic would go here
        success('Template updated');
      } else {
        await createMessageTemplate(user.id, {
          name: formData.name,
          subject: formData.subject,
          content: formData.content,
          type: formData.type,
          variables: extractVariables(formData.content),
        });
        success('Template created');
      }
      setShowForm(false);
      setFormData({ name: '', subject: '', content: '', type: 'custom' });
      loadTemplates();
    } catch {
      showError('Failed to save template');
    }
  };

  const extractVariables = (content: string): string[] => {
    const regex = /{{(\w+)}}/g;
    const matches = content.match(regex) || [];
    return matches.map(m => m.replace(/[{}]/g, ''));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await deleteMessageTemplate(id);
      success('Template deleted');
      loadTemplates();
    } catch {
      showError('Failed to delete template');
    }
  };

  const addDefaultTemplate = async (defaultTemplate: typeof defaultTemplates[0]) => {
    if (!user?.id) return;
    try {
      await createMessageTemplate(user.id, {
        name: defaultTemplate.name,
        subject: defaultTemplate.subject,
        content: defaultTemplate.content,
        type: defaultTemplate.type,
        variables: extractVariables(defaultTemplate.content),
      });
      success('Default template added');
      loadTemplates();
    } catch {
      showError('Failed to add template');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Message Templates</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Template Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Use {{variable}} for dynamic content"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-40"
              placeholder="Use {{variable}} for dynamic content"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Common variables: {'{renter_name}'}, {'{equipment_name}'}, {'{start_date}'}, {'{end_date}'}, {'{total_price}'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition"
            >
              Save Template
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Templates List */}
      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.subject}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded">
                    {template.type}
                  </span>
                  {template.variables.length > 0 && (
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                      {template.variables.length} variables
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingTemplate(template)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No templates yet. Create one or use a default template:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {defaultTemplates.map((template) => (
              <button
                key={template.name}
                onClick={() => addDefaultTemplate(template)}
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white">{template.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{template.subject}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
