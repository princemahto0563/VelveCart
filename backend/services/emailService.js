const nodemailer = require('nodemailer');

// ─── Transporter ──────────────────────────────────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

// ─── HTML Templates ───────────────────────────────────────────────────────────
const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VelvetCart</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'DM Sans',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <!-- Header -->
        <tr>
          <td style="background:#0a0a0a;padding:24px 32px;text-align:center;border-radius:8px 8px 0 0">
            <p style="margin:0;font-family:Georgia,serif;font-size:22px;letter-spacing:0.1em;color:#c9a96e">VelvetCart</p>
            <p style="margin:4px 0 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(201,169,110,0.5)">Luxury Reimagined</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px 32px;border-radius:0 0 8px 8px">
            ${content}
            <hr style="border:none;border-top:1px solid #f0ebe3;margin:32px 0" />
            <p style="margin:0;font-size:12px;color:#8a8580;text-align:center;line-height:1.6">
              © ${new Date().getFullYear()} VelvetCart · All rights reserved<br/>
              <a href="${process.env.FRONTEND_URL}" style="color:#c9a96e;text-decoration:none">velvetcart.store</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const templates = {
  welcome: ({ name }) => baseLayout(`
    <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#0a0a0a">Welcome, ${name} ✦</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7">Your VelvetCart account is ready. Start exploring our curated luxury collection.</p>
    <p style="margin:0 0 32px;font-size:15px;color:#444;line-height:1.7">From handpicked jewellery to premium lifestyle pieces — everything you need to elevate your aesthetic.</p>
    <table cellpadding="0" cellspacing="0"><tr><td style="background:#0a0a0a;border-radius:3px">
      <a href="${process.env.FRONTEND_URL}" style="display:block;padding:14px 32px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#ffffff;text-decoration:none;font-weight:500">Shop the Collection</a>
    </td></tr></table>
  `),

  orderConfirmed: ({ name, orderId, totalPrice, items }) => baseLayout(`
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#c9a96e">Order Confirmed</p>
    <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#0a0a0a">Thank you, ${name}!</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.7">Your order <strong>#${orderId}</strong> has been confirmed and is being prepared.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f4ee;border-radius:6px;margin-bottom:24px">
      <tr><td style="padding:20px 24px">
        ${Array.isArray(items) ? items.map(i => `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
            <tr>
              <td style="font-size:14px;color:#0a0a0a">${i.name} × ${i.quantity}</td>
              <td align="right" style="font-size:14px;color:#0a0a0a;font-family:Georgia,serif">₹${(i.price * i.quantity).toLocaleString('en-IN')}</td>
            </tr>
          </table>`).join('') : ''}
        <hr style="border:none;border-top:1px solid #e8e3da;margin:12px 0"/>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:15px;font-weight:600;color:#0a0a0a">Total</td>
            <td align="right" style="font-family:Georgia,serif;font-size:18px;color:#0a0a0a">₹${Number(totalPrice).toLocaleString('en-IN')}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <table cellpadding="0" cellspacing="0"><tr><td style="background:#0a0a0a;border-radius:3px">
      <a href="${process.env.FRONTEND_URL}/account/orders" style="display:block;padding:14px 32px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#fff;text-decoration:none">Track Order</a>
    </td></tr></table>
  `),

  orderShipped: ({ name, orderId, trackingNumber, trackingUrl }) => baseLayout(`
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#c9a96e">On its way!</p>
    <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#0a0a0a">Your order has shipped, ${name}!</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7">Order <strong>#${orderId}</strong> is on its way to you.</p>
    ${trackingNumber ? `<p style="margin:0 0 24px;font-size:15px;color:#444">Tracking number: <strong>${trackingNumber}</strong></p>` : ''}
    ${trackingUrl ? `<table cellpadding="0" cellspacing="0"><tr><td style="background:#c9a96e;border-radius:3px"><a href="${trackingUrl}" style="display:block;padding:14px 32px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#fff;text-decoration:none">Track Shipment</a></td></tr></table>` : ''}
  `),

  resetPassword: ({ name, resetUrl }) => baseLayout(`
    <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#0a0a0a">Reset Password</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7">Hi ${name}, we received a request to reset your password.</p>
    <p style="margin:0 0 24px;font-size:15px;color:#444">Click below to set a new password. This link expires in 15 minutes.</p>
    <table cellpadding="0" cellspacing="0"><tr><td style="background:#0a0a0a;border-radius:3px">
      <a href="${resetUrl}" style="display:block;padding:14px 32px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#fff;text-decoration:none">Reset My Password</a>
    </td></tr></table>
    <p style="margin:24px 0 0;font-size:13px;color:#8a8580">If you didn't request this, ignore this email. Your password won't change.</p>
  `),
};

// ─── Main sendEmail function ──────────────────────────────────────────────────
const sendEmail = async ({ to, subject, template, data, html }) => {
  try {
    const transporter = createTransporter();

    const htmlContent = html || (templates[template] ? templates[template](data || {}) : '<p>No content</p>');

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'VelvetCart'}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Email send error:', error.message);
    // Non-fatal — don't throw
  }
};

module.exports = { sendEmail };
