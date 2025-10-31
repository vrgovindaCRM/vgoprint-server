const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, 
  auth: {
    user: "9952be002@smtp-brevo.com", 
    pass: "mBhIXYCgDVHyOMvS",       
  },
});

const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications['api-key'].apiKey = process.env.SENDINBLUE_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

 const sendVerifyMail = async (email, verifyToken) => {
  try {
    const sendSmtpEmail = {
      sender: { name: "VGO PRINT", email: "vrgovinda06@gmail.com" },
      to: [{ email }],
      subject: "Verify your email address",
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f5f5f5;
        }
        .email-container {
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            background-color: #ffffff;
            margin: 20px;
        }
        .header {
            background: linear-gradient(135deg, #3498db, #1a5276);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            width: 180px;
            height: auto;
            margin-bottom: 15px;
        }
        .content {
            padding: 30px;
        }
        .button-container {
            text-align: center;
            margin: 35px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(to right, #2980b9, #3498db);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 40px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
            transition: all 0.3s ease;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(52, 152, 219, 0.4);
        }
        .footer {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            text-align: center;
            font-size: 12px;
        }
        .footer a {
            color: #3498db;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 25px 0;
        }
        h2 {
            color: #ffffff;
            font-weight: 300;
            font-size: 24px;
            margin: 10px 0 0 0;
        }
        p {
            margin: 12px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://res.cloudinary.com/dekbabkjd/image/upload/v1741585959/products/yzgm2gr1drpkzdjvbdsk.png" alt="Printhub Logo" class="logo">
            <h2>Verify Your Email Address</h2>
        </div>
        
        <div class="content">
            <p>Hello there,</p>
            <p>Thank you for joining VGO PRINT! We're thrilled to have you on board.</p>
            <p>To complete your registration, please verify your email address:</p>
            <div class="button-container">
                <a href="https://print-hub-server.onrender.com/user/verify/${verifyToken}" class="button">Verify Email</a>
            </div>
            <p>If you didn't create an account, you can ignore this email.</p>
            <div class="divider"></div>
            <p style="font-style: italic; color: #7f8c8d; text-align: center;">
              Need help? Email us at <a href="mailto:vrgovinda06@gmail.com" style="color: #3498db;">vrgovinda06@gmail.com</a>
            </p>
        </div>
        
        <div class="footer">
            <p>© 2025 Print-Hub. All rights reserved.</p>
            <p>B-22, Indira Nagar, Museum Road, Chaura Maidan, Shimla - Himachal Pradesh 171004</p>
        </div>
    </div>
</body>
</html>`,
      textContent: `Verify your email: https://print-hub-server.onrender.com/user/verify/${verifyToken}`,
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent via Brevo API:", result);
  } catch (error) {
    console.error("❌ Error sending email:", error.response?.text || error.message);
  }
};


const sendUserNumber = async(email,userNumber) =>{
    try{
    const sendSmtpEmail = {
        sender: { name: "VGO PRINT", email: "vrgovinda06@gmail.com" },
        to: [{ email }],
            subject:'Your Unique Id',
             htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Print-Hub - Your Unique ID</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f5f5f5;
        }
        .email-container {
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            background-color: #ffffff;
            margin: 20px;
        }
        .header {
            background: linear-gradient(135deg, #3498db, #1a5276);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            width: 180px;
            height: auto;
            margin-bottom: 15px;
        }
        .content {
            padding: 30px;
        }
        .unique-id-container {
            background-color: #f1f8ff;
            border: 2px dashed #3498db;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .unique-id {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            letter-spacing: 2px;
            padding: 10px 20px;
            background-color: #e5f4ff;
            border-radius: 5px;
            display: inline-block;
            margin: 10px 0;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .id-label {
            font-size: 16px;
            color: #3498db;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .product-showcase {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .product-title {
            text-align: center;
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .product-samples {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
        }
        .sample {
            width: 22%;
            text-align: center;
            margin-bottom: 15px;
        }
        .sample img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .sample p {
            margin-top: 8px;
            font-weight: 500;
            color: #34495e;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(to right, #2980b9, #3498db);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 40px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
        }
        .footer {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            text-align: center;
            font-size: 12px;
        }
        .footer a {
            color: #3498db;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 25px 0;
        }
        h2 {
            color: #ffffff;
            font-weight: 300;
            font-size: 24px;
            margin: 10px 0 0 0;
        }
        p {
            margin: 12px 0;
        }
        .login-info {
            font-style: italic;
            color: #7f8c8d;
            text-align: center;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://res.cloudinary.com/dekbabkjd/image/upload/v1741585959/products/yzgm2gr1drpkzdjvbdsk.png" alt="Printhub Logo" class="logo">
            <h2>Welcome to Print-Hub!</h2>
        </div>
        
        <div class="content">
            <p>Hello,</p>
            
            <p>Thank you for joining Print-Hub! We're excited to have you as our valued customer. Your account has been successfully created.</p>
            
            <div class="unique-id-container">
                <div class="id-label">Your Unique ID</div>
                <div class="unique-id">${userNumber}</div>
                <p>You can use this ID or your email address to login to your account.</p>
            </div>
            
            <p class="login-info">Keep this ID safe and secure. It provides access to all your print projects and orders.</p>
            
            <div class="button-container">
                <a href="https://print-hub-client.vercel.app/login" class="button">Login Now</a>
            </div>
            <div class="divider"></div>
            
            <p style="text-align: center;">Need help with your printing projects? Our team is ready to assist you!</p>
            <p style="text-align: center;">Contact us at: <a href="mailto:vrgovinda06@gmail.com" style="color: #3498db;">vrgovinda06@gmail.com</a></p>
        </div>
        
        <div class="footer">
            <p>© 2025 Print-Hub All rights reserved.</p>
            <p>B-22, Indira Nagar , Museum Road, Chaura Maidan Shimla - Himachal Pradesh 171004</p>
        </div>
    </div>
</body>
</html>`
          };
          const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
          console.log("Email sent: " + result);
        } catch (error) {
          console.error("Error sending email:", error);
        }
}

const sendResetMail = async (email,resetToken) =>{
  try {
    const sendSmtpEmail = {
      sender: { name: "VGO PRINT", email: "vrgovinda06@gmail.com" },
      to: [{ email }],
      subject:'Reset Password',
      htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f5f5f5;
        }
        .email-container {
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            background-color: #ffffff;
            margin: 20px;
        }
        .header {
            background: linear-gradient(135deg, #3498db, #1a5276);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            width: 180px;
            height: auto;
            margin-bottom: 15px;
        }
        .content {
            padding: 30px;
        }
        .button-container {
            text-align: center;
            margin: 35px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(to right, #2980b9, #3498db);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 40px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
        }
        .security-notice {
            background-color: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 25px 0;
            font-size: 14px;
        }
        .token-info {
            background-color: #f1f8ff;
            border: 1px solid #e1ebf2;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
        .footer {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            text-align: center;
            font-size: 12px;
        }
        .footer a {
            color: #3498db;
            text-decoration: none;
        }
        h2 {
            color: #ffffff;
            font-weight: 300;
            font-size: 24px;
            margin: 10px 0 0 0;
        }
        p {
            margin: 12px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://res.cloudinary.com/dekbabkjd/image/upload/v1741585959/products/yzgm2gr1drpkzdjvbdsk.png" alt="Printhub Logo" class="logo">
            <h2>Reset Your Password</h2>
        </div>
        
        <div class="content">
            <p>Hello,</p>
            
            <p>We received a request to reset the password for your Print-hub account. To proceed with resetting your password, please click the button below:</p>
            
            <div class="button-container">
                <a href="https://print-hub-server.onrender.com/user/reset-password?token=${resetToken}" class="button">Reset Password</a>
            </div>
            
            <div class="security-notice">
                <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact our support team immediately. Someone may be attempting to access your account.
            </div>
            
            <div class="token-info">
                <p>This password reset link will expire in 1 hour for security reasons.</p>
                <p>If the button above doesn't work, you can copy and paste the following URL into your browser:</p>
                <p style="word-break: break-all; font-size: 12px; color: #666;">https://print-hub-server.onrender.com/user/reset-password?token=${resetToken}</p>
            </div>
            
            <p>If you need any assistance, please contact our support team at <a href="mailto:vrgovinda06@gmail.com" style="color: #3498db;">vrgovinda06@gmail.com</a>.</p>
            
            <p>Thank you,<br>The Print-Hub Team</p>
        </div>
        
        <div class="footer">
            <p>© 2025 Print-Hub. All rights reserved.</p>
            <p>B-22, Indira Nagar , Museum Road, Chaura Maidan Shimla - Himachal Pradesh 171004</p>
        </div>
    </div>
</body>
</html>`,
     }
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
     console.log('Email sent: ' + result);
  } catch (error) {
    console.error('Error sending email:' , error)
  }
}
module.exports = {sendUserNumber,sendVerifyMail,sendResetMail}