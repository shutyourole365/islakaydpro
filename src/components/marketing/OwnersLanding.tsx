import { Camera, Wrench, Tent, Music, ShieldCheck, DollarSign, CheckCircle2 } from 'lucide-react';

interface OwnersLandingProps {
  onListItem: () => void;
}

const EARNINGS = [
  { icon: Camera, label: 'Camera kit', range: '$80–250/day' },
  { icon: Wrench, label: 'Power tools', range: '$25–100/day' },
  { icon: Tent, label: 'Event gear', range: '$100–500/day' },
  { icon: Music, label: 'DJ / PA rig', range: '$120–300/day' },
];

const STEPS: [string, string][] = [
  ['List it in 5 minutes', 'Photos, a price, the dates it’s available. We’ll even shoot the photos for you.'],
  ['Approve bookings', 'Renters request, you accept. You set the rules, the deposit, the pickup.'],
  ['Get paid', 'Money lands in your account after each rental. We handle payments and deposits.'],
];

const FOUNDER_PERKS = [
  '0% platform fee for 90 days (normally 12%)',
  'Free professional listing photos',
  '“Founding Owner” badge for life',
  'A booking in your first 30 days — guaranteed',
];

const TRUST: [typeof ShieldCheck, string, string][] = [
  [ShieldCheck, 'ID-verified renters', 'Every renter verifies their identity before they can book.'],
  [DollarSign, 'Deposits on every booking', 'Refundable security deposits are held automatically.'],
];

export default function OwnersLanding({ onListItem }: OwnersLandingProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Your gear is worth more than it's earning.
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          List the equipment you already own and earn from it when you're not using it.
          Perth's marketplace for renting gear, peer to peer.
        </p>
        <button
          onClick={onListItem}
          className="px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          List your first item — free
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          Founding Perth owners pay 0% fees for 90 days.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6 mb-16">
        {STEPS.map(([title, body], i) => (
          <div key={title} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold mb-4">
              {i + 1}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{body}</p>
          </div>
        ))}
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          What your gear could earn
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {EARNINGS.map(({ icon: Icon, label, range }) => (
            <div key={label} className="p-5 text-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl">
              <Icon className="w-7 h-7 mx-auto text-teal-600 mb-3" />
              <div className="font-medium text-gray-900 dark:text-white">{label}</div>
              <div className="text-teal-600 font-bold mt-1">{range}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          A camera that sits idle 300 days a year is $24,000 of unrealised rental income.
        </p>
      </section>

      <section className="mb-16 p-8 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 rounded-3xl border border-teal-100 dark:border-teal-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          First 50 Perth owners get Founding status
        </h2>
        <ul className="mt-4 space-y-2">
          {FOUNDER_PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-2 text-gray-700 dark:text-gray-200">
              <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              {perk}
            </li>
          ))}
        </ul>
        <button
          onClick={onListItem}
          className="mt-6 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
        >
          Claim your Founding Owner spot
        </button>
      </section>

      <section className="grid md:grid-cols-2 gap-6 mb-16">
        {TRUST.map(([Icon, title, body]) => (
          <div key={title} className="flex gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <Icon className="w-8 h-8 text-teal-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{body}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Turn your idle gear into income.
        </h2>
        <button
          onClick={onListItem}
          className="px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          List free today
        </button>
      </section>
    </div>
  );
}
