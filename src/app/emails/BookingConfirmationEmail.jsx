// ============================================================
// FILE: src/emails/BookingConfirmationEmail.jsx
//
// Sent to the customer after their booking is confirmed + paid.
// Uses @react-email/components — rendered to HTML by Resend.
// ============================================================

import * as React from 'react';
import {
  Html, Head, Preview, Body, Container,
  Section, Row, Column, Heading, Text,
  Hr, Link, Img,
} from '@react-email/components';

function fmtMoney(amount) {
  return `R${Number(amount).toFixed(2)}`;
}

export function BookingConfirmationEmail({
  bookingId,
  customerName,
  serviceName,
  providerName,
  date,
  time,
  subtotal,
  platformFee,
  totalCharged,
  paymentType,
}) {
  const ref = bookingId?.slice(-8).toUpperCase() ?? '';

  return (
    <Html lang="en">
      <Head />
      <Preview>Your booking for {serviceName} on {date} is confirmed!</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.logo}>⚡ HIRED HANDS</Heading>
          </Section>

          {/* Hero */}
          <Section style={styles.hero}>
            <Text style={styles.heroIcon}>✓</Text>
            <Heading as="h1" style={styles.heroTitle}>Booking Confirmed!</Heading>
            <Text style={styles.heroSub}>
              Hi {customerName}, your booking is confirmed and your payment is secured.
            </Text>
          </Section>

          {/* Booking details card */}
          <Section style={styles.card}>
            <Heading as="h2" style={styles.cardTitle}>Booking Details</Heading>
            <Hr style={styles.divider} />

            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Service</Column>
              <Column style={styles.detailValue}>{serviceName}</Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Provider</Column>
              <Column style={styles.detailValue}>{providerName}</Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Date</Column>
              <Column style={styles.detailValue}>{date}</Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Time</Column>
              <Column style={styles.detailValue}>{time}</Column>
            </Row>

            <Hr style={styles.divider} />

            {/* Payment breakdown */}
            <Heading as="h3" style={styles.breakdownTitle}>Payment Breakdown</Heading>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>
                {paymentType === 'full' ? 'Service + booking fee' : 'Booking fee'}
              </Column>
              <Column style={styles.detailValue}>{fmtMoney(subtotal)}</Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Platform fee (8%)</Column>
              <Column style={styles.detailValue}>{fmtMoney(platformFee)}</Column>
            </Row>

            <Hr style={styles.divider} />

            <Row style={styles.detailRow}>
              <Column style={{ ...styles.detailLabel, fontWeight: '700', color: '#000' }}>
                Total Paid
              </Column>
              <Column style={{ ...styles.detailValue, fontWeight: '700', fontSize: '18px', color: '#000' }}>
                {fmtMoney(totalCharged)}
              </Column>
            </Row>
          </Section>

          {/* PIN info box */}
          <Section style={styles.infoBox}>
            <Text style={styles.infoTitle}>🔒 What happens next?</Text>
            <Text style={styles.infoText}>
              Your payment is held securely until the day of your appointment.
              When your provider arrives, they will show you a <strong>verification PIN</strong>.
              Enter it in the Hired Hands app to confirm the service has started —
              your provider only gets paid once you verify their PIN.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={styles.ctaSection}>
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/customer-dashboard`} style={styles.cta}>
              View My Bookings
            </Link>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerRef}>Booking Ref: {ref}</Text>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Hired Hands · South Africa
            </Text>
            <Text style={styles.footerText}>
              Questions? Reply to this email or visit our{' '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}`} style={styles.footerLink}>
                help centre
              </Link>.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
// React Email renders inline styles — no Tailwind in email templates
const styles = {
  body: {
    backgroundColor: '#f4f4f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: '0',
    padding: '0',
  },
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '24px 16px',
  },
  header: {
    textAlign: 'center',
    paddingBottom: '8px',
  },
  logo: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#000',
    letterSpacing: '-0.5px',
    margin: '0',
  },
  hero: {
    backgroundColor: '#000',
    borderRadius: '16px',
    padding: '40px 32px',
    textAlign: 'center',
    marginBottom: '16px',
  },
  heroIcon: {
    fontSize: '40px',
    color: '#10b981',
    margin: '0 0 8px 0',
    display: 'block',
  },
  heroTitle: {
    color: '#fff',
    fontSize: '28px',
    fontWeight: '900',
    margin: '0 0 12px 0',
    letterSpacing: '-0.5px',
  },
  heroSub: {
    color: '#a1a1aa',
    fontSize: '15px',
    margin: '0',
    lineHeight: '1.5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: '0 0 12px 0',
  },
  breakdownTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: '12px 0 8px 0',
  },
  divider: {
    borderColor: '#f4f4f5',
    margin: '12px 0',
  },
  detailRow: {
    marginBottom: '8px',
  },
  detailLabel: {
    fontSize: '14px',
    color: '#71717a',
    width: '50%',
  },
  detailValue: {
    fontSize: '14px',
    color: '#18181b',
    fontWeight: '600',
    textAlign: 'right',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  },
  infoTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1d4ed8',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoText: {
    fontSize: '13px',
    color: '#1e40af',
    lineHeight: '1.6',
    margin: '0',
  },
  ctaSection: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  cta: {
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: '12px',
    padding: '14px 32px',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    display: 'inline-block',
  },
  footer: {
    textAlign: 'center',
    paddingTop: '8px',
  },
  footerRef: {
    fontSize: '11px',
    color: '#a1a1aa',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    margin: '0 0 8px 0',
  },
  footerText: {
    fontSize: '12px',
    color: '#a1a1aa',
    margin: '0 0 4px 0',
    lineHeight: '1.5',
  },
  footerLink: {
    color: '#a1a1aa',
  },
};

export default BookingConfirmationEmail;