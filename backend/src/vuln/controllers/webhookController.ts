import { Request, Response } from 'express';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import { success, error } from '@/utils/apiResponse';

export async function webhookController(req: Request, res: Response): Promise<void> {
  const { webhookUrl, eventTypes = ['transaction.completed'] } = req.body;

  if (!webhookUrl || typeof webhookUrl !== 'string') {
    error(res, 'Missing webhookUrl parameter', 400);
    return;
  }

  // VULNERABILITY (Flawed Blacklist SSRF Filter):
  // Only blocks literal string matching for "localhost" and "127.0.0.1".
  // Bypassable via:
  // - Decimal IP: http://2130706433
  // - Hex IP: http://0x7f000001
  // - 0.0.0.0
  // - IPv6: http://[::1] or http://[::]
  // - DNS Exfiltration / Burp Collaborator domains
  const lowerUrl = webhookUrl.toLowerCase();
  if (lowerUrl.includes('localhost') || lowerUrl.includes('127.0.0.1')) {
    error(res, 'Security Exception: Loopback destination blocked by network firewall policy', 403);
    return;
  }

  try {
    const parsed = new URL(webhookUrl);
    const client = parsed.protocol === 'https:' ? https : http;

    const testPayload = JSON.stringify({
      event: 'webhook.verification',
      timestamp: new Date().toISOString(),
      service: 'NovaBank-WebhookGateway-v2.4',
      eventTypes,
      health: 'ok',
    });

    const options = {
      method: 'POST',
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testPayload),
        'User-Agent': 'NovaBank-WebhookWorker/2.4 (+https://novabank.internal/bot)',
        'X-Internal-Token': 'nb_sec_live_99d1fa882cb14',
      },
      timeout: 3000,
    };

    const webhookReq = client.request(options, (webhookRes) => {
      let responseBody = '';
      webhookRes.on('data', chunk => { responseBody += chunk; });
      webhookRes.on('end', () => {
        success(res, {
          webhookUrl,
          statusCode: webhookRes.statusCode,
          headers: webhookRes.headers,
          snippet: responseBody.slice(0, 500),
          status: 'verified',
        }, 'Webhook ping dispatched and response received');
      });
    });

    webhookReq.on('error', (err) => {
      // Blind / Semi-blind feedback
      success(res, {
        webhookUrl,
        delivered: false,
        diagnostic: err.message,
      }, 'Webhook dispatched (connection error)');
    });

    webhookReq.on('timeout', () => {
      webhookReq.destroy();
      success(res, {
        webhookUrl,
        delivered: false,
        diagnostic: 'Connection timed out',
      }, 'Webhook dispatched (timeout)');
    });

    webhookReq.write(testPayload);
    webhookReq.end();
  } catch (err: any) {
    error(res, `Failed to parse or dispatch to URL: ${err.message}`, 400);
  }
}
