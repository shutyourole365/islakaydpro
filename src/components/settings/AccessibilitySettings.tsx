import { useState, useEffect, useCallback } from 'react';
import {
  Accessibility,
  Eye,
  Type,
  Volume2,
  MousePointer,
  Contrast,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Moon,
  Sun,
  Monitor,
  Check,
  ChevronRight,
  Keyboard,
  Hand,
  Focus,
  Pause,
  Play,
  VolumeX,
} from 'lucide-react';

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  contrast: 'normal' | 'high' | 'inverted';
  reduceMotion: boolean;
  reduceTransparency: boolean;
  colorBlindMode: 'off' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusHighlight: boolean;
  autoplayMedia: boolean;
  textSpacing: 'normal' | 'increased' | 'maximum';
  cursorSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'system';
}

interface AccessibilitySettingsProps {
  settings?: Partial<AccessibilitySettings>;
  onSettingsChange: (settings: AccessibilitySettings) => void;
  className?: string;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'medium',
  contrast: 'normal',
  reduceMotion: false,
  reduceTransparency: false,
  colorBlindMode: 'off',
  screenReader: false,
  keyboardNavigation: true,
  focusHighlight: true,
  autoplayMedia: true,
  textSpacing: 'normal',
  cursorSize: 'medium',
  theme: 'system',
};

const fontSizeOptions = [
  { value: 'small', label: 'Small', scale: '14px' },
  { value: 'medium', label: 'Medium', scale: '16px' },
  { value: 'large', label: 'Large', scale: '18px' },
  { value: 'x-large', label: 'Extra Large', scale: '20px' },
];

const contrastOptions = [
  { value: 'normal', label: 'Normal', description: 'Default contrast' },
  { value: 'high', label: 'High Contrast', description: 'Better visibility' },
  { value: 'inverted', label: 'Inverted', description: 'Dark on light' },
];

const colorBlindOptions = [
  { value: 'off', label: 'Off' },
  { value: 'protanopia', label: 'Protanopia (Red-blind)' },
  { value: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
  { value: 'tritanopia', label: 'Tritanopia (Blue-blind)' },
];

const textSpacingOptions = [
  { value: 'normal', label: 'Normal', description: '1.5x line height' },
  { value: 'increased', label: 'Increased', description: '1.8x line height' },
  { value: 'maximum', label: 'Maximum', description: '2.2x line height' },
];

export default function AccessibilitySettingsComponent({
  settings: initialSettings,
  onSettingsChange,
  className = '',
}: AccessibilitySettingsProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    ...defaultSettings,
    ...initialSettings,
  });
  const [activeSection, setActiveSection] = useState<string>('vision');
  const [previewText, setPreviewText] = useState(
    'The quick brown fox jumps over the lazy dog. Equipment rental made easy.'
  );

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    const fontSizeMap = { small: '14px', medium: '16px', large: '18px', 'x-large': '20px' };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);
    document.body.style.fontSize = fontSizeMap[settings.fontSize];

    // Text spacing
    const lineHeightMap = { normal: '1.5', increased: '1.8', maximum: '2.2' };
    root.style.setProperty('--line-height', lineHeightMap[settings.textSpacing]);

    // High contrast
    if (settings.contrast === 'high') {
      root.classList.add('high-contrast');
      root.classList.remove('inverted-colors');
    } else if (settings.contrast === 'inverted') {
      root.classList.add('inverted-colors');
      root.classList.remove('high-contrast');
    } else {
      root.classList.remove('high-contrast', 'inverted-colors');
    }

    // Reduce motion
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Reduce transparency
    if (settings.reduceTransparency) {
      root.classList.add('reduce-transparency');
    } else {
      root.classList.remove('reduce-transparency');
    }

    // Color blind mode
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (settings.colorBlindMode !== 'off') {
      root.classList.add(settings.colorBlindMode);
    }

    // Focus highlight
    if (settings.focusHighlight) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Theme
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Notify parent
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const sections = [
    { id: 'vision', label: 'Vision', icon: Eye },
    { id: 'hearing', label: 'Audio', icon: Volume2 },
    { id: 'motor', label: 'Motor', icon: Hand },
    { id: 'display', label: 'Display', icon: Monitor },
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Accessibility className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Accessibility Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customize your experience
              </p>
            </div>
          </div>
          <button
            onClick={resetSettings}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-48 border-r dark:border-gray-700 p-4">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 max-h-[500px] overflow-y-auto">
          {/* Vision Settings */}
          {activeSection === 'vision' && (
            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Font Size</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {fontSizeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateSetting('fontSize', option.value as AccessibilitySettings['fontSize'])}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        settings.fontSize === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span
                        className="block font-medium text-gray-900 dark:text-white"
                        style={{ fontSize: option.scale }}
                      >
                        Aa
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contrast */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Contrast className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Contrast</h3>
                </div>
                <div className="space-y-2">
                  {contrastOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateSetting('contrast', option.value as AccessibilitySettings['contrast'])}
                      className={`w-full p-3 rounded-xl border-2 flex items-center justify-between ${
                        settings.contrast === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-left">
                        <span className="block font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {option.description}
                        </span>
                      </div>
                      {settings.contrast === option.value && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Blind Mode */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Color Blind Support
                  </h3>
                </div>
                <select
                  value={settings.colorBlindMode}
                  onChange={(e) =>
                    updateSetting('colorBlindMode', e.target.value as AccessibilitySettings['colorBlindMode'])
                  }
                  className="w-full p-3 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white"
                >
                  {colorBlindOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Spacing */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Text Spacing</h3>
                </div>
                <div className="space-y-2">
                  {textSpacingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateSetting('textSpacing', option.value as AccessibilitySettings['textSpacing'])}
                      className={`w-full p-3 rounded-xl border-2 flex items-center justify-between ${
                        settings.textSpacing === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-left">
                        <span className="block font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {option.description}
                        </span>
                      </div>
                      {settings.textSpacing === option.value && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                <p
                  className="text-gray-900 dark:text-white"
                  style={{
                    fontSize: fontSizeOptions.find(f => f.value === settings.fontSize)?.scale,
                    lineHeight: settings.textSpacing === 'normal' ? 1.5 : settings.textSpacing === 'increased' ? 1.8 : 2.2,
                  }}
                >
                  {previewText}
                </p>
              </div>
            </div>
          )}

          {/* Audio Settings */}
          {activeSection === 'hearing' && (
            <div className="space-y-6">
              {/* Autoplay Media */}
              <ToggleSetting
                icon={<Play className="w-5 h-5" />}
                title="Autoplay Media"
                description="Automatically play videos and audio"
                enabled={settings.autoplayMedia}
                onChange={(v) => updateSetting('autoplayMedia', v)}
              />

              {/* Screen Reader */}
              <ToggleSetting
                icon={<Volume2 className="w-5 h-5" />}
                title="Screen Reader Support"
                description="Optimize for screen readers (VoiceOver, NVDA, JAWS)"
                enabled={settings.screenReader}
                onChange={(v) => updateSetting('screenReader', v)}
              />

              {/* Visual Alerts */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Volume2 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Audio Notifications
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      When screen reader is enabled, important notifications will also be announced audibly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Motor Settings */}
          {activeSection === 'motor' && (
            <div className="space-y-6">
              {/* Keyboard Navigation */}
              <ToggleSetting
                icon={<Keyboard className="w-5 h-5" />}
                title="Keyboard Navigation"
                description="Navigate using Tab, Enter, and arrow keys"
                enabled={settings.keyboardNavigation}
                onChange={(v) => updateSetting('keyboardNavigation', v)}
              />

              {/* Focus Highlight */}
              <ToggleSetting
                icon={<Focus className="w-5 h-5" />}
                title="Focus Highlight"
                description="Show visible outline on focused elements"
                enabled={settings.focusHighlight}
                onChange={(v) => updateSetting('focusHighlight', v)}
              />

              {/* Reduce Motion */}
              <ToggleSetting
                icon={<Pause className="w-5 h-5" />}
                title="Reduce Motion"
                description="Minimize animations and transitions"
                enabled={settings.reduceMotion}
                onChange={(v) => updateSetting('reduceMotion', v)}
              />

              {/* Cursor Size */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MousePointer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Cursor Size</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSetting('cursorSize', size as AccessibilitySettings['cursorSize'])}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        settings.cursorSize === size
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <MousePointer
                        className={`mx-auto text-gray-600 dark:text-gray-400 ${
                          size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-6 h-6' : 'w-8 h-8'
                        }`}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block capitalize">
                        {size}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Keyboard Shortcuts
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Search</span>
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                      Ctrl + K
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Navigate</span>
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                      Tab / Shift+Tab
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Select</span>
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                      Enter / Space
                    </kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Close Modal</span>
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                      Escape
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Display Settings */}
          {activeSection === 'display' && (
            <div className="space-y-6">
              {/* Theme */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Theme</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateSetting('theme', 'light')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      settings.theme === 'light'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Sun className="w-6 h-6 mx-auto text-amber-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 mt-2 block">
                      Light
                    </span>
                  </button>
                  <button
                    onClick={() => updateSetting('theme', 'dark')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      settings.theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Moon className="w-6 h-6 mx-auto text-indigo-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 mt-2 block">
                      Dark
                    </span>
                  </button>
                  <button
                    onClick={() => updateSetting('theme', 'system')}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      settings.theme === 'system'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Monitor className="w-6 h-6 mx-auto text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 mt-2 block">
                      System
                    </span>
                  </button>
                </div>
              </div>

              {/* Reduce Transparency */}
              <ToggleSetting
                icon={<Eye className="w-5 h-5" />}
                title="Reduce Transparency"
                description="Make backgrounds more opaque"
                enabled={settings.reduceTransparency}
                onChange={(v) => updateSetting('reduceTransparency', v)}
              />
            </div>
          )}
        </div>
      </div>

      {/* CSS Styles for accessibility features */}
      <style>{`
        .high-contrast {
          --text-primary: #000000;
          --text-secondary: #1a1a1a;
          --bg-primary: #ffffff;
          --border-color: #000000;
        }
        
        .high-contrast.dark {
          --text-primary: #ffffff;
          --text-secondary: #e5e5e5;
          --bg-primary: #000000;
          --border-color: #ffffff;
        }
        
        .inverted-colors {
          filter: invert(1) hue-rotate(180deg);
        }
        
        .inverted-colors img,
        .inverted-colors video {
          filter: invert(1) hue-rotate(180deg);
        }
        
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .reduce-transparency {
          --bg-opacity: 1;
        }
        
        .reduce-transparency .backdrop-blur {
          backdrop-filter: none;
          background-color: rgba(255, 255, 255, 0.98);
        }
        
        .reduce-transparency.dark .backdrop-blur {
          background-color: rgba(31, 41, 55, 0.98);
        }
        
        .focus-visible *:focus-visible {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }
        
        .protanopia {
          filter: url('#protanopia-filter');
        }
        
        .deuteranopia {
          filter: url('#deuteranopia-filter');
        }
        
        .tritanopia {
          filter: url('#tritanopia-filter');
        }
      `}</style>

      {/* SVG Filters for color blindness */}
      <svg className="hidden">
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

// Toggle Setting Component
function ToggleSetting({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
      <div className="flex items-start gap-3">
        <span className="text-gray-600 dark:text-gray-400 mt-0.5">{icon}</span>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
          enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
