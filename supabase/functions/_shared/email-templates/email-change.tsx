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
import { BrandHeader, BrandFooter, styles } from './_brand.tsx'

interface EmailChangeEmailProps {
  siteName: string
  siteUrl?: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  siteUrl,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your new email address for {siteName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Text style={styles.monoLabel}>// Email change</Text>
        <Heading style={styles.h1}>Confirm your email change.</Heading>
        <Text style={styles.text}>
          You requested to change your {siteName} email from{' '}
          <Link href={`mailto:${email}`} style={styles.link}>
            {email}
          </Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={styles.link}>
            {newEmail}
          </Link>
          . Confirm the change to finalize.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>
          Confirm email change →
        </Button>
        <Text style={styles.smallNote}>
          If you didn't request this change, please secure your account
          immediately.
        </Text>
        <BrandFooter siteUrl={siteUrl} />
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
