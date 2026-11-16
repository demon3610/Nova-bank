import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { success, error } from '@/utils/apiResponse';

const UPLOAD_DIR = path.resolve(__dirname, '../../../../uploads/avatars');

function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export const avatarUploadController = {
  upload(req: Request, res: Response): void {
    ensureUploadDir();

    const { filename, fileData, contentType } = req.body;
    if (!filename || !fileData) {
      error(res, 'Missing filename or fileData (base64)', 400);
      return;
    }

    // VULNERABILITY (File Upload with Content-Type / Magic Byte Bypass):
    // Validates extension and user-specified Content-Type, but does NOT check magic bytes.
    // Allows polyglot files (e.g. valid JPEG header followed by <svg onload="alert(1)">)
    // or direct SVG uploads.
    const ext = path.extname(filename).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.svg'];

    if (!allowedExtensions.includes(ext)) {
      error(res, 'Invalid file extension. Only JPG, PNG, and SVG are accepted.', 400);
      return;
    }

    try {
      // Decode base64 or raw string
      const buffer = Buffer.from(fileData, fileData.includes('base64,') ? 'base64' : 'utf-8');
      
      // Sanitize path traversal in filename, but preserve extension
      const safeBasename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
      const targetPath = path.join(UPLOAD_DIR, safeBasename);

      fs.writeFileSync(targetPath, buffer);

      success(res, {
        filename: safeBasename,
        sizeBytes: buffer.length,
        avatarUrl: `/api/users/avatar/${safeBasename}`,
        declaredContentType: contentType || 'image/jpeg',
      }, 'Avatar image uploaded successfully');
    } catch (err: any) {
      error(res, `Failed to store uploaded avatar: ${err.message}`, 500);
    }
  },

  serveAvatar(req: Request, res: Response): void {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      error(res, 'Avatar not found', 404);
      return;
    }

    const ext = path.extname(filename).toLowerCase();
    const fileContent = fs.readFileSync(filePath);

    // VULNERABILITY: If the file is SVG or contains SVG markup, it is served as image/svg+xml
    // without a restrictive Content-Security-Policy (CSP) or sandbox header.
    if (ext === '.svg' || fileContent.toString('utf-8').includes('<svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
      // Intentionally missing: res.setHeader('Content-Security-Policy', "default-src 'none'");
    } else if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else {
      res.setHeader('Content-Type', 'image/jpeg');
    }

    res.send(fileContent);
  },
};
