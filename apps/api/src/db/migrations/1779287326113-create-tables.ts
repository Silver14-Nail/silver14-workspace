import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1779287326113 implements MigrationInterface {
  name = 'CreateTables1779287326113';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`addresses\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`recipient_name\` varchar(100) NOT NULL, \`street\` varchar(255) NOT NULL, \`city\` varchar(100) NOT NULL, \`country\` varchar(100) NOT NULL, \`postal_code\` varchar(20) NULL, \`is_default\` tinyint NOT NULL DEFAULT 0, \`user_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`oauth_state_tokens\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`state_token\` varchar(255) NOT NULL, \`redirect_uri\` varchar(500) NULL, \`code_verifier\` varchar(255) NULL, \`is_used\` tinyint NOT NULL DEFAULT 0, \`expires_at\` timestamp NOT NULL, \`provider_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_91c3312657a32e0e44329ef199\` (\`state_token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`auth_providers\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`name\` enum ('password', 'google', 'facebook', 'apple', 'tiktok') NOT NULL, \`display_name\` varchar(50) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_53014852294d24f1349591eade\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_sessions\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`token_hash\` varchar(255) NOT NULL, \`login_method\` enum ('password', 'google', 'facebook', 'apple', 'tiktok') NOT NULL, \`device_info\` varchar(500) NULL, \`ip_address\` varchar(45) NULL, \`expires_at\` timestamp NOT NULL, \`user_id\` varchar(36) NULL, \`identity_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_6596adb3b8927b35bda97e734a\` (\`token_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_auth_identities\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`provider_user_id\` varchar(255) NOT NULL, \`provider_email\` varchar(255) NULL, \`access_token_hash\` varchar(255) NULL, \`refresh_token_hash\` varchar(255) NULL, \`raw_profile\` json NULL, \`token_expires_at\` timestamp NULL, \`linked_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`last_used_at\` timestamp NULL, \`user_id\` varchar(36) NULL, \`provider_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`password_resetsEntity\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`token_hash\` varchar(255) NOT NULL, \`is_used\` tinyint NOT NULL DEFAULT 0, \`expires_at\` timestamp NOT NULL, \`user_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_5ebbbc8849edd34320cc2b3f60\` (\`token_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`email_verifications\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`token_hash\` varchar(255) NOT NULL, \`new_email\` varchar(255) NULL, \`is_used\` tinyint NOT NULL DEFAULT 0, \`expires_at\` timestamp NOT NULL, \`user_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_7939cc2e493281f265179fa86c\` (\`token_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`full_name\` varchar(100) NOT NULL, \`email\` varchar(255) NOT NULL, \`phone\` varchar(20) NULL, \`password_hash\` varchar(255) NULL, \`avatar_url\` varchar(500) NULL, \`role\` enum ('customer', 'admin', 'wholesale') NOT NULL DEFAULT 'customer', \`email_verified\` tinyint NOT NULL DEFAULT 0, \`is_active\` tinyint NOT NULL DEFAULT 1, \`last_login_at\` timestamp NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`wholesale_enquiries\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`first_name\` varchar(100) NOT NULL, \`last_name\` varchar(100) NOT NULL, \`email\` varchar(255) NOT NULL, \`phone\` varchar(20) NOT NULL, \`country\` varchar(100) NOT NULL, \`business_name\` varchar(200) NULL, \`business_type\` varchar(100) NULL, \`monthly_order_qty_range\` varchar(50) NULL, \`collections_of_interest\` json NULL, \`additional_message\` text NULL, \`status\` enum ('pending', 'reviewing', 'approved', 'rejected') NOT NULL DEFAULT 'pending', \`admin_notes\` text NULL, \`responded_at\` timestamp NULL, \`handled_by\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`product_images\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`url\` varchar(500) NOT NULL, \`is_main\` tinyint NOT NULL DEFAULT '0', \`sort_order\` int NOT NULL DEFAULT '0', \`product_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`nail_sizes\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`label\` enum ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom') NOT NULL, \`size_code\` varchar(20) NOT NULL, \`measurements\` varchar(100) NULL, UNIQUE INDEX \`IDX_a04742133cc6ad065b64249b33\` (\`size_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`product_variants\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`stock_qty\` int NOT NULL DEFAULT '0', \`computed_price\` decimal(10,2) NOT NULL, \`sku\` varchar(100) NULL, \`is_available\` tinyint NOT NULL DEFAULT '1', \`product_id\` varchar(36) NULL, \`shape_id\` varchar(36) NULL, \`size_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_46f236f21640f9da218a063a86\` (\`sku\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`nail_shapes\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`length_mm\` int NOT NULL, \`size_tier\` enum ('standard', 'medium', 'large', 'xl') NOT NULL DEFAULT 'standard', \`price_adjustment\` decimal(10,2) NOT NULL DEFAULT '0.00', \`adjustment_type\` enum ('fixed', 'percent') NOT NULL DEFAULT 'fixed', \`is_active\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`product_shape_pricings\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`price_override\` decimal(10,2) NULL, \`price_adjustment\` decimal(10,2) NULL, \`adjustment_type\` enum ('fixed', 'percent') NULL, \`is_enabled\` tinyint NOT NULL DEFAULT 1, \`product_id\` varchar(36) NULL, \`shape_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`products\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`name\` varchar(200) NOT NULL, \`slug\` varchar(255) NULL, \`description\` text NULL, \`base_price\` decimal(10,2) NOT NULL, \`sale_price\` decimal(10,2) NULL, \`currency\` varchar(3) NOT NULL DEFAULT 'USD', \`is_active\` tinyint NOT NULL DEFAULT 1, \`is_new\` tinyint NOT NULL DEFAULT 0, \`is_best_seller\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_464f927ae360106b783ed0b410\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`wholesale_product_pricings\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`override_price\` decimal(10,2) NULL, \`discount_percent\` decimal(5,2) NULL, \`is_enabled\` tinyint NOT NULL DEFAULT 1, \`wholesale_account_id\` varchar(36) NULL, \`product_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`guest_checkouts\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`phone\` varchar(20) NOT NULL, \`tracking_token\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_4ec75fbc2d863d7eaef8697e59\` (\`phone\`), UNIQUE INDEX \`IDX_e469f913c3802e0c8343fff710\` (\`tracking_token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`cart_items\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`quantity\` int NOT NULL DEFAULT '1', \`is_custom_size\` tinyint NOT NULL DEFAULT 0, \`custom_measurements\` json NULL, \`cart_id\` varchar(36) NULL, \`variant_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`carts\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`status\` enum ('active', 'merged', 'converted', 'expired') NOT NULL DEFAULT 'active', \`expires_at\` timestamp NULL, \`user_id\` varchar(36) NULL, \`guest_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`checkout_sessions\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`current_step\` int NOT NULL DEFAULT '1', \`contact_snapshot\` json NULL, \`shipping_snapshot\` json NULL, \`coupon_code\` varchar(50) NULL, \`discount_amount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`status\` enum ('in_progress', 'completed', 'abandoned', 'expired') NOT NULL DEFAULT 'in_progress', \`expires_at\` timestamp NOT NULL, \`cart_id\` varchar(36) NULL, \`user_id\` varchar(36) NULL, \`guest_id\` varchar(36) NULL, UNIQUE INDEX \`REL_4d9c73c6a14dc4c9b73eff59ff\` (\`cart_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`shipping_methods\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`carrier\` varchar(100) NULL, \`fee\` decimal(10,2) NOT NULL DEFAULT '0.00', \`currency\` varchar(3) NOT NULL DEFAULT 'USD', \`est_days_min\` int NULL, \`est_days_max\` int NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`coupon_restrictions\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`restriction_type\` enum ('product', 'shape', 'category', 'min_qty', 'new_user') NOT NULL, \`ref_id\` varchar(255) NULL, \`ref_label\` varchar(200) NULL, \`coupon_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`coupon_user_whitelists\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`coupon_id\` varchar(36) NULL, \`user_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`coupon_usages\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`discount_applied\` decimal(10,2) NOT NULL, \`coupon_id\` varchar(36) NULL, \`user_id\` varchar(36) NULL, \`order_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`coupons\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`code\` varchar(50) NOT NULL, \`description\` text NULL, \`discount_type\` enum ('percent', 'fixed', 'free_shipping') NOT NULL, \`discount_value\` decimal(10,2) NOT NULL, \`max_discount_amount\` decimal(10,2) NULL, \`min_order_amount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`max_uses_total\` int NULL, \`max_uses_per_user\` int NOT NULL DEFAULT '1', \`used_count\` int NOT NULL DEFAULT '0', \`is_active\` tinyint NOT NULL DEFAULT 1, \`starts_at\` timestamp NULL, \`expires_at\` timestamp NULL, UNIQUE INDEX \`IDX_e025109230e82925843f2a14c4\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`custom_size_requests\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`thumb\` varchar(10) NULL, \`index_finger\` varchar(10) NULL, \`middle_finger\` varchar(10) NULL, \`ring_finger\` varchar(10) NULL, \`pinky\` varchar(10) NULL, \`notes\` text NULL, \`order_item_id\` varchar(36) NULL, UNIQUE INDEX \`REL_a901090744e73bed821398691f\` (\`order_item_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`order_items\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`quantity\` int NOT NULL DEFAULT '1', \`unit_price\` decimal(10,2) NOT NULL, \`shape_surcharge\` decimal(10,2) NOT NULL DEFAULT '0.00', \`item_discount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`shape_name\` varchar(100) NOT NULL, \`size_label\` varchar(20) NOT NULL, \`is_custom_size\` tinyint NOT NULL DEFAULT 0, \`order_id\` varchar(36) NULL, \`variant_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`orders\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`status\` enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending', \`tracking_number\` varchar(100) NULL, \`contact_snapshot\` json NOT NULL, \`shipping_snapshot\` json NOT NULL, \`subtotal\` decimal(10,2) NOT NULL, \`discount_amount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`shipping_fee\` decimal(10,2) NOT NULL DEFAULT '0.00', \`total\` decimal(10,2) NOT NULL, \`currency\` varchar(3) NOT NULL DEFAULT 'USD', \`user_id\` varchar(36) NULL, \`guest_id\` varchar(36) NULL, \`checkout_session_id\` varchar(36) NULL, \`shipping_method_id\` varchar(36) NULL, \`coupon_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`wholesale_orders\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`po_number\` varchar(100) NULL, \`wholesale_discount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`payment_terms\` enum ('prepaid', 'net30', 'net60') NOT NULL DEFAULT 'prepaid', \`payment_status\` enum ('unpaid', 'partial', 'paid', 'overdue') NOT NULL DEFAULT 'unpaid', \`due_date\` timestamp NULL, \`wholesale_account_id\` varchar(36) NULL, \`order_id\` varchar(36) NULL, UNIQUE INDEX \`REL_1f6aadb8fee39beb42217a4a53\` (\`order_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`wholesale_accounts\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`business_name\` varchar(200) NULL, \`country\` varchar(100) NOT NULL, \`credit_limit\` decimal(12,2) NOT NULL DEFAULT '0.00', \`current_balance\` decimal(12,2) NOT NULL DEFAULT '0.00', \`is_active\` tinyint NOT NULL DEFAULT 1, \`approved_at\` timestamp NULL, \`user_id\` varchar(36) NULL, \`enquiry_id\` varchar(36) NULL, \`tier_id\` varchar(36) NULL, \`approved_by\` varchar(36) NULL, UNIQUE INDEX \`REL_0765f37972455aaed4a454f468\` (\`user_id\`), UNIQUE INDEX \`REL_c324d938009d7880bb78cee399\` (\`enquiry_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`wholesale_tiers\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`name\` enum ('Bronze', 'Silver', 'Gold') NOT NULL, \`min_monthly_qty\` int NOT NULL DEFAULT '0', \`discount_percent\` decimal(5,2) NOT NULL, \`max_discount_amount\` decimal(10,2) NULL, \`free_shipping\` tinyint NOT NULL DEFAULT 0, \`min_order_amount\` decimal(10,2) NOT NULL DEFAULT '0.00', UNIQUE INDEX \`IDX_67d860e57eeb5117a43ba2a4cf\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`newsletter_subscribers\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`status\` enum ('active', 'unsubscribed') NOT NULL DEFAULT 'active', \`preferences\` json NULL, \`source\` enum ('footer', 'checkout', 'popup', 'wholesale_page') NOT NULL, \`unsubscribed_at\` timestamp NULL, \`user_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_0dc48416511f011f7de7b2a8f8\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`card_details\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`processor\` enum ('stripe', 'braintree') NOT NULL, \`last4\` varchar(4) NOT NULL, \`brand\` enum ('visa', 'mastercard', 'amex', 'discover') NOT NULL, \`auth_code\` varchar(50) NULL, \`charge_id\` varchar(100) NOT NULL, \`payment_id\` varchar(36) NULL, UNIQUE INDEX \`REL_43a10824578fe9b14b5671efa4\` (\`payment_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`payments\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`gateway\` enum ('paypal', 'stripe', 'braintree') NOT NULL, \`gateway_txn_id\` varchar(255) NULL, \`status\` enum ('pending', 'paid', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'pending', \`amount\` decimal(10,2) NOT NULL, \`currency\` varchar(3) NOT NULL DEFAULT 'USD', \`gateway_response\` json NULL, \`paid_at\` timestamp NULL, \`order_id\` varchar(36) NULL, UNIQUE INDEX \`REL_b2f7b823a21562eeca20e72b00\` (\`order_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`paypal_details\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`paypal_order_id\` varchar(100) NOT NULL, \`payer_email\` varchar(255) NULL, \`payer_id\` varchar(100) NULL, \`capture_id\` varchar(100) NULL, \`payment_id\` varchar(36) NULL, UNIQUE INDEX \`REL_833bfffac2b2889b561bcdf511\` (\`payment_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`addresses\` ADD CONSTRAINT \`FK_16aac8a9f6f9c1dd6bcb75ec023\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`oauth_state_tokens\` ADD CONSTRAINT \`FK_45d89cbb51fcd02d44689d70382\` FOREIGN KEY (\`provider_id\`) REFERENCES \`auth_providers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_sessions\` ADD CONSTRAINT \`FK_e9658e959c490b0a634dfc54783\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_sessions\` ADD CONSTRAINT \`FK_5dfdfb9abd03ef4c292b8f0806c\` FOREIGN KEY (\`identity_id\`) REFERENCES \`user_auth_identities\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_auth_identities\` ADD CONSTRAINT \`FK_ea3d52aa749cfe163316fc35e8a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_auth_identities\` ADD CONSTRAINT \`FK_01533d02ca2bcd0309fa7fd7bf0\` FOREIGN KEY (\`provider_id\`) REFERENCES \`auth_providers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`password_resetsEntity\` ADD CONSTRAINT \`FK_97277a34805255535e6a651221d\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`email_verifications\` ADD CONSTRAINT \`FK_c4f1838323ae1dff5aa00148915\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_enquiries\` ADD CONSTRAINT \`FK_6765770368178d41bc6cfa6763e\` FOREIGN KEY (\`handled_by\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_images\` ADD CONSTRAINT \`FK_4f166bb8c2bfcef2498d97b4068\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` ADD CONSTRAINT \`FK_6343513e20e2deab45edfce1316\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` ADD CONSTRAINT \`FK_f86951a0b6178a369becdce6460\` FOREIGN KEY (\`shape_id\`) REFERENCES \`nail_shapes\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` ADD CONSTRAINT \`FK_bf3e96b7fc720a0ea3a81953373\` FOREIGN KEY (\`size_id\`) REFERENCES \`nail_sizes\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_shape_pricings\` ADD CONSTRAINT \`FK_677b8c4ae4b901941c6f7892061\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_shape_pricings\` ADD CONSTRAINT \`FK_c33740984052c40de648861f703\` FOREIGN KEY (\`shape_id\`) REFERENCES \`nail_shapes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_product_pricings\` ADD CONSTRAINT \`FK_ba18a71be19b249b06c7ad37ac9\` FOREIGN KEY (\`wholesale_account_id\`) REFERENCES \`wholesale_accounts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_product_pricings\` ADD CONSTRAINT \`FK_fb42c6c02828d33baf768e6210c\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` ADD CONSTRAINT \`FK_6385a745d9e12a89b859bb25623\` FOREIGN KEY (\`cart_id\`) REFERENCES \`carts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` ADD CONSTRAINT \`FK_ede780fc2b865d1d1323e598038\` FOREIGN KEY (\`variant_id\`) REFERENCES \`product_variants\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`carts\` ADD CONSTRAINT \`FK_2ec1c94a977b940d85a4f498aea\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`carts\` ADD CONSTRAINT \`FK_475857843672bb30e9a8fb125d9\` FOREIGN KEY (\`guest_id\`) REFERENCES \`guest_checkouts\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkout_sessions\` ADD CONSTRAINT \`FK_4d9c73c6a14dc4c9b73eff59ff7\` FOREIGN KEY (\`cart_id\`) REFERENCES \`carts\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkout_sessions\` ADD CONSTRAINT \`FK_0fcf7372ed8c867428d29dfab53\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkout_sessions\` ADD CONSTRAINT \`FK_8df6998db4b280a205957b53863\` FOREIGN KEY (\`guest_id\`) REFERENCES \`guest_checkouts\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`coupon_restrictions\` ADD CONSTRAINT \`FK_c7dabedab5419708684e870a055\` FOREIGN KEY (\`coupon_id\`) REFERENCES \`coupons\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`coupon_user_whitelists\` ADD CONSTRAINT \`FK_dbb90b4e51b96934233dc88f659\` FOREIGN KEY (\`coupon_id\`) REFERENCES \`coupons\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`coupon_user_whitelists\` ADD CONSTRAINT \`FK_442ea69f314f4ff0f6d64107b81\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`coupon_usages\` ADD CONSTRAINT \`FK_56491a0d0010feb079b964e23b4\` FOREIGN KEY (\`coupon_id\`) REFERENCES \`coupons\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`coupon_usages\` ADD CONSTRAINT \`FK_579f1e1f0ccf35785bbbdebeb85\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`coupon_usages\` ADD CONSTRAINT \`FK_f017af60a02209a6b045f673ca1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`custom_size_requests\` ADD CONSTRAINT \`FK_a901090744e73bed821398691fe\` FOREIGN KEY (\`order_item_id\`) REFERENCES \`order_items\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_db2d0ea722e16e0fe8ab3bce111\` FOREIGN KEY (\`variant_id\`) REFERENCES \`product_variants\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_a922b820eeef29ac1c6800e826a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_4a7d03c27412dbfb47ac912b3e3\` FOREIGN KEY (\`guest_id\`) REFERENCES \`guest_checkouts\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_78885189e86df1ec808ea36a57e\` FOREIGN KEY (\`checkout_session_id\`) REFERENCES \`checkout_sessions\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_d7ca1e5c822bc4214114fe83e05\` FOREIGN KEY (\`shipping_method_id\`) REFERENCES \`shipping_methods\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_6284f0f60e4cb96c12ff96f0f15\` FOREIGN KEY (\`coupon_id\`) REFERENCES \`coupons\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_orders\` ADD CONSTRAINT \`FK_a9ab4f9727bd89915e18830ae21\` FOREIGN KEY (\`wholesale_account_id\`) REFERENCES \`wholesale_accounts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_orders\` ADD CONSTRAINT \`FK_1f6aadb8fee39beb42217a4a53d\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_accounts\` ADD CONSTRAINT \`FK_0765f37972455aaed4a454f4686\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_accounts\` ADD CONSTRAINT \`FK_c324d938009d7880bb78cee3990\` FOREIGN KEY (\`enquiry_id\`) REFERENCES \`wholesale_enquiries\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_accounts\` ADD CONSTRAINT \`FK_b20c2af7fd2aa8ef706bcf8a617\` FOREIGN KEY (\`tier_id\`) REFERENCES \`wholesale_tiers\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_accounts\` ADD CONSTRAINT \`FK_8fac8d260ccf527af7b6bd285ed\` FOREIGN KEY (\`approved_by\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`newsletter_subscribers\` ADD CONSTRAINT \`FK_dcd5c5b83f0fba1ccef75e09a4c\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`card_details\` ADD CONSTRAINT \`FK_43a10824578fe9b14b5671efa4b\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_b2f7b823a21562eeca20e72b006\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`paypal_details\` ADD CONSTRAINT \`FK_833bfffac2b2889b561bcdf5115\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`paypal_details\` DROP FOREIGN KEY \`FK_833bfffac2b2889b561bcdf5115\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_b2f7b823a21562eeca20e72b006\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`card_details\` DROP FOREIGN KEY \`FK_43a10824578fe9b14b5671efa4b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`newsletter_subscribers\` DROP FOREIGN KEY \`FK_dcd5c5b83f0fba1ccef75e09a4c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_accounts\` DROP FOREIGN KEY \`FK_8fac8d260ccf527af7b6bd285ed\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_accounts\` DROP FOREIGN KEY \`FK_b20c2af7fd2aa8ef706bcf8a617\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_accounts\` DROP FOREIGN KEY \`FK_c324d938009d7880bb78cee3990\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_accounts\` DROP FOREIGN KEY \`FK_0765f37972455aaed4a454f4686\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_orders\` DROP FOREIGN KEY \`FK_1f6aadb8fee39beb42217a4a53d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_orders\` DROP FOREIGN KEY \`FK_a9ab4f9727bd89915e18830ae21\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_6284f0f60e4cb96c12ff96f0f15\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_d7ca1e5c822bc4214114fe83e05\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_78885189e86df1ec808ea36a57e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_4a7d03c27412dbfb47ac912b3e3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_a922b820eeef29ac1c6800e826a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_db2d0ea722e16e0fe8ab3bce111\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`custom_size_requests\` DROP FOREIGN KEY \`FK_a901090744e73bed821398691fe\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`coupon_usages\` DROP FOREIGN KEY \`FK_f017af60a02209a6b045f673ca1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`coupon_usages\` DROP FOREIGN KEY \`FK_579f1e1f0ccf35785bbbdebeb85\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`coupon_usages\` DROP FOREIGN KEY \`FK_56491a0d0010feb079b964e23b4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`coupon_user_whitelists\` DROP FOREIGN KEY \`FK_442ea69f314f4ff0f6d64107b81\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`coupon_user_whitelists\` DROP FOREIGN KEY \`FK_dbb90b4e51b96934233dc88f659\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`coupon_restrictions\` DROP FOREIGN KEY \`FK_c7dabedab5419708684e870a055\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkout_sessions\` DROP FOREIGN KEY \`FK_8df6998db4b280a205957b53863\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkout_sessions\` DROP FOREIGN KEY \`FK_0fcf7372ed8c867428d29dfab53\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`checkout_sessions\` DROP FOREIGN KEY \`FK_4d9c73c6a14dc4c9b73eff59ff7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`carts\` DROP FOREIGN KEY \`FK_475857843672bb30e9a8fb125d9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`carts\` DROP FOREIGN KEY \`FK_2ec1c94a977b940d85a4f498aea\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_ede780fc2b865d1d1323e598038\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_6385a745d9e12a89b859bb25623\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_product_pricings\` DROP FOREIGN KEY \`FK_fb42c6c02828d33baf768e6210c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_product_pricings\` DROP FOREIGN KEY \`FK_ba18a71be19b249b06c7ad37ac9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_shape_pricings\` DROP FOREIGN KEY \`FK_c33740984052c40de648861f703\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_shape_pricings\` DROP FOREIGN KEY \`FK_677b8c4ae4b901941c6f7892061\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` DROP FOREIGN KEY \`FK_bf3e96b7fc720a0ea3a81953373\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` DROP FOREIGN KEY \`FK_f86951a0b6178a369becdce6460\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` DROP FOREIGN KEY \`FK_6343513e20e2deab45edfce1316\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_images\` DROP FOREIGN KEY \`FK_4f166bb8c2bfcef2498d97b4068\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wholesale_enquiries\` DROP FOREIGN KEY \`FK_6765770368178d41bc6cfa6763e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`email_verifications\` DROP FOREIGN KEY \`FK_c4f1838323ae1dff5aa00148915\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`password_resetsEntity\` DROP FOREIGN KEY \`FK_97277a34805255535e6a651221d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_auth_identities\` DROP FOREIGN KEY \`FK_01533d02ca2bcd0309fa7fd7bf0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_auth_identities\` DROP FOREIGN KEY \`FK_ea3d52aa749cfe163316fc35e8a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_sessions\` DROP FOREIGN KEY \`FK_5dfdfb9abd03ef4c292b8f0806c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_sessions\` DROP FOREIGN KEY \`FK_e9658e959c490b0a634dfc54783\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`oauth_state_tokens\` DROP FOREIGN KEY \`FK_45d89cbb51fcd02d44689d70382\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`addresses\` DROP FOREIGN KEY \`FK_16aac8a9f6f9c1dd6bcb75ec023\``,
    );
    await queryRunner.query(`DROP INDEX \`REL_833bfffac2b2889b561bcdf511\` ON \`paypal_details\``);
    await queryRunner.query(`DROP TABLE \`paypal_details\``);
    await queryRunner.query(`DROP INDEX \`REL_b2f7b823a21562eeca20e72b00\` ON \`payments\``);
    await queryRunner.query(`DROP TABLE \`payments\``);
    await queryRunner.query(`DROP INDEX \`REL_43a10824578fe9b14b5671efa4\` ON \`card_details\``);
    await queryRunner.query(`DROP TABLE \`card_details\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_0dc48416511f011f7de7b2a8f8\` ON \`newsletter_subscribers\``,
    );
    await queryRunner.query(`DROP TABLE \`newsletter_subscribers\``);
    await queryRunner.query(`DROP INDEX \`IDX_67d860e57eeb5117a43ba2a4cf\` ON \`wholesale_tiers\``);
    await queryRunner.query(`DROP TABLE \`wholesale_tiers\``);
    await queryRunner.query(
      `DROP INDEX \`REL_c324d938009d7880bb78cee399\` ON \`wholesale_accounts\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_0765f37972455aaed4a454f468\` ON \`wholesale_accounts\``,
    );
    await queryRunner.query(`DROP TABLE \`wholesale_accounts\``);
    await queryRunner.query(
      `DROP INDEX \`REL_1f6aadb8fee39beb42217a4a53\` ON \`wholesale_orders\``,
    );
    await queryRunner.query(`DROP TABLE \`wholesale_orders\``);
    await queryRunner.query(`DROP TABLE \`orders\``);
    await queryRunner.query(`DROP TABLE \`order_items\``);
    await queryRunner.query(
      `DROP INDEX \`REL_a901090744e73bed821398691f\` ON \`custom_size_requests\``,
    );
    await queryRunner.query(`DROP TABLE \`custom_size_requests\``);
    await queryRunner.query(`DROP INDEX \`IDX_e025109230e82925843f2a14c4\` ON \`coupons\``);
    await queryRunner.query(`DROP TABLE \`coupons\``);
    await queryRunner.query(`DROP TABLE \`coupon_usages\``);
    await queryRunner.query(`DROP TABLE \`coupon_user_whitelists\``);
    await queryRunner.query(`DROP TABLE \`coupon_restrictions\``);
    await queryRunner.query(`DROP TABLE \`shipping_methods\``);
    await queryRunner.query(
      `DROP INDEX \`REL_4d9c73c6a14dc4c9b73eff59ff\` ON \`checkout_sessions\``,
    );
    await queryRunner.query(`DROP TABLE \`checkout_sessions\``);
    await queryRunner.query(`DROP TABLE \`carts\``);
    await queryRunner.query(`DROP TABLE \`cart_items\``);
    await queryRunner.query(`DROP INDEX \`IDX_e469f913c3802e0c8343fff710\` ON \`guest_checkouts\``);
    await queryRunner.query(`DROP INDEX \`IDX_4ec75fbc2d863d7eaef8697e59\` ON \`guest_checkouts\``);
    await queryRunner.query(`DROP TABLE \`guest_checkouts\``);
    await queryRunner.query(`DROP TABLE \`wholesale_product_pricings\``);
    await queryRunner.query(`DROP INDEX \`IDX_464f927ae360106b783ed0b410\` ON \`products\``);
    await queryRunner.query(`DROP TABLE \`products\``);
    await queryRunner.query(`DROP TABLE \`product_shape_pricings\``);
    await queryRunner.query(`DROP TABLE \`nail_shapes\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_46f236f21640f9da218a063a86\` ON \`product_variants\``,
    );
    await queryRunner.query(`DROP TABLE \`product_variants\``);
    await queryRunner.query(`DROP INDEX \`IDX_a04742133cc6ad065b64249b33\` ON \`nail_sizes\``);
    await queryRunner.query(`DROP TABLE \`nail_sizes\``);
    await queryRunner.query(`DROP TABLE \`product_images\``);
    await queryRunner.query(`DROP TABLE \`wholesale_enquiries\``);
    await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_7939cc2e493281f265179fa86c\` ON \`email_verifications\``,
    );
    await queryRunner.query(`DROP TABLE \`email_verifications\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_5ebbbc8849edd34320cc2b3f60\` ON \`password_resetsEntity\``,
    );
    await queryRunner.query(`DROP TABLE \`password_resetsEntity\``);
    await queryRunner.query(`DROP TABLE \`user_auth_identities\``);
    await queryRunner.query(`DROP INDEX \`IDX_6596adb3b8927b35bda97e734a\` ON \`user_sessions\``);
    await queryRunner.query(`DROP TABLE \`user_sessions\``);
    await queryRunner.query(`DROP INDEX \`IDX_53014852294d24f1349591eade\` ON \`auth_providers\``);
    await queryRunner.query(`DROP TABLE \`auth_providers\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_91c3312657a32e0e44329ef199\` ON \`oauth_state_tokens\``,
    );
    await queryRunner.query(`DROP TABLE \`oauth_state_tokens\``);
    await queryRunner.query(`DROP TABLE \`addresses\``);
  }
}
