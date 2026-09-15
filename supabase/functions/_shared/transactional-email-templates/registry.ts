/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as invoiceReminder } from './invoice-reminder.tsx'
import { template as teamNotification } from './team-notification.tsx'
import { template as teamReply } from './team-reply.tsx'
import { template as bookingReceived } from './booking-received.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'invoice-reminder': invoiceReminder,
  'team-notification': teamNotification,
  'team-reply': teamReply,
  'booking-received': bookingReceived,
}
