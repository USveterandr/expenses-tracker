import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

declare global {
  interface GlobalThisWithProcess {
    process?: {
      env?: Record<string, string | undefined>;
    };
  }
}

// Brevo API endpoint for sending transactional emails
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, htmlContent, userId } = await request.json();

    // Validate required fields
    if (!to || !subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, htmlContent' },
        { status: 400 }
      );
    }

    // Get Brevo API key from environment
    const globalWithProcess = globalThis as GlobalThisWithProcess;
    const brevoApiKey = globalWithProcess.process?.env?.BREVO_API_KEY || 
                        (typeof process !== 'undefined' ? process.env?.BREVO_API_KEY : undefined);

    if (!brevoApiKey) {
      console.error('BREVO_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Prepare email payload
    const emailPayload = {
      sender: {
        name: 'ExpenseFlow',
        email: 'noreply@expensetracker.isaac-trinidad.com'
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent,
      tags: ['expenseflow', 'auth', userId ? `user_${userId}` : 'signup']
    };

    // Send email via Brevo API
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send email', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      messageId: data.messageId,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}