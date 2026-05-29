import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Beaver Boat Club'

interface ContactProps {
  name?: string
  message?: string
  kind?: string
}

const BeaverBoatContactEmail = ({ name, message, kind }: ContactProps) => {
  const label = kind || 'Contact'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Thanks for reaching out to {SITE_NAME}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {name ? `Thanks, ${name}!` : 'Thanks for reaching out!'}
          </Heading>
          <Text style={text}>
            We received your {label.toLowerCase()} message at {SITE_NAME} and
            will get back to you soon with practice times and next steps.
          </Text>
          {message && (
            <Section style={quoteBox}>
              <Text style={quoteLabel}>Your message</Text>
              <Text style={quoteText}>{message}</Text>
            </Section>
          )}
          <Text style={text}>
            In the meantime, no experience is necessary — just bring water,
            sunscreen, and energy. We coach all levels.
          </Text>
          <Text style={footer}>— The {SITE_NAME} Crew</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: BeaverBoatContactEmail,
  subject: (data: Record<string, any>) =>
    data?.kind === 'Join'
      ? 'Welcome to the Beaver Boat Club crew'
      : 'We received your message — Beaver Boat Club',
  displayName: 'Beaver Boat contact confirmation',
  previewData: {
    name: 'Jane',
    message: 'I would love to join a practice!',
    kind: 'Join',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
}
const container = { padding: '28px 24px', maxWidth: '560px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 800,
  color: '#0a0a0a',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: '#3a3a3a',
  lineHeight: '1.6',
  margin: '0 0 18px',
}
const quoteBox = {
  borderLeft: '3px solid #A31F34',
  backgroundColor: '#fafafa',
  padding: '12px 16px',
  margin: '0 0 18px',
  borderRadius: '6px',
}
const quoteLabel = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#A31F34',
  margin: '0 0 6px',
}
const quoteText = {
  fontSize: '14px',
  color: '#1a1a1a',
  lineHeight: '1.5',
  margin: 0,
  whiteSpace: 'pre-wrap' as const,
}
const footer = {
  fontSize: '13px',
  color: '#777777',
  margin: '24px 0 0',
}
