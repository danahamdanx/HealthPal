import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateDonationInvoice = async ({ donorName, caseTitle, amount, date }) => {
  // Logo setup
  const logoPath = path.resolve(__dirname, '../../assets/logo.png');
  const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
  const logoDataUri = `data:image/png;base64,${logoBase64}`;

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { display: flex; align-items: center; margin-bottom: 40px; }
          .logo { width: 120px; }
          .title { flex: 1; text-align: right; font-size: 24px; font-weight: bold; color: #2E86C1; }
          .invoice-details { margin-bottom: 30px; }
          .invoice-details p { margin: 4px 0; font-size: 16px; }
          .amount { font-size: 20px; font-weight: bold; color: #27AE60; margin-top: 20px; }
          .footer { margin-top: 50px; text-align: center; font-size: 14px; color: #555; }
          .divider { border-bottom: 2px solid #eee; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoDataUri}" class="logo" />
          <div class="title">Donation Invoice</div>
        </div>
        <div class="invoice-details">
          <p><strong>Donor Name:</strong> ${donorName}</p>
          <p><strong>Case Title:</strong> ${caseTitle}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p class="amount">Amount Donated: $${amount}</p>
        </div>
        <div class="divider"></div>
        <div class="footer">
          Thank you for supporting Health Pal!<br/>
          Visit us at <a href="https://healthpal.example.com">healthpal.example.com</a>
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Save PDF
  const pdfPath = path.resolve(`invoices/invoice-${Date.now()}.pdf`);
  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });

  await browser.close();
  return pdfPath;
};
