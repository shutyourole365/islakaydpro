// Supabase Edge Function: Send Email Notifications
// Deploy with: supabase functions deploy send-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Islakayd <noreply@islakayd.com>';

interface EmailRequest {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, template, data } = await req.json() as EmailRequest;

    if (!to || !subject || !template) {
      throw new Error('Missing required fields: to, subject, template');
    }

    const html = generateEmailHTML(template, data);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Email error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateEmailHTML(template: string, data: Record<string, unknown>): string {
  const templates: Record<string, (data: Record<string, unknown>) => string> = {
    'booking-confirmation': bookingConfirmationTemplate,
    'booking-request': bookingRequestTemplate,
    'booking-approved': bookingApprovedTemplate,
    'booking-rejected': bookingRejectedTemplate,
    'booking-reminder': bookingReminderTemplate,
    'payment-received': paymentReceivedTemplate,
    'new-message': newMessageTemplate,
    'new-review': newReviewTemplate,
    'price-alert': priceAlertTemplate,
    'welcome': welcomeTemplate,
    'password-reset': passwordResetTemplate,
    'verification-approved': verificationApprovedTemplate,
  };

  const templateFn = templates[template];
  if (!templateFn) {
    throw new Error(`Unknown template: ${template}`);
  }

  return baseTemplate(templateFn(data));
}

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Islakayd</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #0d9488, #10b981);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      color: rgba(255, 255, 255, 0.9);
      margin: 10px 0 0 0;
      font-size: 14px;
    }
    .content {
      padding: 30px;
    }
    .btn {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #0d9488, #10b981);
      color: white !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .btn:hover {
      opacity: 0.9;
    }
    .footer {
      padding: 20px 30px;
      background: #f9fafb;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .info-box {
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #6b7280;
    }
    .info-value {
      font-weight: 600;
      color: #111827;
    }
    .highlight {
      color: #0d9488;
      font-weight: 600;
    }
    .warning-box {
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 12px;
      padding: 15px;
      margin: 20px 0;
    }
    .success-box {
      background: #d1fae5;
      border: 1px solid #6ee7b7;
      border-radius: 12px;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>🔧 Islakayd</h1>
        <p>Equipment Rental Marketplace</p>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Islakayd, Inc. All rights reserved.</p>
        <p>
          <a href="https://islakayd.com/settings/notifications" style="color: #0d9488;">Manage notifications</a> •
          <a href="https://islakayd.com/help" style="color: #0d9488;">Help Center</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function bookingConfirmationTemplate(data: Record<string, unknown>): string {
  return `
    <h2>Booking Confirmed! 🎉</h2>
    <p>Great news, <strong>${data.renterName}</strong>! Your booking has been confirmed.</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0;">Booking Details</h3>
      <div class="info-row">
        <span class="info-label">Equipment</span>
        <span class="info-value">${data.equipmentTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Pickup Date</span>
        <span class="info-value">${data.startDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Return Date</span>
        <span class="info-value">${data.endDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Duration</span>
        <span class="info-value">${data.totalDays} days</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total Amount</span>
        <span class="info-value highlight">$${data.totalAmount}</span>
      </div>
    </div>

    <div class="success-box">
      <strong>📍 Pickup Location:</strong><br>
      ${data.pickupLocation}
    </div>

    <p>The owner will contact you shortly with pickup instructions.</p>
    
    <center>
      <a href="https://islakayd.com/bookings/${data.bookingId}" class="btn">View Booking Details</a>
    </center>
  `;
}

function bookingRequestTemplate(data: Record<string, unknown>): string {
  return `
    <h2>New Booking Request! 📬</h2>
    <p>Hello <strong>${data.ownerName}</strong>,</p>
    <p>You have a new booking request for your equipment.</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0;">Request Details</h3>
      <div class="info-row">
        <span class="info-label">Equipment</span>
        <span class="info-value">${data.equipmentTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Requested by</span>
        <span class="info-value">${data.renterName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Dates</span>
        <span class="info-value">${data.startDate} - ${data.endDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Duration</span>
        <span class="info-value">${data.totalDays} days</span>
      </div>
      <div class="info-row">
        <span class="info-label">You'll Earn</span>
        <span class="info-value highlight">$${data.ownerEarnings}</span>
      </div>
    </div>

    <div class="warning-box">
      ⏰ Please respond within 24 hours to avoid automatic cancellation.
    </div>
    
    <center>
      <a href="https://islakayd.com/bookings/${data.bookingId}" class="btn">Review & Respond</a>
    </center>
  `;
}

function bookingApprovedTemplate(data: Record<string, unknown>): string {
  return `
    <h2>Your Booking is Approved! ✅</h2>
    <p>Hello <strong>${data.renterName}</strong>,</p>
    <p>Great news! <strong>${data.ownerName}</strong> has approved your booking request.</p>
    
    <div class="success-box">
      <strong>${data.equipmentTitle}</strong><br>
      ${data.startDate} - ${data.endDate}
    </div>

    <p>Next steps:</p>
    <ol>
      <li>Complete your payment if not already done</li>
      <li>Contact the owner to arrange pickup</li>
      <li>Pick up the equipment on ${data.startDate}</li>
    </ol>
    
    <center>
      <a href="https://islakayd.com/bookings/${data.bookingId}" class="btn">Complete Payment</a>
    </center>
  `;
}

function bookingRejectedTemplate(data: Record<string, unknown>): string {
  return `
    <h2>Booking Update</h2>
    <p>Hello <strong>${data.renterName}</strong>,</p>
    <p>Unfortunately, your booking request for <strong>${data.equipmentTitle}</strong> was not approved.</p>
    
    ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
    
    <p>Don't worry! There are plenty of other options available.</p>
    
    <center>
      <a href="https://islakayd.com/browse" class="btn">Find Similar Equipment</a>
    </center>
  `;
}

function bookingReminderTemplate(data: Record<string, unknown>): string {
  return `
    <h2>Reminder: Upcoming ${data.type === 'pickup' ? 'Pickup' : 'Return'} 📅</h2>
    <p>Hello <strong>${data.userName}</strong>,</p>
    <p>This is a reminder that your equipment ${data.type === 'pickup' ? 'pickup' : 'return'} is ${data.daysAway === 1 ? 'tomorrow' : `in ${data.daysAway} days`}.</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Equipment</span>
        <span class="info-value">${data.equipmentTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${data.type === 'pickup' ? 'Pickup' : 'Return'} Date</span>
        <span class="info-value">${data.date}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Location</span>
        <span class="info-value">${data.location}</span>
      </div>
    </div>
    
    <center>
      <a href="https://islakayd.com/bookings/${data.bookingId}" class="btn">View Details</a>
    </center>
  `;
}

function paymentReceivedTemplate(data: Record<string, unknown>): string {
  return `
    <h2>Payment Received 💰</h2>
    <p>Hello <strong>${data.userName}</strong>,</p>
    <p>We've received your payment for the following booking:</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Equipment</span>
        <span class="info-value">${data.equipmentTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Amount Paid</span>
        <span class="info-value highlight">$${data.amount}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Transaction ID</span>
        <span class="info-value">${data.transactionId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date</span>
        <span class="info-value">${data.date}</span>
      </div>
    </div>

    <div class="success-box">
      ✅ Your booking is now fully confirmed!
    </div>
    
    <center>
      <a href="https://islakayd.com/bookings/${data.bookingId}" class="btn">View Booking</a>
    </center>
  `;
}

function newMessageTemplate(data: Record<string, unknown>): string {
  return `
    <h2>New Message 💬</h2>
    <p>Hello <strong>${data.recipientName}</strong>,</p>
    <p>You have a new message from <strong>${data.senderName}</strong>:</p>
    
    <div class="info-box">
      <p style="font-style: italic; margin: 0;">"${data.messagePreview}..."</p>
    </div>

    ${data.equipmentTitle ? `<p>Regarding: <strong>${data.equipmentTitle}</strong></p>` : ''}
    
    <center>
      <a href="https://islakayd.com/messages/${data.conversationId}" class="btn">Reply Now</a>
    </center>
  `;
}

function newReviewTemplate(data: Record<string, unknown>): string {
  const stars = '⭐'.repeat(Number(data.rating));
  return `
    <h2>New Review ${stars}</h2>
    <p>Hello <strong>${data.ownerName}</strong>,</p>
    <p><strong>${data.reviewerName}</strong> left a ${data.rating}-star review for your equipment:</p>
    
    <div class="info-box">
      <p><strong>${data.equipmentTitle}</strong></p>
      <p style="font-style: italic; margin: 0;">"${data.reviewText}"</p>
    </div>

    <p>Reviews help build your reputation. Consider responding to show you care about feedback!</p>
    
    <center>
      <a href="https://islakayd.com/equipment/${data.equipmentId}#reviews" class="btn">View Review</a>
    </center>
  `;
}

function priceAlertTemplate(data: Record<string, unknown>): string {
  return `
    <h2>Price Alert! 🔔</h2>
    <p>Hello <strong>${data.userName}</strong>,</p>
    <p>Good news! An item you're watching has dropped in price.</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Equipment</span>
        <span class="info-value">${data.equipmentTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Previous Price</span>
        <span class="info-value" style="text-decoration: line-through;">$${data.previousPrice}/day</span>
      </div>
      <div class="info-row">
        <span class="info-label">New Price</span>
        <span class="info-value highlight">$${data.newPrice}/day</span>
      </div>
      <div class="info-row">
        <span class="info-label">You Save</span>
        <span class="info-value" style="color: #10b981;">${data.savings}%</span>
      </div>
    </div>
    
    <center>
      <a href="https://islakayd.com/equipment/${data.equipmentId}" class="btn">Book Now</a>
    </center>
  `;
}

function welcomeTemplate(data: Record<string, unknown>): string {
  return `
    <h2>Welcome to Islakayd! 👋</h2>
    <p>Hello <strong>${data.userName}</strong>,</p>
    <p>We're thrilled to have you join our community of equipment renters and owners!</p>
    
    <div class="info-box">
      <h3 style="margin-top: 0;">Get Started</h3>
      <p>🔍 <strong>Browse Equipment</strong> - Find tools, cameras, vehicles & more</p>
      <p>📦 <strong>List Your Gear</strong> - Earn money from equipment you own</p>
      <p>💬 <strong>Chat with AI</strong> - Our assistant helps you find the perfect rental</p>
    </div>

    <p>Complete your profile to unlock all features:</p>
    
    <center>
      <a href="https://islakayd.com/dashboard/profile" class="btn">Complete Profile</a>
    </center>
    
    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
      Have questions? Our AI assistant Kayd is available 24/7, or reach out to our support team.
    </p>
  `;
}

function passwordResetTemplate(data: Record<string, unknown>): string {
  return `
    <h2>Reset Your Password 🔐</h2>
    <p>Hello,</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    
    <center>
      <a href="${data.resetLink}" class="btn">Reset Password</a>
    </center>
    
    <div class="warning-box">
      ⚠️ This link will expire in 1 hour. If you didn't request this, please ignore this email.
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${data.resetLink}" style="color: #0d9488; word-break: break-all;">${data.resetLink}</a>
    </p>
  `;
}

function verificationApprovedTemplate(data: Record<string, unknown>): string {
  return `
    <h2>You're Verified! ✅</h2>
    <p>Hello <strong>${data.userName}</strong>,</p>
    <p>Congratulations! Your ${data.verificationType} verification has been approved.</p>
    
    <div class="success-box">
      🏆 You now have a verified badge on your profile, which helps build trust with other users.
    </div>

    <p>Verified users enjoy:</p>
    <ul>
      <li>Higher visibility in search results</li>
      <li>Increased booking approval rates</li>
      <li>Access to premium equipment listings</li>
    </ul>
    
    <center>
      <a href="https://islakayd.com/dashboard" class="btn">View Your Profile</a>
    </center>
  `;
}
