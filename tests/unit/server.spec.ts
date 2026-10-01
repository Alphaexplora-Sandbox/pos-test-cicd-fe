import http from 'node:http';
import { generateHtml, handleRequest, startServer } from '../../src/server';

describe('Server & HTML generation', () => {
  it('generateHtml returns valid HTML with root div', () => {
    const html = generateHtml('/');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<div id="root">');
    expect(html).toContain('NovaPOS - Enterprise Point-of-Sale Cloud');
  });

  it('generateHtml respects route views', () => {
    const ordersHtml = generateHtml('/orders');
    expect(ordersHtml).toContain('Orders &amp; Receipts');

    const inventoryHtml = generateHtml('/inventory');
    expect(inventoryHtml).toContain('Inventory &amp; Stock');

    const shiftsHtml = generateHtml('/shifts');
    expect(shiftsHtml).toContain('Cash Drawer &amp; Shift Control');

    const customersHtml = generateHtml('/customers');
    expect(customersHtml).toContain('Loyalty CRM &amp; Customers');

    const analyticsHtml = generateHtml('/analytics');
    expect(analyticsHtml).toContain('Executive Sales &amp; Business Intelligence');
  });

  it('handleRequest serves /health endpoint with 200 JSON', () => {
    const req = { url: '/health' } as http.IncomingMessage;
    let statusCode = 0;
    let headers: Record<string, string> = {};
    let responseBody = '';

    const res = {
      writeHead: (code: number, hdrs: Record<string, string>) => {
        statusCode = code;
        headers = hdrs;
      },
      end: (data: string) => {
        responseBody = data;
      },
    } as unknown as http.ServerResponse;

    handleRequest(req, res);

    expect(statusCode).toBe(200);
    expect(headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(responseBody)).toEqual({
      status: 'ok',
      service: 'pos-test-cicd-frontend',
    });
  });

  it('handleRequest serves HTML on root', () => {
    const req = { url: '/' } as http.IncomingMessage;
    let statusCode = 0;
    let headers: Record<string, string> = {};
    let responseBody = '';

    const res = {
      writeHead: (code: number, hdrs: Record<string, string>) => {
        statusCode = code;
        headers = hdrs;
      },
      end: (data: string) => {
        responseBody = data;
      },
    } as unknown as http.ServerResponse;

    handleRequest(req, res);

    expect(statusCode).toBe(200);
    expect(headers['Content-Type']).toContain('text/html');
    expect(responseBody).toContain('<!DOCTYPE html>');
  });

  it('startServer starts and closes an HTTP server', (done) => {
    const server = startServer(0);
    server.close(() => {
      done();
    });
  });
});
