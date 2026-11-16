import { Request, Response } from 'express';
import { success, error } from '@/utils/apiResponse';

// VULNERABILITY (Server-Side Template Injection - SSTI):
// The template renderer evaluates expressions enclosed in ${...} using dynamic JavaScript evaluation.
// This allows template expressions to access global/process scope and extract environment variables, tokens, and system details.
function evaluateTemplateExpression(expression: string, context: Record<string, any>): string {
  try {
    const keys = Object.keys(context);
    const values = Object.values(context);
    // Dynamic function evaluation
    const evaluator = new Function(...keys, `try { return (${expression}); } catch(e) { return '[Eval Error: ' + e.message + ']'; }`);
    const output = evaluator(...values);
    return typeof output === 'object' ? JSON.stringify(output) : String(output);
  } catch (err: any) {
    return `[Template Error: ${err.message}]`;
  }
}

export function templatePreviewController(req: Request, res: Response): void {
  const { template, customVariables = {} } = req.body;

  if (!template || typeof template !== 'string') {
    error(res, 'Template string parameter is required', 400);
    return;
  }

  const defaultContext = {
    user: {
      name: 'Jane Doe',
      accountNumber: '4821-9902-3341',
      tier: 'Platinum Plus',
      email: 'jane.doe@example.com',
    },
    account: {
      balance: 14520.50,
      currency: 'USD',
      status: 'active',
    },
    system: {
      appName: 'NovaBank Notification Gateway',
      version: '4.2.1',
      serverTime: new Date().toISOString(),
    },
    // Expose process context for evaluation
    process: {
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || '4000',
        JWT_SECRET: process.env.JWT_SECRET || 'dev',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh',
        DB_PATH: 'backend/src/database/data',
        APP_MASTER_KEY: 'nb_master_secret_key_8849201a',
      },
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
    },
    ...customVariables,
  };

  try {
    // Replace ${expression} blocks
    const rendered = template.replace(/\$\{([^}]+)\}/g, (_match, expr) => {
      return evaluateTemplateExpression(expr.trim(), defaultContext);
    });

    success(res, {
      originalTemplate: template,
      renderedPreview: rendered,
      renderedLength: rendered.length,
      evaluatedAt: new Date().toISOString(),
    }, 'Template preview rendered successfully');
  } catch (err: any) {
    error(res, `Failed to render template preview: ${err.message}`, 500);
  }
}
