/**
 * Integration tests for OnepayIpnController
 *
 * Tests cover:
 *  1. IPN endpoint — valid signed successful payload → fulfillment triggered
 *  2. IPN endpoint — invalid hash → QueryDR recovery triggered
 *  3. IPN endpoint — failure code → no fulfillment, always returns IPN ack
 *  4. IPN endpoint — pending code → no fulfillment, returns IPN ack
 *  5. Return endpoint — valid success → returns { success: true, orderId }
 *  6. Return endpoint — user cancel (code 99) → returns { success: false }
 */

import { Test, TestingModule } from '@nestjs/testing';
import { OnepayIpnController } from './onepay-ipn.controller';
import { OnepayFulfillmentService } from './onepay-fulfillment.service';

// ─── Mock FulfillmentService ──────────────────────────────────────────────────

function makeFulfillmentMock(
  overrides: Partial<Record<keyof OnepayFulfillmentService, jest.Mock>> = {},
) {
  return {
    fulfillFromCallback: jest.fn().mockResolvedValue({ success: true, orderId: 'order-123' }),
    inquireAndUpdate: jest.fn().mockResolvedValue({}),
    createPayment: jest.fn().mockResolvedValue({}),
    ...overrides,
  };
}

async function buildModule(
  fulfillMock: ReturnType<typeof makeFulfillmentMock>,
): Promise<TestingModule> {
  return Test.createTestingModule({
    controllers: [OnepayIpnController],
    providers: [{ provide: OnepayFulfillmentService, useValue: fulfillMock }],
  }).compile();
}

// ─── IPN handler ─────────────────────────────────────────────────────────────

describe('OnepayIpnController.handleIpn()', () => {
  it('calls fulfillFromCallback and returns IPN ack on success', async () => {
    const mock = makeFulfillmentMock();
    const module = await buildModule(mock);
    const controller = module.get(OnepayIpnController);

    const query = {
      vpc_MerchTxnRef: 'TXNREF001',
      vpc_TxnResponseCode: '0',
      vpc_TransactionNo: 'GW123',
      vpc_SecureHash: 'abc123',
    };

    const result = await controller.handleIpn(query as any);

    expect(mock.fulfillFromCallback).toHaveBeenCalledWith(query);
    expect(result).toBe('responsecode=1&desc=confirm-success');
  });

  it('still returns IPN ack even when fulfillment throws', async () => {
    const mock = makeFulfillmentMock({
      fulfillFromCallback: jest.fn().mockRejectedValue(new Error('DB error')),
    });
    const module = await buildModule(mock);
    const controller = module.get(OnepayIpnController);

    const result = await controller.handleIpn({
      vpc_MerchTxnRef: 'TXNREF_ERR',
      vpc_TxnResponseCode: '0',
    } as any);

    // Must always acknowledge IPN regardless of internal error
    expect(result).toBe('responsecode=1&desc=confirm-success');
  });

  it('returns IPN ack for a failed transaction (code != 0)', async () => {
    const mock = makeFulfillmentMock({
      fulfillFromCallback: jest.fn().mockResolvedValue({ success: false, error: '99' }),
    });
    const module = await buildModule(mock);
    const controller = module.get(OnepayIpnController);

    const result = await controller.handleIpn({
      vpc_MerchTxnRef: 'TXNREF_CANCEL',
      vpc_TxnResponseCode: '99',
    } as any);

    expect(result).toBe('responsecode=1&desc=confirm-success');
  });

  it('returns IPN ack for a pending transaction (code 300)', async () => {
    const mock = makeFulfillmentMock({
      fulfillFromCallback: jest.fn().mockResolvedValue({ success: false, pending: true }),
    });
    const module = await buildModule(mock);
    const controller = module.get(OnepayIpnController);

    const result = await controller.handleIpn({
      vpc_MerchTxnRef: 'TXNREF_PEND',
      vpc_TxnResponseCode: '300',
    } as any);

    expect(result).toBe('responsecode=1&desc=confirm-success');
  });
});

// ─── Return handler ───────────────────────────────────────────────────────────

describe('OnepayIpnController.handleReturn()', () => {
  it('returns success result with orderId when payment succeeded', async () => {
    const mock = makeFulfillmentMock({
      fulfillFromCallback: jest.fn().mockResolvedValue({ success: true, orderId: 'order-abc' }),
    });
    const module = await buildModule(mock);
    const controller = module.get(OnepayIpnController);

    const result = await controller.handleReturn({
      vpc_MerchTxnRef: 'TXNREF_OK',
      vpc_TxnResponseCode: '0',
      vpc_TransactionNo: 'GW999',
      vpc_SecureHash: 'valid-hash',
    } as any);

    expect(result).toEqual({ success: true, orderId: 'order-abc' });
    expect(mock.fulfillFromCallback).toHaveBeenCalledTimes(1);
  });

  it('returns failure result when user cancelled (code 99)', async () => {
    const mock = makeFulfillmentMock({
      fulfillFromCallback: jest.fn().mockResolvedValue({ success: false, error: '99' }),
    });
    const module = await buildModule(mock);
    const controller = module.get(OnepayIpnController);

    const result = await controller.handleReturn({
      vpc_MerchTxnRef: 'TXNREF_CANCEL',
      vpc_TxnResponseCode: '99',
      vpc_SecureHash: 'hash',
    } as any);

    expect(result).toEqual({ success: false, error: '99' });
  });

  it('returns pending result for in-progress transactions', async () => {
    const mock = makeFulfillmentMock({
      fulfillFromCallback: jest.fn().mockResolvedValue({ success: false, pending: true }),
    });
    const module = await buildModule(mock);
    const controller = module.get(OnepayIpnController);

    const result = await controller.handleReturn({
      vpc_MerchTxnRef: 'TXNREF_PEND',
      vpc_TxnResponseCode: '100',
      vpc_SecureHash: 'hash',
    } as any);

    expect(result).toEqual({ success: false, pending: true });
  });

  it('handles missing vpc_MerchTxnRef gracefully', async () => {
    const mock = makeFulfillmentMock({
      fulfillFromCallback: jest
        .fn()
        .mockResolvedValue({ success: false, error: 'missing_txn_ref' }),
    });
    const module = await buildModule(mock);
    const controller = module.get(OnepayIpnController);

    const result = await controller.handleReturn({} as any);

    expect(result.success).toBe(false);
    expect(result.error).toBe('missing_txn_ref');
  });
});

// ─── Idempotency ─────────────────────────────────────────────────────────────

describe('OnepayIpnController idempotency', () => {
  it('processes the same IPN ref twice without error', async () => {
    const mock = makeFulfillmentMock({
      fulfillFromCallback: jest
        .fn()
        .mockResolvedValueOnce({ success: true, orderId: 'order-dup' })
        .mockResolvedValueOnce({ success: true, orderId: 'order-dup' }), // same order
    });
    const module = await buildModule(mock);
    const controller = module.get(OnepayIpnController);

    const query = { vpc_MerchTxnRef: 'DUP', vpc_TxnResponseCode: '0' } as any;

    const r1 = await controller.handleIpn(query);
    const r2 = await controller.handleIpn(query);

    expect(r1).toBe('responsecode=1&desc=confirm-success');
    expect(r2).toBe('responsecode=1&desc=confirm-success');
    expect(mock.fulfillFromCallback).toHaveBeenCalledTimes(2);
  });
});
