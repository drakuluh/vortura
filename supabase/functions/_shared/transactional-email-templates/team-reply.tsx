/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

import { Body, Button, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import { BrandHeader, BrandFooter, styles } from '../email-templates/_brand.tsx'

// Sent to a client when the team replies to their conversation, so they
// don't have to keep checking the site.

interface TeamReplyProps {
  name?: string
  snippet?: string
  url?: string
  siteUrl?: string
}

const TeamReplyEmail = ({ name, snippet = '', url = 'https://vortura.ai/contact', siteUrl = 'https://vortura.ai' }: TeamReplyProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{snippet ? `The Vortura team replied: ${snippet.slice(0, 90)}` : 'The Vortura team replied to your message'}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Text style={styles.monoLabel}>// New reply</Text>
        <Heading style={styles.h1}>{name ? `Hi ${name},` : 'Hello,'}</Heading>
        <Text style={styles.text}>The Vortura team replied to your message:</Text>
        {snippet && (
          <Text
            style={{
              ...styles.text,
              color: '#F8FAFC',
              borderLeft: '3px solid #1AB3FF',
              paddingLeft: '14px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {snippet}
          </Text>
        )}
        <Button style={styles.button} href={url}>
          Read and reply →
        </Button>
        <Text style={styles.smallNote}>
          Replies to this email aren't monitored. Sign in to answer in your conversation.
        </Text>
        <BrandFooter siteUrl={siteUrl} />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TeamReplyEmail,
  subject: 'The Vortura team replied to your message',
  displayName: 'Team reply',
  previewData: {
    name: 'Maria',
    snippet: "Yes, we can have the call answering live before your busy season. Want to book 20 minutes this week to go over your call flow?",
    url: 'https://vortura.ai/contact',
  },
} satisfies import('./registry.ts').TemplateEntry
