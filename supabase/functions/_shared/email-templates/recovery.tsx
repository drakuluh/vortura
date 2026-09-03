/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import { BrandHeader, BrandFooter, styles } from './_brand.tsx'

interface RecoveryEmailProps {
  siteName: string
  siteUrl?: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your VORTURA password</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Text style={styles.monoLabel}>// Password reset</Text>
        <Heading style={styles.h1}>Reset your password.</Heading>
        <Text style={styles.text}>
          We received a request to reset the password for your {siteName} account.
          Click below to choose a new one.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>
          Reset password →
        </Button>
        <Text style={styles.smallNote}>
          If you didn't request this, you can safely ignore this email — your
          password will not be changed.
        </Text>
        <BrandFooter siteUrl={siteUrl} />
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
