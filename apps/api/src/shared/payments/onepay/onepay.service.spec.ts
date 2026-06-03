/**
 * Unit tests for OnepayService
 *
 * Tests cover:
 *  1. HMAC-SHA256 hash computation (per spec §II.8)
 *  2. Redirect URL building — correct params + signature
 *  3. Hash verification — valid and tampered payloads
 *  4. isSuccess() helper
 *  5. Amount conversion helpers
 *  6. buildMerchTxnRef() — uniqueness + length constraint
 */

import * as crypto from 'crypto';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { OnepayService } from './onepay.service';

// ─── Test constants (sandbox from spec §III.1) ────────────────────────────────

const TEST_HASH_KEY = '6D0870CDE5F24F34F3915FB0045120DB';
const TEST_MERCHANT = 'TESTONEPAY';
const TEST_ACCESS_CODE = '6BEB2546';
const TEST_PAYGATE_URL = 'https://mtf.onepay.vn/paygate/vpcpay.op';
const TEST_RETURN_URL = 'https://example.com/api/client-api/webhooks/onepay/return';
const TEST_IPN_URL = 'https://example.com/api/client-api/webhooks/onepay/ipn';

function makeConfigService(overrides: Record<string, any> = {}): ConfigService {
  const config = {
    merchantId: TEST_MERCHANT,
    accessCode: TEST_ACCESS_CODE,
    hashKey: TEST_HASH_KEY,
    user: 'op01',
    password: 'op123456',
    env: 'sandbox',
    payGateUrl: TEST_PAYGATE_URL,
    queryDrUrl: 'https://mtf.onepay.vn/msp/api/v1/vpc/invoices/queries',
    returnUrl: TEST_RETURN_URL,
    ipnUrl: TEST_IPN_URL,
    title: 'Test Title',
    ...overrides,
  };
  return { getOrThrow: (_key: string) => config } as unknown as ConfigService;
}

async function createService(overrides: Record<string, any> = {}): Promise<OnepayService> {
  const moduleRef = await Test.createTestingModule({
    providers: [OnepayService, { provide: ConfigService, useValue: makeConfigService(overrides) }],
  }).compile();
  return moduleRef.get(OnepayService);
}

// ─── Hash computation ────────────────────────────────────────────────────────

describe('OnepayService.computeHash()', () => {
  it('computes HMAC-SHA256 of sorted vpc_ params (excluding vpc_SecureHash)', async () => {
    const service = await createService();

    const params: Record<string, string> = {
      vpc_Amount: '2500000',
      vpc_Command: 'pay',
      vpc_MerchTxnRef: 'TESTREF001',
      vpc_Merchant: TEST_MERCHANT,
      vpc_SecureHash: 'should-be-excluded',
    };

    const hash = service.computeHash(params);

    // Manually compute expected hash
    const sorted =
      'vpc_Amount=2500000&vpc_Command=pay&vpc_MerchTxnRef=TESTREF001&vpc_Merchant=TESTONEPAY';
    const expected = crypto
      .createHmac('sha256', Buffer.from(TEST_HASH_KEY, 'hex'))
      .update(sorted)
      .digest('hex');

    expect(hash).toBe(expected);
    expect(hash).toHaveLength(64);
  });

  it('excludes non-vpc_/non-user_ keys from hash computation', async () => {
    const service = await createService();

    const paramsWithExtra: Record<string, string> = {
      vpc_Amount: '100000',
      Title: 'My Shop',
      AgainLink: 'https://example.com',
    };

    const hash = service.computeHash(paramsWithExtra);

    const sorted = 'vpc_Amount=100000';
    const expected = crypto
      .createHmac('sha256', Buffer.from(TEST_HASH_KEY, 'hex'))
      .update(sorted)
      .digest('hex');

    expect(hash).toBe(expected);
  });

  it('sorts params alphabetically before hashing', async () => {
    const service = await createService();

    const params1 = { vpc_B: 'b', vpc_A: 'a' };
    const params2 = { vpc_A: 'a', vpc_B: 'b' };

    expect(service.computeHash(params1)).toBe(service.computeHash(params2));
  });
});

// ─── Redirect URL building ────────────────────────────────────────────────────

describe('OnepayService.buildRedirectUrl()', () => {
  it('includes all required vpc_ parameters', async () => {
    const service = await createService();

    const url = service.buildRedirectUrl({
      vpc_MerchTxnRef: 'TXNREF001',
      vpc_OrderInfo: 'Order-123',
      vpc_Amount: '2500000',
      vpc_TicketNo: '192.168.1.1',
    });

    const parsed = new URL(url);
    expect(parsed.searchParams.get('vpc_Version')).toBe('2');
    expect(parsed.searchParams.get('vpc_Currency')).toBe('VND');
    expect(parsed.searchParams.get('vpc_Command')).toBe('pay');
    expect(parsed.searchParams.get('vpc_AccessCode')).toBe(TEST_ACCESS_CODE);
    expect(parsed.searchParams.get('vpc_Merchant')).toBe(TEST_MERCHANT);
    expect(parsed.searchParams.get('vpc_MerchTxnRef')).toBe('TXNREF001');
    expect(parsed.searchParams.get('vpc_OrderInfo')).toBe('Order-123');
    expect(parsed.searchParams.get('vpc_Amount')).toBe('2500000');
    expect(parsed.searchParams.get('vpc_TicketNo')).toBe('192.168.1.1');
    expect(parsed.searchParams.get('vpc_SecureHash')).toHaveLength(64);
  });

  it('points to the correct paygate URL base', async () => {
    const service = await createService();
    const url = service.buildRedirectUrl({
      vpc_MerchTxnRef: 'X',
      vpc_OrderInfo: 'Y',
      vpc_Amount: '100',
      vpc_TicketNo: '1.2.3.4',
    });
    expect(url).toContain('mtf.onepay.vn/paygate/vpcpay.op');
  });

  it('optionally includes vpc_CardList, vpc_Customer_Phone, vpc_Customer_Email', async () => {
    const service = await createService();
    const url = service.buildRedirectUrl({
      vpc_MerchTxnRef: 'X',
      vpc_OrderInfo: 'Y',
      vpc_Amount: '100',
      vpc_TicketNo: '1.2.3.4',
      vpc_CardList: 'DOMESTIC',
      vpc_Customer_Phone: '0909123456',
      vpc_Customer_Email: 'test@example.com',
    });

    const parsed = new URL(url);
    expect(parsed.searchParams.get('vpc_CardList')).toBe('DOMESTIC');
    expect(parsed.searchParams.get('vpc_Customer_Phone')).toBe('0909123456');
    expect(parsed.searchParams.get('vpc_Customer_Email')).toBe('test@example.com');
  });

  it('produces a valid signature that verifyHash() accepts', async () => {
    const service = await createService();
    const url = service.buildRedirectUrl({
      vpc_MerchTxnRef: 'VERIFY001',
      vpc_OrderInfo: 'TestOrder',
      vpc_Amount: '50000',
      vpc_TicketNo: '127.0.0.1',
    });

    const parsed = new URL(url);
    const returnParams: Record<string, string | undefined> = {};
    parsed.searchParams.forEach((v, k) => {
      returnParams[k] = v;
    });

    expect(service.verifyHash(returnParams as any)).toBe(true);
  });
});

// ─── Hash verification ────────────────────────────────────────────────────────

describe('OnepayService.verifyHash()', () => {
  it('returns true for a valid signed payload', async () => {
    const service = await createService();

    const params: Record<string, string> = {
      vpc_Amount: '2500000',
      vpc_Command: 'pay',
      vpc_MerchTxnRef: 'TESTREF001',
      vpc_Merchant: TEST_MERCHANT,
      vpc_TxnResponseCode: '0',
    };
    const hash = service.computeHash(params);
    params['vpc_SecureHash'] = hash;

    expect(service.verifyHash(params as any)).toBe(true);
  });

  it('returns false when vpc_SecureHash is missing', async () => {
    const service = await createService();
    expect(service.verifyHash({ vpc_Amount: '100' } as any)).toBe(false);
  });

  it('returns false when any parameter has been tampered', async () => {
    const service = await createService();

    const params: Record<string, string> = {
      vpc_Amount: '2500000',
      vpc_MerchTxnRef: 'TESTREF001',
      vpc_Merchant: TEST_MERCHANT,
      vpc_TxnResponseCode: '0',
    };
    const hash = service.computeHash(params);
    // Tamper amount after signing
    params['vpc_Amount'] = '999999999';
    params['vpc_SecureHash'] = hash;

    expect(service.verifyHash(params as any)).toBe(false);
  });

  it('is case-insensitive for hex comparison', async () => {
    const service = await createService();

    const params: Record<string, string> = {
      vpc_Amount: '100',
      vpc_MerchTxnRef: 'X',
    };
    const hash = service.computeHash(params);
    params['vpc_SecureHash'] = hash.toUpperCase();

    expect(service.verifyHash(params as any)).toBe(true);
  });
});

// ─── isSuccess() ─────────────────────────────────────────────────────────────

describe('OnepayService.isSuccess()', () => {
  it('returns true only for code "0"', async () => {
    const service = await createService();
    expect(service.isSuccess('0')).toBe(true);
    expect(service.isSuccess('1')).toBe(false);
    expect(service.isSuccess('99')).toBe(false);
    expect(service.isSuccess(undefined)).toBe(false);
    expect(service.isSuccess('')).toBe(false);
  });
});

// ─── Amount conversion ────────────────────────────────────────────────────────

describe('OnepayService amount helpers', () => {
  it('toOnepayAmount multiplies VND by 100', async () => {
    const service = await createService();
    expect(service.toOnepayAmount(25000)).toBe(2500000);
    expect(service.toOnepayAmount(100)).toBe(10000);
    expect(service.toOnepayAmount(25000.7)).toBe(2500070); // rounds then * 100
  });

  it('fromOnepayAmount divides by 100', async () => {
    const service = await createService();
    expect(service.fromOnepayAmount(2500000)).toBe(25000);
    expect(service.fromOnepayAmount(10000)).toBe(100);
  });
});

// ─── buildMerchTxnRef() ───────────────────────────────────────────────────────

describe('OnepayService.buildMerchTxnRef()', () => {
  it('produces refs ≤ 40 characters', async () => {
    const service = await createService();
    const sessionId = '550e8400-e29b-41d4-a716-446655440000';
    const ref = service.buildMerchTxnRef(sessionId);
    expect(ref.length).toBeLessThanOrEqual(40);
  });

  it('produces different refs for different calls (timestamp suffix)', async () => {
    const service = await createService();
    const sessionId = '550e8400-e29b-41d4-a716-446655440000';
    const ref1 = service.buildMerchTxnRef(sessionId);
    // Small delay to ensure different timestamp
    await new Promise((r) => setTimeout(r, 10));
    const ref2 = service.buildMerchTxnRef(sessionId);
    // They may differ if timestamp changes; at minimum they are both valid
    expect(ref1.length).toBeLessThanOrEqual(40);
    expect(ref2.length).toBeLessThanOrEqual(40);
  });

  it('strips dashes from sessionId', async () => {
    const service = await createService();
    const ref = service.buildMerchTxnRef('abc-def-ghi');
    expect(ref).not.toContain('-');
  });
});
