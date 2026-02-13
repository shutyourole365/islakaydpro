import { useState } from 'react';
import {
  X,
  Heart,
  Share2,
  Star,
  MapPin,
  Shield,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Award,
  Truck,
  AlertCircle,
  Info,
  DollarSign,
} from 'lucide-react';
import type { Equipment } from '../../types';
import PriceNegotiator from '../negotiation/PriceNegotiator';
import MaintenancePredictor from '../predictive/MaintenancePredictor';

interface EquipmentDetailProps {
  equipment: Equipment;
  onClose: () => void;
  onBook: (equipment: Equipment, dates: { start: string; end: string }) => void;
  onMessage: (equipment: Equipment) => void;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
}

export default function EquipmentDetail({
  equipment,
  onClose,
  onBook,
  onMessage,
  isFavorite,
  onFavoriteToggle,
}: EquipmentDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showNegotiator, setShowNegotiator] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === equipment.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? equipment.images.length - 1 : prev - 1
    );
  };

  const calculateTotal = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return null;

    const subtotal = days * equipment.daily_rate;
    const serviceFee = subtotal * 0.12;
    const total = subtotal + serviceFee + equipment.deposit_amount;

    return { days, subtotal, serviceFee, total };
  };

  const pricing = calculateTotal();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to results
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onFavoriteToggle}
              className={`p-2.5 rounded-full transition-colors ${
                isFavorite
                  ? 'bg-red-50 text-red-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
            </button>
            <button className="p-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 overflow-y-auto max-h-[calc(90vh-70px)]">
          <div className="lg:col-span-3 p-6">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
              <img
                src={equipment.images[currentImageIndex]}
                alt={equipment.title}
                className="w-full h-full object-cover"
              />
              {equipment.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-gray-800 hover:bg-white transition-colors shadow-lg"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-gray-800 hover:bg-white transition-colors shadow-lg"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {equipment.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-white w-6'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {equipment.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {equipment.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-teal-500'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${equipment.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {equipment.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span className="font-semibold text-gray-900">
                        {equipment.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-500">
                        ({equipment.total_reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      {equipment.location}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {equipment.is_featured && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                    <Award className="w-4 h-4" />
                    Featured
                  </span>
                )}
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Verified Owner
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium capitalize">
                  <CheckCircle2 className="w-4 h-4" />
                  {equipment.condition} Condition
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  <Truck className="w-4 h-4" />
                  Delivery Available
                </span>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-600 leading-relaxed">{equipment.description}</p>
              </div>

              {equipment.features.length > 0 && (
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Features</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {equipment.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-gray-600"
                      >
                        <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(equipment.specifications).length > 0 && (
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Specifications
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(equipment.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-50">
                        <span className="text-gray-500 capitalize">{key}</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-6 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Maintenance Status
                  </h2>
                  <button
                    onClick={() => setShowMaintenance(true)}
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                  >
                    View Details →
                  </button>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Equipment is in good condition</p>
                    <p className="text-sm text-green-600">Last maintenance: 2 weeks ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-50 p-6">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-3xl font-bold text-gray-900">
                      ${equipment.daily_rate}
                    </span>
                    <span className="text-gray-500">/day</span>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {equipment.weekly_rate && (
                      <p>${equipment.weekly_rate}/week</p>
                    )}
                    {equipment.monthly_rate && (
                      <p>${equipment.monthly_rate}/month</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Start Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        End Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                    <Info className="w-5 h-5 flex-shrink-0" />
                    <span>
                      Min {equipment.min_rental_days} days, max {equipment.max_rental_days} days rental
                    </span>
                  </div>
                </div>

                {pricing && (
                  <div className="border-t border-gray-100 pt-4 mb-6 space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>
                        ${equipment.daily_rate} x {pricing.days} days
                      </span>
                      <span>${pricing.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Service fee (12%)</span>
                      <span>${pricing.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Refundable deposit</span>
                      <span>${equipment.deposit_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t border-gray-100">
                      <span>Total</span>
                      <span>${pricing.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onBook(equipment, { start: startDate, end: endDate })}
                  disabled={!pricing}
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                >
                  {pricing ? 'Reserve Now' : 'Select Dates to Book'}
                </button>

                <button
                  onClick={() => onMessage(equipment)}
                  className="w-full py-4 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Message Owner
                </button>

                <button
                  onClick={() => setShowNegotiator(true)}
                  className="w-full py-4 border border-orange-200 text-orange-700 font-semibold rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-5 h-5" />
                  Negotiate Price
                </button>

                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                      {equipment.owner?.full_name?.charAt(0) || 'O'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {equipment.owner?.full_name || 'Owner'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>
                          {equipment.owner?.rating?.toFixed(1) || '5.0'} (
                          {equipment.owner?.total_reviews || 0} reviews)
                        </span>
                      </div>
                      {equipment.owner?.is_verified && (
                        <span className="inline-flex items-center gap-1 text-sm text-teal-600 mt-1">
                          <Shield className="w-4 h-4" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-gray-400" />
                  <p>
                    Free cancellation up to 48 hours before pickup. Deposit fully
                    refundable upon return.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showNegotiator && pricing && (
        <PriceNegotiator
          equipmentId={equipment.id}
          equipmentTitle={equipment.title}
          originalDailyRate={equipment.daily_rate}
          ownerId={equipment.owner_id}
          ownerName={equipment.owner?.full_name || 'Owner'}
          rentalDays={pricing.days}
          onAccepted={(finalPrice) => {
            // Handle accepted negotiation
            setShowNegotiator(false);
            // Could update the booking with negotiated price
          }}
          onRejected={() => setShowNegotiator(false)}
          onClose={() => setShowNegotiator(false)}
        />
      )}

      {showMaintenance && (
        <MaintenancePredictor
          equipmentId={equipment.id}
          equipmentTitle={equipment.title}
          category={equipment.category_id}
          hoursUsed={500} // Mock data
          lastMaintenanceDate={new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)} // 2 weeks ago
          onScheduleMaintenance={(date, type) => {
            // Handle scheduling
            setShowMaintenance(false);
          }}
          onClose={() => setShowMaintenance(false)}
        />
      )}
    </div>
  );
}
