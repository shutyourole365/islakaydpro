import { useState, useEffect } from 'react';
import { Share2, Copy, Mail, Trash2, Loader2, Check, X, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import {
  shareWishlistWithUser,
  createShareLink,
  getSharedWishlists,
  removeWishlistShare,
  disableShareLink,
  type SharedWishlist,
  type WishlistShareLink,
} from '../../services/wishlistService';

interface WishlistSharingPanelProps {
  wishlistId?: string;
  wishlistName?: string;
}

type PermissionLevel = 'view' | 'add_suggestions' | 'edit';

const permissionDescriptions: Record<PermissionLevel, string> = {
  view: 'Can only view the wishlist',
  add_suggestions: 'Can view and suggest items to add',
  edit: 'Can view and modify the wishlist',
};

export default function WishlistSharingPanel({ wishlistId, wishlistName = 'Wishlist' }: WishlistSharingPanelProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [sharedWith, setSharedWith] = useState<SharedWishlist[]>([]);
  const [shareLinks, setShareLinks] = useState<WishlistShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailPermission, setEmailPermission] = useState<PermissionLevel>('view');
  const [linkPermission, setLinkPermission] = useState<PermissionLevel>('view');
  const [expiryDays, setExpiryDays] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (wishlistId) {
      loadShares();
    }
  }, [wishlistId]);

  const loadShares = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [shares] = await Promise.all([
        getSharedWishlists(user.id),
      ]);
      setSharedWith(shares.filter(s => s.wishlist_id === wishlistId));
    } catch (error) {
      console.error('Failed to load shares:', error);
      showToast('Failed to load shared wishlists', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleShareByEmail = async () => {
    if (!wishlistId || !emailInput.trim()) return;

    try {
      setSubmitting(true);
      await shareWishlistWithUser(wishlistId, emailInput, emailPermission);
      showToast(`Wishlist shared with ${emailInput}`, 'success');
      setEmailInput('');
      setEmailPermission('view');
      setShowEmailForm(false);
      loadShares();
    } catch (error) {
      console.error('Failed to share wishlist:', error);
      showToast('Failed to share wishlist', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateShareLink = async () => {
    if (!wishlistId) return;

    try {
      setSubmitting(true);
      const expiresIn = expiryDays ? expiryDays * 24 * 60 * 60 * 1000 : undefined;
      const link = await createShareLink(wishlistId, linkPermission, expiresIn);
      setShareLinks([link, ...shareLinks]);
      showToast('Share link created', 'success');
      setShowLinkForm(false);
      setLinkPermission('view');
      setExpiryDays(null);
    } catch (error) {
      console.error('Failed to create share link:', error);
      showToast('Failed to create share link', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      await removeWishlistShare(shareId);
      setSharedWith(prev => prev.filter(s => s.id !== shareId));
      showToast('Removed from shared list', 'success');
    } catch (error) {
      console.error('Failed to remove share:', error);
      showToast('Failed to remove share', 'error');
    }
  };

  const handleDisableLink = async (linkId: string) => {
    try {
      await disableShareLink(linkId);
      setShareLinks(prev => prev.map(l => l.id === linkId ? { ...l, is_active: false } : l));
      showToast('Share link disabled', 'success');
    } catch (error) {
      console.error('Failed to disable link:', error);
      showToast('Failed to disable link', 'error');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard', 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Share "{wishlistName}"</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Invite people to view or collaborate on this wishlist
        </p>
      </div>

      {/* Sharing Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Invite */}
        <button
          onClick={() => setShowEmailForm(!showEmailForm)}
          className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all text-left"
        >
          <Mail className="w-6 h-6 text-teal-600 dark:text-teal-400 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Invite by Email</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Send an invitation to specific people</p>
        </button>

        {/* Share Link */}
        <button
          onClick={() => setShowLinkForm(!showLinkForm)}
          className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all text-left"
        >
          <Share2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Create Share Link</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Generate a link anyone can use to access</p>
        </button>
      </div>

      {/* Email Form */}
      {showEmailForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permission Level
            </label>
            <div className="space-y-2">
              {(['view', 'add_suggestions', 'edit'] as const).map((level) => (
                <label key={level} className="flex items-center gap-3 p-2 border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="email-permission"
                    value={level}
                    checked={emailPermission === level}
                    onChange={() => setEmailPermission(level)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{level.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{permissionDescriptions[level]}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShareByEmail}
              disabled={submitting || !emailInput.trim()}
              className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Send Invite
            </button>
            <button
              onClick={() => setShowEmailForm(false)}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Share Link Form */}
      {showLinkForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permission Level
              </label>
              <select
                value={linkPermission}
                onChange={(e) => setLinkPermission(e.target.value as PermissionLevel)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {(['view', 'add_suggestions', 'edit'] as const).map((level) => (
                  <option key={level} value={level}>
                    {level.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry (days)
              </label>
              <select
                value={expiryDays === null ? '' : expiryDays}
                onChange={(e) => setExpiryDays(e.target.value === '' ? null : parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">No expiry</option>
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateShareLink}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Link
            </button>
            <button
              onClick={() => setShowLinkForm(false)}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Shared With List */}
      {sharedWith.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Shared With</h3>
          <div className="space-y-3">
            {sharedWith.map((share) => (
              <div key={share.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{share.shared_with_email}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {share.permission_level.replace(/_/g, ' ')}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveShare(share.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Links List */}
      {shareLinks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Share Links</h3>
          <div className="space-y-3">
            {shareLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {link.permission_level.replace(/_/g, ' ')}
                    </p>
                    {!link.is_active && (
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {link.expires_at ? `Expires: ${new Date(link.expires_at).toLocaleDateString()}` : 'No expiry'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {link.is_active && (
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}/wishlist/${link.wishlist_id}?code=${link.share_code}`)}
                      className="p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDisableLink(link.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
