import { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Percent,
  CheckCircle,
  Package,
  CreditCard,
  Shield,
  X,
  ArrowRight,
  Loader2,
  Tag,
} from 'lucide-react';
import type { Equipment, BulkBooking } from '../../types';

interface BulkBookingSystemProps {
  initialEquipment?: Equipment[];
  onComplete?: (booking: BulkBooking) => void;
  onClose?: () => void;
}

interface CartItem {
  equipment: Equipment;
  quantity: number;
  startDate: string;
  endDate: string;
  rentalDays: number;
  subtotal: number;
}

interface BulkDiscount {
  minItems: number;
  discount: number;
  label: string;
}

const bulkDiscounts: BulkDiscount[] = [
  { minItems: 2, discount: 5, label: '5% off 2+ items' },
  { minItems: 3, discount: 10, label: '10% off 3+ items' },
  { minItems: 5, discount: 15, label: '15% off 5+ items' },
  { minItems: 10, discount: 20, label: '20% off 10+ items' },
];

// Mock available equipment for adding to cart
const mockAvailableEquipment: Equipment[] = [
  {
    id: 'eq1',
    owner_id: 'owner1',
    category_id: 'cat1',
    title: 'CAT 320 Excavator - 20 Ton',
    description: 'Professional-grade excavator',
    brand: 'Caterpillar',
    model: '320 GC',
    condition: 'excellent',
    daily_rate: 450,
    weekly_rate: 2800,
    monthly_rate: 9500,
    deposit_amount: 2000,
    location: 'Los Angeles, CA',
    latitude: null,
    longitude: null,
    images: ['https://images.unsplash.com/photo-1580901368919-7738efb0f228?w=400'],
    features: ['GPS Tracking', 'Climate Control'],
    specifications: {},
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 90,
    rating: 4.8,
    total_reviews: 24,
    total_bookings: 45,
    is_featured: true,
    is_active: true,
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 'eq2',
    owner_id: 'owner1',
    category_id: 'cat1',
    title: 'John Deere Backhoe Loader',
    description: 'Versatile backhoe loader',
    brand: 'John Deere',
    model: '310L',
    condition: 'good',
    daily_rate: 350,
    weekly_rate: 2100,
    monthly_rate: 7500,
    deposit_amount: 1500,
    location: 'Los Angeles, CA',
    latitude: null,
    longitude: null,
    images: ['https://images.unsplash.com/photo-1621922688758-5d66ed7be5f3?w=400'],
    features: ['4WD', 'Extendahoe'],
    specifications: {},
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 60,
    rating: 4.5,
    total_reviews: 18,
    total_bookings: 32,
    is_featured: false,
    is_active: true,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'eq3',
    owner_id: 'owner2',
    category_id: 'cat2',
    title: 'Concrete Mixer Truck',
    description: 'Heavy duty concrete mixer',
    brand: 'Mack',
    model: 'Granite',
    condition: 'excellent',
    daily_rate: 550,
    weekly_rate: 3200,
    monthly_rate: 11000,
    deposit_amount: 2500,
    location: 'San Diego, CA',
    latitude: null,
    longitude: null,
    images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400'],
    features: ['8 Cubic Yards', 'GPS'],
    specifications: {},
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 30,
    rating: 4.9,
    total_reviews: 12,
    total_bookings: 28,
    is_featured: true,
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'eq4',
    owner_id: 'owner2',
    category_id: 'cat3',
    title: 'Scaffolding Set - 50ft',
    description: 'Complete scaffolding set',
    brand: 'Werner',
    model: 'Pro Series',
    condition: 'good',
    daily_rate: 75,
    weekly_rate: 450,
    monthly_rate: 1500,
    deposit_amount: 500,
    location: 'Los Angeles, CA',
    latitude: null,
    longitude: null,
    images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400'],
    features: ['Safety Rails', 'Platforms Included'],
    specifications: {},
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 90,
    rating: 4.6,
    total_reviews: 45,
    total_bookings: 89,
    is_featured: false,
    is_active: true,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
];

export default function BulkBookingSystem({ initialEquipment = [], onComplete, onClose }: BulkBookingSystemProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    return initialEquipment.map((eq) => ({
      equipment: eq,
      quantity: 1,
      startDate: '',
      endDate: '',
      rentalDays: 0,
      subtotal: 0,
    }));
  });
  const [step, setStep] = useState<'cart' | 'dates' | 'review' | 'payment' | 'complete'>('cart');
  const [isLoading, setIsLoading] = useState(false);
  const [showEquipmentPicker, setShowEquipmentPicker] = useState(false);
  const [globalStartDate, setGlobalStartDate] = useState('');
  const [globalEndDate, setGlobalEndDate] = useState('');
  const [useSameDates, setUseSameDates] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'split'>('card');
  void paymentMethod; void setPaymentMethod; // For future payment integration

  // Calculate rental days
  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Calculate item subtotal
  const calculateSubtotal = (equipment: Equipment, days: number): number => {
    if (days >= 30 && equipment.monthly_rate) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return months * equipment.monthly_rate + remainingDays * equipment.daily_rate;
    }
    if (days >= 7 && equipment.weekly_rate) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return weeks * equipment.weekly_rate + remainingDays * equipment.daily_rate;
    }
    return days * equipment.daily_rate;
  };

  // Get applicable discount
  const getApplicableDiscount = (itemCount: number): BulkDiscount | null => {
    const sortedDiscounts = [...bulkDiscounts].sort((a, b) => b.minItems - a.minItems);
    return sortedDiscounts.find((d) => itemCount >= d.minItems) || null;
  };

  // Calculate totals
  const totals = useMemo(() => {
    const itemsWithDates = cartItems.map((item) => {
      const start = useSameDates ? globalStartDate : item.startDate;
      const end = useSameDates ? globalEndDate : item.endDate;
      const days = calculateDays(start, end);
      const subtotal = calculateSubtotal(item.equipment, days) * item.quantity;
      return { ...item, rentalDays: days, subtotal };
    });

    const subtotal = itemsWithDates.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = itemsWithDates.reduce((sum, item) => sum + item.quantity, 0);
    const discount = getApplicableDiscount(totalItems);
    const discountAmount = discount ? (subtotal * discount.discount) / 100 : 0;
    const serviceFee = (subtotal - discountAmount) * 0.05; // 5% service fee
    const totalDeposit = itemsWithDates.reduce((sum, item) => sum + item.equipment.deposit_amount * item.quantity, 0);
    const totalAmount = subtotal - discountAmount + serviceFee;

    return {
      items: itemsWithDates,
      subtotal,
      totalItems,
      discount,
      discountAmount,
      serviceFee,
      totalDeposit,
      totalAmount,
    };
  }, [cartItems, globalStartDate, globalEndDate, useSameDates]);

  // Add item to cart
  const addToCart = (equipment: Equipment) => {
    const existingIndex = cartItems.findIndex((item) => item.equipment.id === equipment.id);
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          equipment,
          quantity: 1,
          startDate: globalStartDate,
          endDate: globalEndDate,
          rentalDays: 0,
          subtotal: 0,
        },
      ]);
    }
    setShowEquipmentPicker(false);
  };

  // Update item quantity
  const updateQuantity = (equipmentId: string, delta: number) => {
    setCartItems(
      cartItems
        .map((item) =>
          item.equipment.id === equipmentId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item from cart
  const removeFromCart = (equipmentId: string) => {
    setCartItems(cartItems.filter((item) => item.equipment.id !== equipmentId));
  };

  // Update item dates
  const updateItemDates = (equipmentId: string, startDate: string, endDate: string) => {
    setCartItems(
      cartItems.map((item) =>
        item.equipment.id === equipmentId ? { ...item, startDate, endDate } : item
      )
    );
  };

  // Process booking
  const processBooking = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setStep('complete');
    
    if (onComplete) {
      const mockBooking: BulkBooking = {
        id: Date.now().toString(),
        renter_id: 'current_user',
        booking_ids: totals.items.map((_, idx) => `booking_${idx}`),
        total_equipment: totals.totalItems,
        subtotal: totals.subtotal,
        bulk_discount: totals.discountAmount,
        service_fee: totals.serviceFee,
        total_amount: totals.totalAmount,
        status: 'confirmed',
        payment_status: 'paid',
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onComplete(mockBooking);
    }
  };

  // Render cart step
  const renderCart = () => (
    <div className="space-y-4">
      {/* Discount Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5" />
          <span className="font-semibold">Bulk Booking Discounts</span>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          {bulkDiscounts.map((d) => (
            <span
              key={d.minItems}
              className={`px-2 py-1 rounded ${
                totals.discount?.minItems === d.minItems
                  ? 'bg-white text-orange-600 font-semibold'
                  : 'bg-white/20'
              }`}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>

      {/* Cart Items */}
      {cartItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            onClick={() => setShowEquipmentPicker(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add Equipment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {totals.items.map((item) => (
            <div key={item.equipment.id} className="border rounded-lg overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <img
                  src={item.equipment.images[0] || 'https://via.placeholder.com/80'}
                  alt={item.equipment.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.equipment.title}</h4>
                  <p className="text-sm text-gray-500">{item.equipment.brand} {item.equipment.model}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.equipment.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${item.equipment.daily_rate}/day
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.equipment.id, -1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.equipment.id, 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${item.subtotal.toLocaleString()}
                  </p>
                  {item.rentalDays > 0 && (
                    <p className="text-xs text-gray-500">{item.rentalDays} days</p>
                  )}
                </div>
                <button
                  onClick={() => removeFromCart(item.equipment.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowEquipmentPicker(true)}
            className="w-full py-3 border-2 border-dashed rounded-lg text-gray-500 hover:border-teal-500 hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add More Equipment
          </button>
        </div>
      )}

      {/* Equipment Picker Modal */}
      {showEquipmentPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Add Equipment to Cart</h3>
              <button onClick={() => setShowEquipmentPicker(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-96 space-y-3">
              {mockAvailableEquipment
                .filter((eq) => !cartItems.find((item) => item.equipment.id === eq.id))
                .map((equipment) => (
                  <div
                    key={equipment.id}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:border-teal-500 cursor-pointer transition-colors"
                    onClick={() => addToCart(equipment)}
                  >
                    <img
                      src={equipment.images[0] || 'https://via.placeholder.com/60'}
                      alt={equipment.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{equipment.title}</h4>
                      <p className="text-sm text-gray-500">{equipment.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-teal-600">${equipment.daily_rate}/day</p>
                      <p className="text-xs text-gray-500">Deposit: ${equipment.deposit_amount}</p>
                    </div>
                    <Plus className="w-5 h-5 text-teal-600" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render dates step
  const renderDates = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useSameDates}
            onChange={(e) => setUseSameDates(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <span className="font-medium text-blue-900">Use same dates for all equipment</span>
        </label>
        <p className="text-sm text-blue-700 mt-1 ml-6">
          This simplifies booking and may qualify for weekly/monthly rates
        </p>
      </div>

      {useSameDates ? (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Rental Period (All Equipment)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={globalStartDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setGlobalStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={globalEndDate}
                min={globalStartDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setGlobalEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          {globalStartDate && globalEndDate && (
            <div className="mt-4 p-3 bg-teal-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-teal-800">Total Rental Period:</span>
                <span className="font-semibold text-teal-900">
                  {calculateDays(globalStartDate, globalEndDate)} days
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.equipment.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={item.equipment.images[0] || 'https://via.placeholder.com/40'}
                  alt={item.equipment.title}
                  className="w-10 h-10 object-cover rounded"
                />
                <div>
                  <h4 className="font-medium">{item.equipment.title}</h4>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={item.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => updateItemDates(item.equipment.id, e.target.value, item.endDate)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={item.endDate}
                    min={item.startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => updateItemDates(item.equipment.id, item.startDate, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render review step
  const renderReview = () => (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="font-semibold">Order Summary</h3>
        </div>
        <div className="divide-y">
          {totals.items.map((item) => (
            <div key={item.equipment.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={item.equipment.images[0] || 'https://via.placeholder.com/40'}
                  alt={item.equipment.title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <h4 className="font-medium">{item.equipment.title}</h4>
                  <p className="text-sm text-gray-500">
                    {item.quantity}x • {item.rentalDays} days @ ${item.equipment.daily_rate}/day
                  </p>
                </div>
              </div>
              <span className="font-semibold">${item.subtotal.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({totals.totalItems} items)</span>
          <span>${totals.subtotal.toLocaleString()}</span>
        </div>
        {totals.discount && (
          <div className="flex justify-between text-green-600">
            <span className="flex items-center gap-1">
              <Percent className="w-4 h-4" />
              Bulk Discount ({totals.discount.label})
            </span>
            <span>-${totals.discountAmount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Service Fee (5%)</span>
          <span>${totals.serviceFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-500 text-sm">
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            Security Deposit (refundable)
          </span>
          <span>${totals.totalDeposit.toLocaleString()}</span>
        </div>
        <div className="border-t pt-3 flex justify-between text-lg font-bold">
          <span>Total Due Today</span>
          <span className="text-teal-600">
            ${(totals.totalAmount + totals.totalDeposit).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold mb-3">Payment Method</h4>
        <div className="space-y-2">
          {[
            { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
            { id: 'bank', label: 'Bank Transfer', icon: DollarSign },
            { id: 'split', label: 'Split Payment', icon: Package },
          ].map(({ id, label, icon: Icon }) => (
            <label
              key={id}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === id ? 'border-teal-500 bg-teal-50' : 'hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={id}
                checked={paymentMethod === id}
                onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                className="w-4 h-4 text-teal-600"
              />
              <Icon className="w-5 h-5 text-gray-500" />
              <span className="font-medium">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // Render complete step
  const renderComplete = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
      <p className="text-gray-600 mb-6">
        Your bulk booking has been successfully processed. You'll receive a confirmation email shortly.
      </p>
      <div className="bg-gray-50 rounded-lg p-4 max-w-sm mx-auto mb-6">
        <div className="text-sm text-gray-500 mb-1">Booking Reference</div>
        <div className="text-lg font-mono font-bold text-gray-900">BULK-{Date.now().toString(36).toUpperCase()}</div>
      </div>
      <div className="flex justify-center gap-4">
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          View Bookings
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );

  const canProceed = useMemo(() => {
    switch (step) {
      case 'cart':
        return cartItems.length > 0;
      case 'dates':
        if (useSameDates) {
          return globalStartDate && globalEndDate && calculateDays(globalStartDate, globalEndDate) > 0;
        }
        return cartItems.every(
          (item) => item.startDate && item.endDate && calculateDays(item.startDate, item.endDate) > 0
        );
      case 'review':
        return true;
      default:
        return false;
    }
  }, [step, cartItems, useSameDates, globalStartDate, globalEndDate]);

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Bulk Booking System</h2>
              <p className="text-teal-100 text-sm">Book multiple equipment and save with bulk discounts</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between mt-6">
          {['cart', 'dates', 'review', 'payment', 'complete'].map((s, idx, arr) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step === s
                    ? 'bg-white text-teal-600'
                    : arr.indexOf(step) > idx
                    ? 'bg-teal-400 text-white'
                    : 'bg-teal-500/50 text-teal-200'
                }`}
              >
                {arr.indexOf(step) > idx ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              {idx < arr.length - 1 && (
                <div
                  className={`w-16 h-0.5 ${
                    arr.indexOf(step) > idx ? 'bg-teal-400' : 'bg-teal-500/50'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {step === 'cart' && renderCart()}
        {step === 'dates' && renderDates()}
        {step === 'review' && renderReview()}
        {step === 'complete' && renderComplete()}
      </div>

      {/* Footer */}
      {step !== 'complete' && (
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <div>
            {totals.totalItems > 0 && (
              <div className="text-sm text-gray-500">
                {totals.totalItems} items • ${totals.totalAmount.toLocaleString()} total
                {totals.discount && (
                  <span className="text-green-600 ml-2">
                    (Save ${totals.discountAmount.toLocaleString()})
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {step !== 'cart' && (
              <button
                onClick={() => {
                  const steps: ('cart' | 'dates' | 'review' | 'payment' | 'complete')[] = ['cart', 'dates', 'review', 'payment'];
                  const currentIndex = steps.indexOf(step);
                  if (currentIndex > 0) setStep(steps[currentIndex - 1]);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
            )}
            {step === 'review' ? (
              <button
                onClick={processBooking}
                disabled={isLoading}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Confirm & Pay ${(totals.totalAmount + totals.totalDeposit).toLocaleString()}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  const steps: ('cart' | 'dates' | 'review' | 'payment' | 'complete')[] = ['cart', 'dates', 'review'];
                  const currentIndex = steps.indexOf(step);
                  if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1]);
                }}
                disabled={!canProceed}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
