import { useState, useRef } from 'react';
import { Camera, Image, X, Send, Paperclip, Smile } from 'lucide-react';

interface PhotoMessagingProps {
  conversationId: string;
  onSendMessage: (content: string, photos?: string[]) => Promise<void>;
  onClose?: () => void;
}

export default function PhotoMessaging({ conversationId, onSendMessage, onClose }: PhotoMessagingProps) {
  const [message, setMessage] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  // Debug: Track conversation for logging
  if (import.meta.env.DEV) {
    console.log('PhotoMessaging: Conversation ID:', conversationId);
  }
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedPhotos.length > 5) {
      alert('Maximum 5 photos per message');
      return;
    }

    const newPhotos = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum 5MB per photo.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file.`);
        return false;
      }
      return true;
    });

    setSelectedPhotos(prev => [...prev, ...newPhotos]);
    
    // Create preview URLs
    newPhotos.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!message.trim() && selectedPhotos.length === 0) return;

    setIsSending(true);
    try {
      // In production, upload photos to storage first
      const photoUrls = previewUrls; // Replace with actual uploaded URLs
      await onSendMessage(message, photoUrls.length > 0 ? photoUrls : undefined);
      
      setMessage('');
      setSelectedPhotos([]);
      setPreviewUrls([]);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const quickMessages = [
    '👍 Looks good!',
    '📸 Can you send more photos?',
    '✅ Equipment received',
    '🔧 Minor issue - please check',
    '⭐ Everything perfect!',
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-emerald-50">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-gray-900">Send Message with Photos</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Photo Previews */}
      {previewUrls.length > 0 && (
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Image className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {previewUrls.length} photo{previewUrls.length > 1 ? 's' : ''} attached
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {previewUrls.map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={() => removePhoto(idx)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">Remove</span>
                </div>
              </div>
            ))}
            
            {previewUrls.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50 transition-all flex items-center justify-center"
              >
                <div className="text-center">
                  <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-500">Add More</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Messages */}
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-500 mb-2">QUICK MESSAGES</p>
        <div className="flex flex-wrap gap-2">
          {quickMessages.map((msg, idx) => (
            <button
              key={idx}
              onClick={() => setMessage(msg)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-teal-400 hover:bg-teal-50 transition-colors"
            >
              {msg}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here... You can also add photos!"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all resize-none"
          rows={4}
        />
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Upload photos"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Take photo"
            >
              <Camera className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => setShowCamera(!showCamera)}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Add emoji"
            >
              <Smile className="w-5 h-5 text-gray-600" />
            </button>

            <span className="text-xs text-gray-500 ml-2">
              {selectedPhotos.length}/5 photos
            </span>
          </div>

          <button
            onClick={handleSend}
            disabled={(!message.trim() && selectedPhotos.length === 0) || isSending}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>
        </div>

        {/* Helper Text */}
        <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
          <Camera className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">📸 Pro Tip: Document Everything</p>
            <p>Take photos before and after rental to protect yourself and ensure smooth returns. Maximum 5 photos per message, 5MB each.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
