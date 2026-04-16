import { useState } from 'react';
import { ArrowLeft, Globe, Check, Search, ChevronRight, Star, BookOpen, MessageCircle, Settings } from 'lucide-react';

interface MultiLanguageSupportProps {
  onBack: () => void;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  completion: number;
  speakers: string;
  region: string;
}

interface TranslationPreview {
  key: string;
  en: string;
  translated: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: 'US', completion: 100, speakers: '1.5B', region: 'Global' },
  { code: 'es', name: 'Spanish', nativeName: 'Espanol', flag: 'ES', completion: 98, speakers: '559M', region: 'Americas, Europe' },
  { code: 'fr', name: 'French', nativeName: 'Francais', flag: 'FR', completion: 96, speakers: '310M', region: 'Europe, Africa' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: 'DE', completion: 94, speakers: '132M', region: 'Central Europe' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Portugues', flag: 'PT', completion: 92, speakers: '258M', region: 'Americas, Europe' },
  { code: 'ja', name: 'Japanese', nativeName: 'Nihongo', flag: 'JP', completion: 90, speakers: '125M', region: 'East Asia' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: 'Zhongwen', flag: 'CN', completion: 88, speakers: '1.1B', region: 'East Asia' },
  { code: 'ko', name: 'Korean', nativeName: 'Hangugeo', flag: 'KR', completion: 85, speakers: '82M', region: 'East Asia' },
  { code: 'ar', name: 'Arabic', nativeName: 'al-Arabiyya', flag: 'SA', completion: 82, speakers: '422M', region: 'Middle East, Africa' },
  { code: 'hi', name: 'Hindi', nativeName: 'Hindi', flag: 'IN', completion: 78, speakers: '602M', region: 'South Asia' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: 'IT', completion: 91, speakers: '68M', region: 'Southern Europe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: 'NL', completion: 87, speakers: '30M', region: 'Western Europe' },
];

const translationPreviews: Record<string, TranslationPreview[]> = {
  es: [
    { key: 'hero.title', en: 'Rent Professional Equipment', translated: 'Alquila Equipo Profesional' },
    { key: 'hero.subtitle', en: 'Find and rent quality equipment near you', translated: 'Encuentra y alquila equipo de calidad cerca de ti' },
    { key: 'nav.browse', en: 'Browse Equipment', translated: 'Explorar Equipo' },
    { key: 'nav.dashboard', en: 'Dashboard', translated: 'Panel de Control' },
    { key: 'booking.book_now', en: 'Book Now', translated: 'Reservar Ahora' },
    { key: 'review.leave_review', en: 'Leave a Review', translated: 'Dejar una Resena' },
  ],
  fr: [
    { key: 'hero.title', en: 'Rent Professional Equipment', translated: 'Louez du Materiel Professionnel' },
    { key: 'hero.subtitle', en: 'Find and rent quality equipment near you', translated: 'Trouvez et louez du materiel de qualite pres de chez vous' },
    { key: 'nav.browse', en: 'Browse Equipment', translated: 'Parcourir le Materiel' },
    { key: 'nav.dashboard', en: 'Dashboard', translated: 'Tableau de Bord' },
    { key: 'booking.book_now', en: 'Book Now', translated: 'Reserver Maintenant' },
    { key: 'review.leave_review', en: 'Leave a Review', translated: 'Laisser un Avis' },
  ],
  de: [
    { key: 'hero.title', en: 'Rent Professional Equipment', translated: 'Professionelle Ausrustung Mieten' },
    { key: 'hero.subtitle', en: 'Find and rent quality equipment near you', translated: 'Finden und mieten Sie Qualitatsausrustung in Ihrer Nahe' },
    { key: 'nav.browse', en: 'Browse Equipment', translated: 'Ausrustung Durchsuchen' },
    { key: 'nav.dashboard', en: 'Dashboard', translated: 'Dashboard' },
    { key: 'booking.book_now', en: 'Book Now', translated: 'Jetzt Buchen' },
    { key: 'review.leave_review', en: 'Leave a Review', translated: 'Bewertung Abgeben' },
  ],
  ja: [
    { key: 'hero.title', en: 'Rent Professional Equipment', translated: 'purofesshonaru kizai o rentaru' },
    { key: 'hero.subtitle', en: 'Find and rent quality equipment near you', translated: 'chikaku no koshitsu na kizai o sagashite rentaru' },
    { key: 'nav.browse', en: 'Browse Equipment', translated: 'kizai o burauzu' },
    { key: 'nav.dashboard', en: 'Dashboard', translated: 'dasshubodo' },
    { key: 'booking.book_now', en: 'Book Now', translated: 'ima sugu yoyaku' },
    { key: 'review.leave_review', en: 'Leave a Review', translated: 'rebyu o kaku' },
  ],
};

export default function MultiLanguageSupport({ onBack }: MultiLanguageSupportProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'languages' | 'preview' | 'settings'>('languages');

  const filteredLanguages = languages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const previews = translationPreviews[selectedLanguage.code] || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors" aria-label="Go back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Multi-Language Support</h1>
            <p className="text-gray-500 mt-1">Browse and configure language preferences for the platform</p>
          </div>
        </div>

        {/* Current Language Banner */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Current Language</p>
              <h2 className="text-2xl font-bold mt-1">{selectedLanguage.name} ({selectedLanguage.nativeName})</h2>
              <p className="text-teal-100 mt-1">{selectedLanguage.speakers} speakers worldwide</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Globe className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium mt-2">{selectedLanguage.completion}% complete</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'languages' as const, label: 'Languages', icon: <Globe className="w-4 h-4" /> },
            { id: 'preview' as const, label: 'Translation Preview', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'settings' as const, label: 'Settings', icon: <Settings className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Languages Tab */}
        {activeTab === 'languages' && (
          <div>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                    selectedLanguage.code === lang.code
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{lang.name}</p>
                      <p className="text-sm text-gray-500">{lang.nativeName}</p>
                    </div>
                    {selectedLanguage.code === lang.code && (
                      <Check className="w-5 h-5 text-teal-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
                    <span>{lang.speakers} speakers</span>
                    <span>{lang.region}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Translation progress</span>
                      <span className="font-medium text-gray-700">{lang.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          lang.completion >= 95 ? 'bg-green-500' : lang.completion >= 80 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${lang.completion}%` }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4">
              Translation Preview: {selectedLanguage.name}
            </h3>
            {previews ? (
              <div className="space-y-4">
                {previews.map((item) => (
                  <div key={item.key} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.key}</code>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">English</p>
                        <p className="text-sm text-gray-700">{item.en}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{selectedLanguage.name}</p>
                        <p className="text-sm text-teal-700 font-medium">{item.translated}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Translation preview not available for {selectedLanguage.name} yet.</p>
                <p className="text-sm text-gray-400 mt-1">Select Spanish, French, German, or Japanese to see a preview.</p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold mb-4">Language Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Auto-detect language</p>
                    <p className="text-xs text-gray-500 mt-0.5">Automatically detect language from browser settings</p>
                  </div>
                  <div className="w-12 h-6 bg-teal-500 rounded-full relative cursor-pointer">
                    <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Translate user reviews</p>
                    <p className="text-xs text-gray-500 mt-0.5">Auto-translate reviews written in other languages</p>
                  </div>
                  <div className="w-12 h-6 bg-teal-500 rounded-full relative cursor-pointer">
                    <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Show original text alongside translations</p>
                    <p className="text-xs text-gray-500 mt-0.5">Display both original and translated content</p>
                  </div>
                  <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Currency localization</p>
                    <p className="text-xs text-gray-500 mt-0.5">Display prices in your local currency</p>
                  </div>
                  <div className="w-12 h-6 bg-teal-500 rounded-full relative cursor-pointer">
                    <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Date format</p>
                    <p className="text-xs text-gray-500 mt-0.5">Use locale-specific date and time formatting</p>
                  </div>
                  <div className="w-12 h-6 bg-teal-500 rounded-full relative cursor-pointer">
                    <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold mb-4">Help Translate</h3>
              <p className="text-sm text-gray-500 mb-4">
                Help us improve translations by contributing to our community translation effort.
              </p>
              <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors">
                <Star className="w-4 h-4" /> Contribute Translations
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
