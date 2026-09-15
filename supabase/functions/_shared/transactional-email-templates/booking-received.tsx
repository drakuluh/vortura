/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import { Body, Container, Head, Heading, Html, Link, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { BrandHeader, BrandFooter, styles } from '../email-templates/_brand.tsx'

// Sent to whoever books a call on the website, right after booking.

interface BookingReceivedProps {
  name?: string
  when?: string
  siteUrl?: string
}

const BookingReceivedEmail = ({ name, when, siteUrl = 'https://vortura.ai' }: BookingReceivedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{when ? `Your call request for ${when}` : 'We got your call request'}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Text style={styles.monoLabel}>// Call requested</Text>
        <Heading style={styles.h1}>{name ? `Thanks, ${name}.` : 'Thanks for booking.'}</Heading>
        <Text style={styles.text}>
          We've got your request for a call on{' '}
          <strong style={{ color: '#F8FAFC' }}>{when ?? 'the time you picked'}</strong>. We'll confirm the time
          and send you the call details shortly.
        </Text>
        <Text style={styles.text}>
          Need a different time? Reply through the{' '}
          <Link href={`${siteUrl}/contact`} style={styles.link}>contact page</Link> or email support@vortura.ai.
        </Text>
        <BrandFooter siteUrl={siteUrl} />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingReceivedEmail,
  subject: 'We got your call request',
  displayName: 'Booking received',
  previewData: { name: 'Maria', when: 'Tuesday, September 22 at 10:30 AM EDT' },
} satisfies import('./registry.ts').TemplateEntry
