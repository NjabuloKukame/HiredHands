// ============================================================
// FILE: src/app/lib/email.js
//
// We render email templates to HTML ourselves using
// @react-email/render, then pass the HTML string to Resend.
// This bypasses the broken `react` option in Resend when
// running inside Next.js App Router.
// ============================================================

import { Resend } from 'resend';
import { render } from '@react-email/render';
import React from 'react';
import { BookingConfirmationEmail } from '@/app/emails/BookingConfirmationEmail';
import { ProviderBookingAlertEmail } from '@/app/emails/ProviderBookingAlertEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `${process.env.FROM_NAME ?? 'Hired Hands'} <${process.env.FROM_EMAIL ?? 'onboarding@resend.dev'}>`;

export async function sendBookingConfirmation(params) {
  try {
    const html = await render(React.createElement(BookingConfirmationEmail, params));

    const { data, error } = await resend.emails.send({
      from:    FROM,
      to:      params.customerEmail,
      subject: `Booking Confirmed — ${params.serviceName} on ${params.date}`,
      html,
    });

    if (error) {
      console.error('[email] sendBookingConfirmation error:', error);
      return { success: false, error };
    }

    console.log(`[email] ✓ Confirmation sent to ${params.customerEmail} — id: ${data?.id}`);
    return { success: true, data };

  } catch (err) {
    console.error('[email] sendBookingConfirmation exception:', err);
    return { success: false, error: err };
  }
}

export async function sendProviderBookingAlert(params) {
  try {
    const html = await render(React.createElement(ProviderBookingAlertEmail, params));

    const { data, error } = await resend.emails.send({
      from:    FROM,
      to:      params.providerEmail,
      subject: `New Booking — ${params.customerName} booked ${params.serviceName}`,
      html,
    });

    if (error) {
      console.error('[email] sendProviderBookingAlert error:', error);
      return { success: false, error };
    }

    console.log(`[email] ✓ Alert sent to ${params.providerEmail} — id: ${data?.id}`);
    return { success: true, data };

  } catch (err) {
    console.error('[email] sendProviderBookingAlert exception:', err);
    return { success: false, error: err };
  }
}