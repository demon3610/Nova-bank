import { Request, Response } from 'express';

// VULNERABILITY (CRLF Injection / HTTP Response Splitting):
// Directly takes the query parameter `url` and places it into the raw Location header
// without sanitizing \r (\r\n / %0d%0a).
// This enables attackers to inject custom HTTP headers (Set-Cookie, Content-Length)
// or inject a completely fake HTTP response body.
export function redirectController(req: Request, res: Response): void {
  const targetUrl = (req.query.url as string) || '/dashboard';

  // Flawed: writeHead with raw targetUrl allows CRLF injection
  res.writeHead(302, {
    'Location': targetUrl,
    'X-Gateway-Redirect': 'NovaBank-AuthRouter-v1',
  });
  res.end();
}
