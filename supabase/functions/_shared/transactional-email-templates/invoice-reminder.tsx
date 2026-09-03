/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import { BrandHeader, BrandFooter, styles } from '../email-templates/_brand.tsx'

interface InvoiceReminderProps {
  siteName?: string
  siteUrl?: string
  recipient?: string
  clientName?: string
  invoiceNumber?: string
  invoiceTitle?: string
  amount?: string
  dueDate?: string
  hostedUrl?: string
}

const InvoiceReminderEmail = ({
  siteName = 'VORTURA',
  siteUrl = 'https://vortura.ai',
  recipient,
  clientName,
  invoiceNumber,
  invoiceTitle,
  amount,
  dueDate,
  hostedUrl,
}: InvoiceReminderProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {`Reminder: ${invoiceNumber ?? 'Invoice'} for ${amount ?? ''} is ${dueDate ? `due on ${dueDate}` : 'outstanding'}`}
    </Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Text style={styles.monoLabel}>// Payment reminder</Text>
        <Heading style={styles.h1}>
          {clientName ? `Hi ${clientName},` : 'Hello,'}
        </Heading>
        <Text style={styles.text}>
          This is a friendly reminder that{' '}
          <strong style={{ color: '#F8FAFC' }}>{invoiceNumber ?? 'an invoice'}</strong>
          {' '}{invoiceTitle ? `(${invoiceTitle})` : ''} {amount ? `for ${amount}` : ''} is still outstanding
          {dueDate ? ` and due on ${dueDate}` : ''}.
        </Text>
        <Text style={styles.text}>
          If you have already submitted payment, please disregard this message. Otherwise, you can view and pay the invoice using the link below.
        </Text>
        {hostedUrl && (
          <Button style={styles.button} href={hostedUrl}>
            View & pay invoice →
          </Button>
        )}
        <Text style={styles.smallNote}>
          Questions? Reply to this email or reach out via your{' '}
          <Link href={siteUrl} style={styles.link}>client portal</Link>.
        </Text>
        <BrandFooter siteUrl={siteUrl} />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: InvoiceReminderEmail,
  subject: (data: Record<string, any>) =>
    `Reminder: ${data.invoiceNumber ?? 'Invoice'} is outstanding`,
  displayName: 'Invoice reminder',
  previewData: {
    siteName: 'VORTURA',
    siteUrl: 'https://vortura.ai',
    recipient: 'jane@example.com',
    clientName: 'Jane',
    invoiceNumber: 'INV-2026-0001',
    invoiceTitle: 'Custom integration work',
    amount: '$1,250.00',
    dueDate: 'May 30, 2026',
    hostedUrl: 'https://vortura.ai',
  },
} satisfies import('./registry.ts').TemplateEntry
