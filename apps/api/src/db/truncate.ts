import 'reflect-metadata';
import { AppDataSource } from './ormconfig';

// ─── Known tables ─────────────────────────────────────────────────────────────

const KNOWN_TABLES = [
  'users',
  'addresses',
  'user_sessions',
  'user_auth_identities',
  'auth_providers',
  'oauth_state_tokens',
  'email_verifications',
  'password_resetsEntity',
  'nail_shapes',
  'nail_sizes',
  'products',
  'product_images',
  'product_shape_pricings',
  'product_variants',
  'carts',
  'cart_items',
  'checkout_sessions',
  'guest_checkouts',
  'shipping_methods',
  'orders',
  'order_items',
  'custom_size_requests',
  'payments',
  'paypal_details',
  'card_details',
  'coupons',
  'coupon_restrictions',
  'coupon_usages',
  'coupon_user_whitelists',
  'wholesale_tiers',
  'wholesale_accounts',
  'wholesale_enquiries',
  'wholesale_orders',
  'wholesale_product_pricings',
  'newsletter_subscribers',
] as const;

// ─── Main ─────────────────────────────────────────────────────────────────────

async function truncate() {
  const tableName = process.argv[2];

  if (!tableName) {
    console.error('\n❌  Missing table name.\n');
    console.error('Usage: pnpm run db:truncate <table_name>\n');
    console.error('Available tables:');
    KNOWN_TABLES.forEach((t) => console.error(`  • ${t}`));
    console.error('');
    process.exit(1);
  }

  if (!KNOWN_TABLES.includes(tableName as (typeof KNOWN_TABLES)[number])) {
    console.error(`\n❌  Unknown table: "${tableName}"\n`);
    console.error('Available tables:');
    KNOWN_TABLES.forEach((t) => console.error(`  • ${t}`));
    console.error('');
    process.exit(1);
  }

  await AppDataSource.initialize();

  try {
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await AppDataSource.query(`TRUNCATE TABLE \`${tableName}\``);
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log(`\n✅  Table "${tableName}" truncated successfully.\n`);
  } catch (err) {
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {
      return;
    });
    console.error(`\n❌  Failed to truncate "${tableName}":`, err);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

truncate();
