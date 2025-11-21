import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // Check for proxy headers first (common when running behind reverse proxy/load balancer)
    const forwardedFor = request.headers['x-forwarded-for'];
    const realIp = request.headers['x-real-ip'];
    const clientIp = request.headers['x-client-ip'];
    const cfConnectingIp = request.headers['cf-connecting-ip']; // Cloudflare
    const xClusterClientIp = request.headers['x-cluster-client-ip'];
    const xForwarded = request.headers['x-forwarded'];
    const forwarded = request.headers['forwarded'];

    let ip: string | undefined;

    // Handle X-Forwarded-For header (can contain multiple IPs, take the first one)
    if (forwardedFor) {
      ip = (typeof forwardedFor === 'string' ? forwardedFor : forwardedFor[0])
        .split(',')[0]
        .trim();
    }
    // Handle other common proxy headers
    else if (realIp) {
      ip = typeof realIp === 'string' ? realIp : realIp[0];
    } else if (clientIp) {
      ip = typeof clientIp === 'string' ? clientIp : clientIp[0];
    } else if (cfConnectingIp) {
      ip =
        typeof cfConnectingIp === 'string' ? cfConnectingIp : cfConnectingIp[0];
    } else if (xClusterClientIp) {
      ip =
        typeof xClusterClientIp === 'string'
          ? xClusterClientIp
          : xClusterClientIp[0];
    } else if (xForwarded) {
      ip = typeof xForwarded === 'string' ? xForwarded : xForwarded[0];
    } else if (forwarded) {
      // Parse Forwarded header format: Forwarded: for=<client>;by=<proxy>;host=<host>;proto=<http/https>
      const forwardedStr =
        typeof forwarded === 'string' ? forwarded : forwarded[0];
      const forMatch = forwardedStr.match(/for=([^;,]+)/i);
      if (forMatch) {
        ip = forMatch[1].replace(/"/g, '').trim();
      }
    }
    // Fallback to direct connection IP
    else {
      ip =
        request.ip ||
        request.connection?.remoteAddress ||
        request.socket?.remoteAddress ||
        request.connection?.socket?.remoteAddress ||
        '0.0.0.0';
    }

    return ip || '0.0.0.0';
  },
);
