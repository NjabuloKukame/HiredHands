// ============================================================
// FILE: src/emails/ProviderBookingAlertEmail.jsx
//
// Sent to the provider when a customer confirms a booking.
// Includes full customer details so the provider knows who
// is coming, what was booked, and when to expect payment.
// ============================================================

import * as React from 'react';
import {
  Html, Head, Preview, Body, Container,
  Section, Row, Column, Heading, Text,
  Hr, Link,
} from '@react-email/components';

function fmtMoney(amount) {
  return `R${Number(amount).toFixed(2)}`;
}

export function ProviderBookingAlertEmail({
  bookingId,
  providerName,
  customerName,
  customerEmail,
  customerPhone,
  serviceName,
  date,
  time,
  subtotal,
  paymentType,
  notes,
}) {
  const ref = bookingId?.slice(-8).toUpperCase() ?? '';

  return (
    <Html lang="en">
      <Head />
      <Preview>New booking from {customerName} — {serviceName} on {date}</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.logo}>⚡ HIRED HANDS</Heading>
          </Section>

          {/* Hero */}
          <Section style={styles.hero}>
            <Text style={styles.heroIcon}>📅</Text>
            <Heading as="h1" style={styles.heroTitle}>New Booking!</Heading>
            <Text style={styles.heroSub}>
              Hi {providerName}, you have a new confirmed booking.
            </Text>
          </Section>

          {/* Customer details */}
          <Section style={styles.card}>
            <Heading as="h2" style={styles.cardTitle}>Customer Details</Heading>
            <Hr style={styles.divider} />

            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Name</Column>
              <Column style={styles.detailValue}>{customerName}</Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Phone</Column>
              <Column style={styles.detailValue}>
                <Link href={`tel:${customerPhone}`} style={styles.phoneLink}>
                  {customerPhone}
                </Link>
              </Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Email</Column>
              <Column style={styles.detailValue}>
                <Link href={`mailto:${customerEmail}`} style={styles.phoneLink}>
                  {customerEmail}
                </Link>
              </Column>
            </Row>
          </Section>

          {/* Booking details */}
          <Section style={styles.card}>
            <Heading as="h2" style={styles.cardTitle}>Booking Details</Heading>
            <Hr style={styles.divider} />

            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Service</Column>
              <Column style={styles.detailValue}>{serviceName}</Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Date</Column>
              <Column style={styles.detailValue}>{date}</Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Time</Column>
              <Column style={styles.detailValue}>{time}</Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Payment</Column>
              <Column style={styles.detailValue}>
                {paymentType === 'full' ? 'Full payment made' : 'Booking fee paid'}
              </Column>
            </Row>

            {notes && (
              <>
                <Hr style={styles.divider} />
                <Text style={styles.notesLabel}>Customer Notes</Text>
                <Text style={styles.notesText}>{notes}</Text>
              </>
            )}
          </Section>

          {/* Earnings info box */}
          <Section style={styles.earningsBox}>
            <Text style={styles.earningsTitle}>💰 Your Earnings</Text>
            <Text style={styles.earningsAmount}>{fmtMoney(subtotal)}</Text>
            <Text style={styles.earningsText}>
              This amount will be transferred to your bank account automatically
              once the customer verifies your PIN on the day of the appointment.
            </Text>
          </Section>

          {/* PIN reminder */}
          <Section style={styles.infoBox}>
            <Text style={styles.infoTitle}>🔑 Remember to generate your PIN</Text>
            <Text style={styles.infoText}>
              On the day of the appointment, open your Hired Hands provider dashboard
              and generate a PIN for this booking. Show it to the customer when you arrive —
              they will enter it to confirm the service has started and release your payment.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={styles.ctaSection}>
            <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/provider-dashboard`} style={styles.cta}>
              View My Bookings
            </Link>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerRef}>Booking Ref: {ref}</Text>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Hired Hands · South Africa
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
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
    width: '40%',
  },
  detailValue: {
    fontSize: '14px',
    color: '#18181b',
    fontWeight: '600',
    textAlign: 'right',
  },
  phoneLink: {
    color: '#18181b',
    textDecoration: 'none',
    fontWeight: '600',
  },
  notesLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 6px 0',
  },
  notesText: {
    fontSize: '14px',
    color: '#3f3f46',
    lineHeight: '1.6',
    margin: '0',
    fontStyle: 'italic',
  },
  earningsBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  earningsTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#15803d',
    margin: '0 0 4px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  earningsAmount: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#15803d',
    margin: '0 0 8px 0',
    letterSpacing: '-1px',
  },
  earningsText: {
    fontSize: '13px',
    color: '#166534',
    lineHeight: '1.5',
    margin: '0',
  },
  infoBox: {
    backgroundColor: '#fefce8',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  },
  infoTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#92400e',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoText: {
    fontSize: '13px',
    color: '#78350f',
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
};

export default ProviderBookingAlertEmail;