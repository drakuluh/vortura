/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import { Body, Button, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { BrandHeader, BrandFooter, styles } from '../email-templates/_brand.tsx'

// Internal alert to the team inbox (support_email). Used by notifyTeam() for
// every event it reports: new inquiries, bookings, client messages, and so on.

interface TeamNotificationProps {
  subject?: string
  body?: string
  url?: string
  siteUrl?: string
}

const TeamNotificationEmail = ({ subject = 'New activity', body = '', url, siteUrl = 'https://vortura.ai' }: TeamNotificationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{subject}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Text style={styles.monoLabel}>// Team notification</Text>
        <Heading style={styles.h1}>{subject}</Heading>
        {body.split('\n').map((line, i) => (
          <Text key={i} style={{ ...styles.text, margin: line ? '0 0 6px' : '0 0 14px', whiteSpace: 'pre-wrap' }}>
            {line || ' '}
          </Text>
        ))}
        {url && (
          <Button style={{ ...styles.button, marginTop: '18px' }} href={url}>
            Open in control room →
          </Button>
        )}
        <BrandFooter siteUrl={siteUrl} />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TeamNotificationEmail,
  subject: (data: Record<string, any>) => `[Vortura] ${data.subject ?? 'New activity'}`,
  displayName: 'Team notification',
  previewData: {
    subject: 'New inquiry from Maria Santos',
    body: 'Company: Santos Plumbing\nEmail: maria@santosplumbing.com\n\nWe miss a lot of calls when the crew is on site. Can you help?',
    url: 'https://vortura.ai/admin/inquiries',
  },
} satisfies import('./registry.ts').TemplateEntry
