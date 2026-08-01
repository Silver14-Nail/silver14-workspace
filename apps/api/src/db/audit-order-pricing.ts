import 'reflect-metadata';
import { AppDataSource } from './ormconfig';

// ─── Read-only audit ────────────────────────────────────────────────────────
//
// Lists historical orders where the sum of order_items.unit_price*quantity
// doesn't match order.subtotal — caused by unitPrice being frozen from the
// raw (pre-sale, un-converted) variant price instead of the sale-adjusted,
// currency-converted price actually charged. order.subtotal/total were
// always correct; this only ever affected the per-item price breakdown
// shown in admin. Does NOT write anything to the database.

interface AffectedOrderRow {
  id: string;
  currency: string;
  exchange_rate: string | null;
  subtotal: string;
  total: string;
  items_sum: string;
  created_at: Date;
}

async function auditOrderPricing() {
  await AppDataSource.initialize();

  try {
    const rows: AffectedOrderRow[] = await AppDataSource.query(`
      SELECT
        o.id,
        o.currency,
        o.exchange_rate,
        o.subtotal,
        o.total,
        SUM(oi.unit_price * oi.quantity) AS items_sum,
        o.created_at
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.deleted_at IS NULL
      GROUP BY o.id, o.currency, o.exchange_rate, o.subtotal, o.total, o.created_at
      HAVING ABS(SUM(oi.unit_price * oi.quantity) - o.subtotal) > 0.01
      ORDER BY o.created_at DESC
    `);

    if (rows.length === 0) {
      console.log('\n✅  No affected orders found — every order_items sum matches its subtotal.\n');
      return;
    }

    console.log(`\n⚠️  ${rows.length} affected order(s) — item price sum ≠ subtotal:\n`);

    const deltaByCurrency = new Map<string, number>();

    for (const r of rows) {
      const itemsSum = parseFloat(r.items_sum);
      const subtotal = parseFloat(r.subtotal);
      const delta = itemsSum - subtotal;
      deltaByCurrency.set(r.currency, (deltaByCurrency.get(r.currency) ?? 0) + delta);

      console.log(
        `${r.id}  ${r.created_at.toISOString().slice(0, 10)}  ` +
          `[${r.currency}]  items_sum=${itemsSum.toFixed(2)}  subtotal=${subtotal.toFixed(2)}  ` +
          `total=${r.total}  Δ=${delta >= 0 ? '+' : ''}${delta.toFixed(2)}`,
      );
    }

    console.log('\n— Sum of Δ by currency (display-only discrepancy, not money owed/received) —');
    for (const [currency, sum] of deltaByCurrency) {
      console.log(`  ${currency}: ${sum >= 0 ? '+' : ''}${sum.toFixed(2)}`);
    }
    console.log('');
  } finally {
    await AppDataSource.destroy();
  }
}

auditOrderPricing();
