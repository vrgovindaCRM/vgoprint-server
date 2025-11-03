const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: "vrgovinda06@gmail.com", 
    pass: "xsfs dadg bzko ycdv",       
  },
});


async function sendVerifyMail(email, verifyToken) {
  const BASE_URL = "https://vgoprint-server.onrender.com";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Verify Your Email</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:0 auto; background:#f5f5f5; }
  .email-container { border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,.1); background:#fff; margin:20px; }
  /* CHANGED: header background to light gray and text to dark for contrast */
  .header { background:#f3f4f6; color:#1a1a1a; padding:30px 20px; text-align:center; }
  .logo { width:180px; height:auto; margin-bottom:15px; display:block; margin-left:auto; margin-right:auto; }
  .content { padding:30px; }
  .button-container { text-align:center; margin:35px 0; }
  .button { display:inline-block; background:linear-gradient(to right,#2980b9,#3498db); color:#fff; text-decoration:none; padding:14px 40px; border-radius:50px; font-weight:bold; font-size:16px; box-shadow:0 4px 8px rgba(52,152,219,.3); transition:all .3s ease; }
  .button:hover { transform:translateY(-2px); box-shadow:0 6px 12px rgba(52,152,219,.4); }
  .footer { background:#2c3e50; color:#ecf0f1; padding:20px; text-align:center; font-size:12px; }
  .divider { height:1px; background:#e0e0e0; margin:25px 0; }
  @media (prefers-color-scheme: dark) {
    body { background:#0b0b0b; color:#e7e7e7; }
    .email-container { background:#121212; }
    .header { background:#1e1e1e; color:#e7e7e7; }
    .divider { background:#2a2a2a; }
  }
</style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://res.cloudinary.com/dekbabkjd/image/upload/v1762149632/logo1_meixqn.png" alt="VGO Print Logo" class="logo" />
      <h2>Verify Your Email Address</h2>
    </div>
    <div class="content">
      <p>Hello there,</p>
      <p>Thank you for joining VGO PRINT!</p>
      <p>Please verify your email:</p>
      <div class="button-container">
        <a href="${BASE_URL}/user/verify/${verifyToken}" class="button">Verify Email</a>
      </div>
      <div class="divider"></div>
      <p style="font-style:italic; color:#7f8c8d; text-align:center;">
        Need help? <a href="mailto:vrgovinda06@gmail.com">vrgovinda06@gmail.com</a>
      </p>
    </div>
    <div class="footer">
      <p>© 2025 VGO Print. All rights reserved.</p>
      <p>B-22, Indira Nagar, Museum Road, Chaura Maidan, Shimla - Himachal Pradesh 171004</p>
    </div>
  </div>
</body>
</html>`;

  return transporter.sendMail({
    from: 'VGO PRINT <vrgovinda06@gmail.com>',
    to: email,
    subject: "Verify your email address",
    html,
    text: `Verify your email: ${BASE_URL}/user/verify/${verifyToken}`,
  });
}


async function sendUserNumber(email, userNumber) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to VGO Print - Your Unique ID</title>
<style>
  body { font-family:'Helvetica Neue',Arial,sans-serif; line-height:1.6; color:#333; max-width:600px; margin:0 auto; background:#f5f5f5; }
  .email-container { border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,.1); background:#fff; margin:20px; }
  /* CHANGED: neutral header so blue logo pops */
  .header { background:#f3f4f6; color:#1a1a1a; padding:30px 20px; text-align:center; }
  .logo { width:180px; height:auto; margin-bottom:15px; display:block; margin-left:auto; margin-right:auto; }
  .content { padding:30px; }
  .unique-id-container { background:#f1f8ff; border:2px dashed #3498db; border-radius:8px; padding:20px; margin:25px 0; text-align:center; }
  .unique-id { font-size:28px; font-weight:bold; color:#2c3e50; letter-spacing:2px; padding:10px 20px; background:#e5f4ff; border-radius:5px; display:inline-block; margin:10px 0; box-shadow:0 2px 5px rgba(0,0,0,.1); }
  .id-label { font-size:16px; color:#3498db; font-weight:600; margin-bottom:10px; }
  .button-container { text-align:center; margin:30px 0; }
  .button { display:inline-block; background:linear-gradient(to right,#2980b9,#3498db); color:#fff; text-decoration:none; padding:14px 40px; border-radius:50px; font-weight:bold; font-size:16px; box-shadow:0 4px 8px rgba(52,152,219,.3); }
  .footer { background:#2c3e50; color:#ecf0f1; padding:20px; text-align:center; font-size:12px; }
  .divider { height:1px; background:#e0e0e0; margin:25px 0; }
  p { margin:12px 0; }
  .login-info { font-style:italic; color:#7f8c8d; text-align:center; margin:20px 0; }
  @media (prefers-color-scheme: dark) {
    body { background:#0b0b0b; color:#e7e7e7; }
    .email-container { background:#121212; }
    .header { background:#1e1e1e; color:#e7e7e7; }
    .divider { background:#2a2a2a; }
  }
</style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://res.cloudinary.com/dekbabkjd/image/upload/v1762149632/logo1_meixqn.png" alt="VGO Print Logo" class="logo">
      <h2>Welcome to VGO Print!</h2>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Thank you for joining VGO Print! We're excited to have you as our valued customer. Your account has been successfully created.</p>
      <div class="unique-id-container">
        <div class="id-label">Your Unique ID</div>
        <div class="unique-id">${userNumber}</div>
        <p>You can use this ID or your email address to login to your account.</p>
      </div>
      <p class="login-info">Keep this ID safe and secure. It provides access to all your print projects and orders.</p>
      <div class="button-container">
        <a href="https://www.vgoprint.com/login" class="button">Login Now</a>
      </div>
      <div class="divider"></div>
      <p style="text-align:center;">Need help with your printing projects? Our team is ready to assist you!</p>
      <p style="text-align:center;">Contact us at: <a href="mailto:vrgovinda06@gmail.com" style="color:#3498db;">vrgovinda06@gmail.com</a></p>
    </div>
    <div class="footer">
      <p>© 2025 VGO Print. All rights reserved.</p>
      <p>B-22, Indira Nagar , Museum Road, Chaura Maidan Shimla - Himachal Pradesh 171004</p>
    </div>
  </div>
</body>
</html>`;

  return transporter.sendMail({
    from: 'VGO PRINT <vrgovinda06@gmail.com>',
    to: email,
    subject: 'Your Unique Id',
    html,
    text: `Your Unique ID: ${userNumber}\nLogin: https://www.vgoprint.com/login`,
  });
}


async function sendResetMail(email, resetToken) {
  const BASE_URL =  "https://vgoprint-server.onrender.com";
  const resetLink = `${BASE_URL}/user/reset-password?token=${resetToken}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset Your Password</title>
<style>
  body { font-family:'Helvetica Neue',Arial,sans-serif; line-height:1.6; color:#333; max-width:600px; margin:0 auto; background:#f5f5f5; }
  .email-container { border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,.1); background:#fff; margin:20px; }
  /* CHANGED: neutral header so blue logo pops */
  .header { background:#f3f4f6; color:#1a1a1a; padding:30px 20px; text-align:center; }
  .logo { width:180px; height:auto; margin-bottom:15px; display:block; margin-left:auto; margin-right:auto; }
  .content { padding:30px; }
  .button-container { text-align:center; margin:35px 0; }
  .button { display:inline-block; background:linear-gradient(to right,#2980b9,#3498db); color:#fff; text-decoration:none; padding:14px 40px; border-radius:50px; font-weight:bold; font-size:16px; box-shadow:0 4px 8px rgba(52,152,219,.3); }
  .security-notice { background:#fff8e1; border-left:4px solid #ffc107; padding:15px; margin:25px 0; font-size:14px; }
  .token-info { background:#f1f8ff; border:1px solid #e1ebf2; border-radius:5px; padding:15px; margin:20px 0; font-size:14px; }
  .footer { background:#2c3e50; color:#ecf0f1; padding:20px; text-align:center; font-size:12px; }
  h2 { color:inherit; font-weight:300; font-size:24px; margin:10px 0 0; }
  p { margin:12px 0; }
  @media (prefers-color-scheme: dark) {
    body { background:#0b0b0b; color:#e7e7e7; }
    .email-container { background:#121212; }
    .header { background:#1e1e1e; color:#e7e7e7; }
  }
</style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://res.cloudinary.com/dekbabkjd/image/upload/v1762149632/logo1_meixqn.png" alt="VGO Print Logo" class="logo">
      <h2>Reset Your Password</h2>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We received a request to reset the password for your VGO Print account. To proceed, click the button below:</p>
      <div class="button-container">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <div class="security-notice">
        <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact our support team immediately.
      </div>
      <div class="token-info">
        <p>This password reset link will expire in 1 hour.</p>
        <p>If the button doesn't work, copy and paste this URL:</p>
        <p style="word-break:break-all; font-size:12px; color:#666;">${resetLink}</p>
      </div>
      <p>If you need any assistance, email <a href="mailto:vrgovinda06@gmail.com" style="color:#3498db;">vrgovinda06@gmail.com</a>.</p>
      <p>Thank you,<br>The VGO Print Team</p>
    </div>
    <div class="footer">
      <p>© 2025 VGO PRINT. All rights reserved.</p>
      <p>B-22, Indira Nagar , Museum Road, Chaura Maidan Shimla - Himachal Pradesh 171004</p>
    </div>
  </div>
</body>
</html>`;

  return transporter.sendMail({
    from: 'VGO PRINT <vrgovinda06@gmail.com>',
    to: email,
    subject: 'Reset Password',
    html,
    text: `Reset your password: ${resetLink}\nThis link expires in 1 hour.`,
  });
}



module.exports = {sendUserNumber,sendVerifyMail,sendResetMail}