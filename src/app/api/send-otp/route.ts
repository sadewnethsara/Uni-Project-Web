import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { recipient, otp } = await request.json();

    if (!recipient || !otp) {
      return NextResponse.json(
        { error: 'Recipient and OTP are required fields.' },
        { status: 400 }
      );
    }

    // Normalize Sri Lankan phone number (e.g. 0771234567 -> 94771234567)
    let formattedNumber = recipient.replace(/\D/g, '');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '94' + formattedNumber.substring(1);
    } else if (!formattedNumber.startsWith('94') && formattedNumber.length === 9) {
      formattedNumber = '94' + formattedNumber;
    }

    const apiToken = process.env.TEXT_LK_API_TOKEN;
    if (!apiToken) {
      console.error('TEXT_LK_API_TOKEN environment variable is not defined.');
      return NextResponse.json(
        { error: 'SMS Gateway is not configured.' },
        { status: 500 }
      );
    }

    const payload = {
      recipient: formattedNumber,
      sender_id: 'TextLKDemo',
      type: 'plain',
      message: `Your AgriLanka OTP verification code is ${otp}. Valid for 5 minutes.`,
    };

    const response = await fetch('https://app.text.lk/api/v3/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Text.lk API Error response:', responseData);
      return NextResponse.json(
        { error: 'Failed to send SMS OTP.' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Send OTP Handler Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
