import { logger } from '@/config/logger';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

interface StatementData {
  accountNumber: string;
  accountType: string;
  ifscCode: string;
  holderName: string;
  startDate: string;
  endDate: string;
  transactions: Array<{
    date: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    description: string;
  }>;
  openingBalance: number;
  closingBalance: number;
}

const statementsDir = path.resolve(__dirname, '../../generated_statements');

export async function generateStatementPdf(data: StatementData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.fontSize(22).font('Helvetica-Bold').text('NovaBank', { align: 'center' });
    doc.fontSize(16).font('Helvetica').text('Account Statement', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(11).font('Helvetica');
    doc.text(`Account Number: ${data.accountNumber}`);
    doc.text(`Account Type: ${data.accountType}`);
    doc.text(`IFSC Code: ${data.ifscCode}`);
    doc.text(`Account Holder: ${data.holderName}`);
    doc.moveDown(0.5);
    doc.text(`Period: ${data.startDate} - ${data.endDate}`);
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica-Bold').text('Transaction History', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Date', 50, doc.y, { width: 70, continued: true });
    doc.text('Type', 120, doc.y, { width: 80, continued: true });
    doc.text('Description', 200, doc.y, { width: 150, continued: true });
    doc.text('Amount', 350, doc.y, { width: 80, continued: true });
    doc.text('Status', 430, doc.y, { width: 70 });
    doc.moveDown(0.3);

    doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
    doc.moveDown(0.3);

    doc.fontSize(8).font('Helvetica');
    for (const tx of data.transactions) {
      const y = doc.y;
      if (y > 720) {
        doc.addPage();
      }
      doc.text(tx.date, 50, doc.y, { width: 70, continued: true });
      doc.text(tx.type, 120, doc.y, { width: 80, continued: true });
      doc.text(tx.description.substring(0, 30), 200, doc.y, { width: 150, continued: true });
      doc.text(`${tx.amount.toFixed(2)} ${tx.currency}`, 350, doc.y, { width: 80, continued: true });
      doc.text(tx.status, 430, doc.y, { width: 70 });
    }

    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
    doc.moveDown(1);

    doc.fontSize(10).font('Helvetica');
    doc.text(`Opening Balance: ₹${data.openingBalance.toFixed(2)}`);
    doc.text(`Closing Balance: ₹${data.closingBalance.toFixed(2)}`);
    doc.moveDown(2);

    doc.fontSize(8).font('Helvetica-Oblique')
      .text('This is a computer-generated statement and does not require a physical signature.', { align: 'center' });

    doc.end();
  });
}

export async function saveStatementToFile(data: StatementData): Promise<string> {
  if (!fs.existsSync(statementsDir)) {
    fs.mkdirSync(statementsDir, { recursive: true });
  }

  const pdf = await generateStatementPdf(data);
  const filename = `statement-${data.accountNumber}-${Date.now()}.pdf`;
  const filepath = path.join(statementsDir, filename);
  fs.writeFileSync(filepath, pdf);

  logger.info('Statement PDF generated', { filepath });
  return filepath;
}

export default { generateStatementPdf, saveStatementToFile };
