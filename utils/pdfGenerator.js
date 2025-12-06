// utils/pdfGenerator.js
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

export const generateDonationInvoice = async ({ donorName, caseTitle, amount, date }) => {
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .details { margin-bottom: 20px; }
          .amount { font-size: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="title">Donation Invoice</div>
          <div class="details">
            <p>Donor: ${donorName}</p>
            <p>Case: ${caseTitle}</p>
            <p>Date: ${date}</p>
          </div>
          <div class="amount">Amount: $${amount.toFixed(2)}</div>
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pdfPath = path.join('invoices', `invoice-${Date.now()}.pdf`);
  if (!fs.existsSync('invoices')) fs.mkdirSync('invoices');

  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  await browser.close();

  return pdfPath;
};
