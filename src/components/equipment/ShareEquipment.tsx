import { useState } from 'react';
import {
  Share2,
  Copy,
  Mail,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  X,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface ShareEquipmentProps {
  equipmentId: string;
  equipmentTitle: string;
  equipmentImage?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareEquipment({
  equipmentId,
  equipmentTitle,
  equipmentImage,
  isOpen,
  onClose
}: ShareEquipmentProps) {  const { success } = useToast();  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/equipment/${equipmentId}`;
  const shareText = `Check out this equipment for rent: ${equipmentTitle}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: Copy,
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          success('Link copied to clipboard!');
          setTimeout(() => setCopied(false), 2000);
        } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
          success('Link copied to clipboard!');
          setTimeout(() => setCopied(false), 2000);
        }
      },
      color: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => {
        const subject = encodeURIComponent(`Equipment Rental: ${equipmentTitle}`);
        const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
      },
      color: 'bg-red-100 hover:bg-red-200 text-red-700',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
      },
      color: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
      },
      color: 'bg-sky-100 hover:bg-sky-200 text-sky-700',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => {
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank');
      },
      color: 'bg-green-100 hover:bg-green-200 text-green-700',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      action: () => {
        // Instagram doesn't support direct sharing, so we'll copy to clipboard
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        success('Content copied! You can now paste it in Instagram.');
      },
      color: 'bg-pink-100 hover:bg-pink-200 text-pink-700',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Share2 className="h-6 w-6 text-teal-600" />
            <h2 className="text-xl font-semibold text-gray-900">Share Equipment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Equipment Preview */}
          <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
            {equipmentImage && (
              <img
                src={equipmentImage}
                alt={equipmentTitle}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 text-sm">{equipmentTitle}</h3>
              <p className="text-xs text-gray-500">Available for rent on Islakayd</p>
            </div>
          </div>

          {/* Share URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Link
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              />
              <Button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    success('Link copied!');
                    setTimeout(() => setCopied(false), 2000);
                  } catch (copyError) {
                    console.error('Failed to copy link:', copyError);
                  }
                }}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Share via
            </label>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${option.color}`}
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Actions */}
          <div className="mt-6 pt-4 border-t">
            <button
              onClick={() => window.open(shareUrl, '_blank')}
              className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in new tab</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}