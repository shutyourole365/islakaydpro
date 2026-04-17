import { useMemo, useState } from 'react';
import { ArrowLeft, Check, Globe, Search } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  completion: number;
  speakers: string;
  region: string;
}

interface Props {
  onBack: () => void;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: 'EN', completion: 100, speakers: '1.5B', region: 'Global' },
  { code: 'es', name: 'Spanish', nativeName: 'Espanol', flag: 'ES', completion: 98, speakers: '560M', region: 'Americas, Europe' },
  { code: 'fr', name: 'French', nativeName: 'Francais', flag: 'FR', completion: 96, speakers: '280M', region: 'Europe, Africa' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: 'DE', completion: 94, speakers: '130M', region: 'Europe' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Portugues', flag: 'PT', completion: 90, speakers: '260M', region: 'Americas, Europe' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: 'IT', completion: 88, speakers: '65M', region: 'Europe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: 'NL', completion: 85, speakers: '30M', region: 'Europe' },
  { code: 'ja', name: 'Japanese', nativeName: 'Nihongo', flag: 'JP', completion: 82, speakers: '125M', region: 'Asia' },
  { code: 'zh', name: 'Chinese', nativeName: 'Zhongwen', flag: 'CN', completion: 80, speakers: '1.1B', region: 'Asia' },
  { code: 'hi', name: 'Hindi', nativeName: 'Hindi', flag: 'IN', completion: 78, speakers: '600M', region: 'Asia' },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  'hero.title': {
    en: 'Rent Professional Equipment',
    es: 'Alquila Equipo Profesional',
    fr: 'Louez du Materiel Professionnel',
    de: 'Professionelle Ausrustung Mieten',
    pt: 'Alugue Equipamento Profissional',
    it: 'Noleggia Attrezzatura Professionale',
  },
  'hero.subtitle': {
    en: 'Thousands of equipment owners near you',
    es: 'Miles de propietarios de equipos cerca de ti',
    fr: 'Des milliers de proprietaires pres de vous',
    de: 'Tausende von Geratebesitzern in Ihrer Nahe',
  },
};

type Tab = 'languages' | 'preview' | 'settings';

export default function MultiLanguageSupport({ onBack }: Props) {
  const [selectedCode, setSelectedCode] = useState<string>('en');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('languages');

  const selected = useMemo(
    () => LANGUAGES.find((l) => l.code === selectedCode) ?? LANGUAGES[0],
    [selectedCode]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return LANGUAGES;
    const q = search.toLowerCase();
    return LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Multi-Language Support</h1>
            <p className="text-sm text-gray-500">
              Browse and configure language preferences for the platform.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl p-5 mb-6">
          <p className="text-xs uppercase tracking-wide opacity-90 mb-1">Current Language</p>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold">{selected.name}</h2>
              <p className="text-sm opacity-90">{selected.nativeName}</p>
            </div>
            <div className="text-right text-sm opacity-90">
              <p>{selected.completion}% complete</p>
              <p>{selected.speakers} speakers worldwide</p>
              <p>{selected.region}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('languages')}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              tab === 'languages' ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            Languages
          </button>
          <button
            onClick={() => setTab('preview')}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              tab === 'preview' ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            Translation Preview
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              tab === 'settings' ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            Settings
          </button>
        </div>

        {tab === 'languages' && (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search languages by name, native name, or region"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((lang) => {
                const isSelected = lang.code === selected.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedCode(lang.code)}
                    className={`text-left rounded-2xl border bg-white p-4 transition-colors ${
                      isSelected ? 'border-teal-500 ring-2 ring-teal-100' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{lang.name}</p>
                        <p className="text-xs text-gray-500">{lang.nativeName}</p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-teal-600" />}
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-2">
                      <div
                        className="h-full bg-teal-500"
                        style={{ width: `${lang.completion}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{lang.completion}%</span>
                      <span>{lang.speakers} speakers</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{lang.region}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'preview' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Translation Preview: {selected.name}
            </h3>
            {Object.keys(TRANSLATIONS).some((key) => TRANSLATIONS[key][selected.code]) ? (
              <div className="space-y-4">
                {Object.entries(TRANSLATIONS).map(([key, values]) => (
                  <div key={key} className="border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-mono text-gray-500 mb-2">{key}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">English</p>
                        <p className="text-gray-900">{values.en}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{selected.name}</p>
                        <p className="text-gray-900">{values[selected.code] ?? '—'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Translation preview not available for {selected.name} yet.
              </p>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Preferences</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-center justify-between">
                  <span>Auto-detect language</span>
                  <span className="text-xs text-gray-500">Enabled</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Translate user reviews</span>
                  <span className="text-xs text-gray-500">Enabled</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Currency localization</span>
                  <span className="text-xs text-gray-500">USD</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-900">Help Translate</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Help us reach every market by contributing translations.
              </p>
              <button className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700">
                Contribute Translations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
