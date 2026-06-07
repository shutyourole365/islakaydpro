/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';

export interface MessageTemplate {
  id: string;
  ownerId: string;
  name: string;
  subject: string;
  content: string;
  type: 'booking' | 'cancellation' | 'reminder' | 'custom';
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledMessage {
  id: string;
  ownerId: string;
  templateId: string;
  recipientIds: string[];
  scheduledAt: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
}

export async function createMessageTemplate(
  ownerId: string,
  data: Omit<MessageTemplate, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
): Promise<MessageTemplate> {
  const { data: template, error } = await supabase
    .from('message_templates')
    .insert([{ ...data, owner_id: ownerId }])
    .select()
    .single();

  if (error) throw error;
  return template as MessageTemplate;
}

export async function getMessageTemplates(ownerId: string): Promise<MessageTemplate[]> {
  const { data, error } = await supabase
    .from('message_templates')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as MessageTemplate[];
}

export async function updateMessageTemplate(
  id: string,
  data: Partial<MessageTemplate>
): Promise<MessageTemplate> {
  const { data: template, error } = await supabase
    .from('message_templates')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return template as MessageTemplate;
}

export async function deleteMessageTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('message_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function scheduleMessage(
  ownerId: string,
  data: Omit<ScheduledMessage, 'id' | 'ownerId' | 'createdAt'>
): Promise<ScheduledMessage> {
  const { data: message, error } = await supabase
    .from('scheduled_messages')
    .insert([{ ...data, owner_id: ownerId }])
    .select()
    .single();

  if (error) throw error;
  return message as ScheduledMessage;
}

export async function getScheduledMessages(ownerId: string): Promise<ScheduledMessage[]> {
  const { data, error } = await supabase
    .from('scheduled_messages')
    .select('*')
    .eq('owner_id', ownerId)
    .order('scheduled_at', { ascending: true });

  if (error) throw error;
  return data as ScheduledMessage[];
}

export async function sendBulkMessage(
  ownerId: string,
  templateId: string,
  recipientIds: string[],
  variables: Record<string, string> = {}
): Promise<{ success: number; failed: number }> {
  const template = await supabase
    .from('message_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (template.error) throw template.error;

  let content = template.data.content;
  Object.entries(variables).forEach(([key, value]) => {
    content = content.replace(`{{${key}}}`, value);
  });

  let success = 0;
  let failed = 0;

  for (const recipientId of recipientIds) {
    try {
      await supabase
        .from('messages')
        .insert([
          {
            sender_id: ownerId,
            recipient_id: recipientId,
            subject: template.data.subject,
            content,
            read: false,
          },
        ]);
      success += 1;
    } catch {
      failed += 1;
    }
  }

  return { success, failed };
}

export async function renderTemplate(
  template: MessageTemplate,
  variables: Record<string, string>
): Promise<{ subject: string; content: string }> {
  let subject = template.subject;
  let content = template.content;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, value);
    content = content.replace(regex, value);
  });

  return { subject, content };
}

export const defaultTemplates = [
  {
    name: 'Booking Confirmation',
    subject: 'Your {{equipment_name}} rental is confirmed!',
    content: `Hello {{renter_name}},

Your booking for {{equipment_name}} has been confirmed!

Rental Details:
- Equipment: {{equipment_name}}
- Start Date: {{start_date}}
- End Date: {{end_date}}
- Total: {{total_price}}

Thank you for your business!`,
    type: 'booking' as const,
  },
  {
    name: 'Rental Reminder',
    subject: 'Reminder: Your {{equipment_name}} rental starts tomorrow',
    content: `Hi {{renter_name}},

This is a friendly reminder that your {{equipment_name}} rental starts tomorrow ({{start_date}}).

Please make sure you're ready for pickup. Contact us if you have any questions.

Best regards`,
    type: 'reminder' as const,
  },
  {
    name: 'Cancellation Notice',
    subject: 'Your {{equipment_name}} rental has been cancelled',
    content: `Hello {{renter_name}},

Your booking for {{equipment_name}} ({{booking_id}}) has been cancelled.

A refund of {{refund_amount}} will be processed within 3-5 business days.

Sorry to see you go!`,
    type: 'cancellation' as const,
  },
];
