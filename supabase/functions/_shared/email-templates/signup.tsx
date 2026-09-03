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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email to activate your VORTURA workspace</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <BrandHeader />
        <Text style={styles.monoLabel}>// Verify your account</Text>
        <Heading style={styles.h1}>Welcome aboard.</Heading>
        <Text style={styles.text}>
          Thanks for signing up. Confirm your email address (
          <Link href={`mailto:${recipient}`} style={styles.link}>
            {recipient}
          </Link>
          ) to activate your workspace and start automating.
        </Text>
        <Button style={styles.button} href={confirmationUrl}>
          Verify email →
        </Button>
        <Text style={styles.smallNote}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
        <BrandFooter siteUrl={siteUrl} />
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
