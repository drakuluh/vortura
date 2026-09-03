/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Img, Section, Text, Link, Row, Column } from 'npm:@react-email/components@0.0.22'

// Vortura brand tokens — dark theme matching the site
// background: hsl(230 25% 4%) ≈ #07090F (near-black blue)
// card:       hsl(230 25% 6%) ≈ #0B0E17
// primary:    hsl(200 100% 55%) ≈ #1AAEFF
// secondary:  hsl(280 100% 65%) ≈ #B84DFF
// foreground: hsl(210 40% 98%) ≈ #F8FAFC
// muted-fg:   hsl(215 20% 65%) ≈ #94A3B8
// border:     hsl(230 25% 15%) ≈ #1D2335

export const BRAND = {
  name: 'VORTURA',
  primary: '#1AAEFF',
  secondary: '#B84DFF',
  gradient: 'linear-gradient(135deg, #1AAEFF 0%, #B84DFF 100%)',
  foreground: '#F8FAFC',
  muted: '#94A3B8',
  border: '#1D2335',
  bg: '#07090F',
  surface: '#0B0E17',
  logoUrl: 'https://sckvyofhssgjlsefjoik.supabase.co/storage/v1/object/public/email-assets/vortura-logo.png',
  wordmarkUrl: 'https://sckvyofhssgjlsefjoik.supabase.co/storage/v1/object/public/email-assets/vortura-wordmark.png',
  iconUrl: 'https://sckvyofhssgjlsefjoik.supabase.co/storage/v1/object/public/email-assets/vortura-icon.png',
}

export const BrandHeader = () => (
  <Section style={headerSection}>
    <Row style={headerRow}>
      <Column style={headerIconCol}>
        <Img
          src={BRAND.iconUrl}
          alt="VORTURA"
          width="36"
          height="36"
          style={iconImg}
        />
      </Column>
      <Column style={headerWordmarkCol}>
        <Img
          src={BRAND.wordmarkUrl}
          alt="VORTURA.ai"
          width="140"
          height="36"
          style={wordmarkImg}
        />
      </Column>
    </Row>
  </Section>
)

export const BrandFooter = ({ siteUrl }: { siteUrl?: string }) => (
  <Section style={footerSection}>
    <Text style={footerText}>
      VORTURA — AI automation that ships.
    </Text>
    {siteUrl ? (
      <Text style={footerText}>
        <Link href={siteUrl} style={footerLink}>vortura.ai</Link>
      </Text>
    ) : null}
  </Section>
)

const headerSection = {
  padding: '32px 0 24px',
  textAlign: 'center' as const,
  borderBottom: `1px solid ${BRAND.border}`,
  marginBottom: '32px',
}
const headerRow = {
  width: 'auto' as const,
  margin: '0 auto',
}
const headerIconCol = {
  width: '44px',
  verticalAlign: 'middle' as const,
  paddingRight: '10px',
}
const headerWordmarkCol = {
  verticalAlign: 'middle' as const,
  textAlign: 'left' as const,
}
const iconImg = {
  display: 'block',
  width: '36px',
  height: '36px',
  borderRadius: '8px',
}
const wordmarkImg = {
  display: 'block',
  height: 'auto' as const,
  maxWidth: '160px',
}
const footerSection = {
  marginTop: '40px',
  paddingTop: '24px',
  borderTop: `1px solid ${BRAND.border}`,
  textAlign: 'center' as const,
}
const footerText = {
  fontSize: '11px',
  color: BRAND.muted,
  margin: '4px 0',
  fontFamily: "'Inter', Arial, sans-serif",
  letterSpacing: '0.02em',
}
const footerLink = {
  color: BRAND.primary,
  textDecoration: 'none',
  fontWeight: 600,
}

// Shared style tokens for templates
export const styles = {
  main: {
    backgroundColor: BRAND.bg,
    color: BRAND.foreground,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '0 32px 32px',
    backgroundColor: BRAND.bg,
    color: BRAND.foreground,
  },
  h1: {
    fontSize: '26px',
    fontWeight: 700 as const,
    color: BRAND.foreground,
    margin: '0 0 16px',
    letterSpacing: '-0.02em',
    lineHeight: '1.2',
  },
  text: {
    fontSize: '15px',
    color: BRAND.muted,
    lineHeight: '1.6',
    margin: '0 0 24px',
  },
  link: {
    color: BRAND.primary,
    textDecoration: 'none',
    fontWeight: 500 as const,
  },
  button: {
    background: BRAND.gradient,
    backgroundColor: BRAND.primary, // fallback for clients that strip gradients
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600 as const,
    borderRadius: '14px',
    padding: '14px 28px',
    textDecoration: 'none',
    display: 'inline-block',
    letterSpacing: '0.01em',
  },
  code: {
    fontFamily: "'JetBrains Mono', 'SF Mono', Courier, monospace",
    fontSize: '32px',
    fontWeight: 700 as const,
    color: BRAND.foreground,
    background: BRAND.surface,
    border: `1px solid ${BRAND.border}`,
    borderRadius: '12px',
    padding: '20px 24px',
    margin: '0 0 28px',
    textAlign: 'center' as const,
    letterSpacing: '0.3em',
    display: 'block',
  },
  smallNote: {
    fontSize: '12px',
    color: BRAND.muted,
    margin: '24px 0 0',
    lineHeight: '1.5',
  },
  monoLabel: {
    fontFamily: "'JetBrains Mono', 'SF Mono', Courier, monospace",
    fontSize: '10px',
    color: BRAND.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    margin: '0 0 12px',
    fontWeight: 600 as const,
  },
}