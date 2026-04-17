// Email service client for frontend use

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface SendEmailParams {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    return await response.json();
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: String(error) };
  }
}

// Convenience functions for common email types
export async function sendWelcomeEmail(email: string, userName: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Welcome to Islakayd! 🎉',
    template: 'welcome',
    data: { userName },
  });
}

export async function sendBookingConfirmation(
  email: string,
  data: {
    renterName: string;
    equipmentTitle: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    totalAmount: number;
    pickupLocation: string;
    bookingId: string;
  }
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Booking Confirmed - ${data.equipmentTitle}`,
    template: 'booking-confirmation',
    data: {
      ...data,
      totalAmount: data.totalAmount.toFixed(2),
    },
  });
}

export async function sendNewMessageNotification(
  email: string,
  data: {
    recipientName: string;
    senderName: string;
    messagePreview: string;
    conversationId: string;
    equipmentTitle?: string;
  }
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `New message from ${data.senderName}`,
    template: 'new-message',
    data,
  });
}

export async function sendPriceAlertNotification(
  email: string,
  data: {
    userName: string;
    equipmentTitle: string;
    equipmentId: string;
    previousPrice: number;
    newPrice: number;
  }
): Promise<void> {
  const savings = Math.round(((data.previousPrice - data.newPrice) / data.previousPrice) * 100);
  
  await sendEmail({
    to: email,
    subject: `Price Drop Alert: ${data.equipmentTitle}`,
    template: 'price-alert',
    data: {
      ...data,
      savings,
    },
  });
}

export async function sendReviewNotification(
  email: string,
  data: {
    ownerName: string;
    reviewerName: string;
    equipmentTitle: string;
    equipmentId: string;
    rating: number;
    reviewText: string;
  }
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `New ${data.rating}-star review for ${data.equipmentTitle}`,
    template: 'new-review',
    data,
  });
}

export async function sendVerificationApproved(
  email: string,
  data: {
    userName: string;
    verificationType: string;
  }
): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Your Islakayd Account is Verified! ✅',
    template: 'verification-approved',
    data,
  });
}

export async function sendBookingApproved(
  email: string,
  data: {
    renterName: string;
    equipmentTitle: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    totalAmount: number;
    pickupLocation: string;
    bookingId: string;
  }
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `✅ Booking Approved - ${data.equipmentTitle}`,
    template: 'booking-approved',
    data: {
      ...data,
      totalAmount: data.totalAmount.toFixed(2),
    },
  });
}

export async function sendBookingDeclined(
  email: string,
  data: {
    renterName: string;
    equipmentTitle: string;
    startDate: string;
    endDate: string;
    bookingId: string;
  }
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Booking Update - ${data.equipmentTitle}`,
    template: 'booking-declined',
    data,
  });
}

export async function sendBookingRequestToOwner(
  email: string,
  data: {
    ownerName: string;
    renterName: string;
    equipmentTitle: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    totalAmount: number;
    bookingId: string;
    renterTrustScore?: number;
  }
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `📦 New Booking Request - ${data.equipmentTitle}`,
    template: 'booking-request-owner',
    data: {
      ...data,
      totalAmount: data.totalAmount.toFixed(2),
    },
  });
}
