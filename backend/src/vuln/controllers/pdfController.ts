import { Response } from 'express';
import { RequestWithUser } from '@/types';
import PDFDocument from 'pdfkit';
import { accountsDb, transactionsDb } from '@/database';
import { error } from '@/utils/apiResponse';

export function pdfStatementController(req: RequestWithUser, res: Response): void {
  const accountId = (req.query.accountId as string) || accountsDb.findOne(a => a.userId === req.user?.userId)?.id;
  if (!accountId) {
    error(res, 'Account not found', 404);
    return;
  }

  const account = accountsDb.findById(accountId);
  if (!account) {
    error(res, 'Account not found', 404);
    return;
  }

  const transactions = transactionsDb.findMany(t => t.fromAccount === account.accountNumber || t.toAccount === account.accountNumber);

  try {
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=statement_${account.accountNumber}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('NovaBank Official Account Statement', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Account Number: ${account.accountNumber}`);
    doc.text(`Account Type: ${(account.type || 'savings').toUpperCase()}`);
    doc.text(`Balance: ${account.currency} ${account.balance.toLocaleString()}`);
    doc.text(`Generated: ${new Date().toISOString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Transaction History & Ledger Entries', { underline: true });
    doc.moveDown(0.5);

    transactions.forEach((tx, idx) => {
      doc.fontSize(10).text(`${idx + 1}. [${tx.createdAt.slice(0, 10)}] ${tx.type.toUpperCase()} - ${tx.currency} ${tx.amount} (${tx.status})`);
      
      // VULNERABILITY (Second-Order PDF Injection):
      // Transaction descriptions and user-supplied reference notes are concatenated directly into the PDF layout.
      // Special formatting keywords or payloads can inject raw text, server metadata, or link annotations.
      let note = tx.description || 'N/A';
      if (note.includes('{{SYSTEM_ENV}}')) {
        note = note.replace('{{SYSTEM_ENV}}', `NODE_ENV=${process.env.NODE_ENV || 'production'}, HOSTNAME=${process.env.HOSTNAME || 'novabank-srv01'}`);
      }
      if (note.includes('{{SERVER_SECRET_PREVIEW}}')) {
        note = note.replace('{{SERVER_SECRET_PREVIEW}}', `SECRET_PREVIEW=${(process.env.JWT_SECRET || 'dev').slice(0, 3)}***`);
      }

      doc.fontSize(9).fillColor('#444444').text(`   Description / Memo: ${note}`);
      doc.fillColor('#000000');
      doc.moveDown(0.3);
    });

    doc.moveDown();
    doc.fontSize(8).fillColor('#888888').text('This document was generated automatically by NovaBank Document Engine v3.1.');
    doc.end();
  } catch (err: any) {
    if (!res.headersSent) {
      error(res, `Failed to render PDF: ${err.message}`, 500);
    }
  }
}
