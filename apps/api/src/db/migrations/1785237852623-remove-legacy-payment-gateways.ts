import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveLegacyPaymentGateways1785237852623 implements MigrationInterface {
    name = 'RemoveLegacyPaymentGateways1785237852623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`airwallex_details\` DROP FOREIGN KEY \`FK_bd9ea459da974733d8823cd3cd9\``);
        await queryRunner.query(`ALTER TABLE \`twocheckout_details\` DROP FOREIGN KEY \`FK_4d6ee157dc618422c96d47d7649\``);
        await queryRunner.query(`ALTER TABLE \`nganluong_details\` DROP FOREIGN KEY \`FK_cc8ca70b899b128dc220d2bd44e\``);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`gateway\` \`gateway\` enum ('paypal', 'stripe', 'braintree', 'onepay') NOT NULL`);
        await queryRunner.query(`DROP INDEX \`REL_bd9ea459da974733d8823cd3cd\` ON \`airwallex_details\``);
        await queryRunner.query(`DROP TABLE \`airwallex_details\``);
        await queryRunner.query(`DROP INDEX \`REL_4d6ee157dc618422c96d47d764\` ON \`twocheckout_details\``);
        await queryRunner.query(`DROP TABLE \`twocheckout_details\``);
        await queryRunner.query(`DROP INDEX \`REL_cc8ca70b899b128dc220d2bd44\` ON \`nganluong_details\``);
        await queryRunner.query(`DROP TABLE \`nganluong_details\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`nganluong_details\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`checkout_session_id\` varchar(36) NOT NULL, \`nl_token\` varchar(255) NULL, \`order_code\` varchar(150) NOT NULL, \`transaction_id\` varchar(100) NULL, \`amount_vnd\` bigint NOT NULL, \`payment_method\` varchar(50) NOT NULL, \`bank_code\` varchar(50) NOT NULL, \`status\` varchar(20) NOT NULL DEFAULT 'pending', \`checkout_response\` json NULL, \`order_check_response\` json NULL, \`webhook_payload\` json NULL, \`card_brand\` varchar(50) NULL, \`card_last4\` varchar(10) NULL, \`payment_id\` varchar(36) NULL, UNIQUE INDEX \`REL_cc8ca70b899b128dc220d2bd44\` (\`payment_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`twocheckout_details\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`checkout_session_id\` varchar(255) NOT NULL, \`ref_no\` varchar(100) NULL, \`merchant_order_ref\` varchar(255) NULL, \`amount_cents\` int NOT NULL, \`currency\` varchar(3) NOT NULL DEFAULT 'USD', \`status\` varchar(50) NOT NULL DEFAULT 'pending', \`payment_url\` varchar(1000) NULL, \`pay_method\` varchar(100) NULL, \`card_last4\` varchar(4) NULL, \`ipn_payload\` json NULL, \`gateway_response\` json NULL, \`payment_id\` varchar(36) NULL, UNIQUE INDEX \`REL_4d6ee157dc618422c96d47d764\` (\`payment_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`airwallex_details\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`checkout_session_id\` varchar(255) NOT NULL, \`payment_intent_id\` varchar(255) NULL, \`checkout_session_ref\` varchar(255) NULL, \`amount_cents\` int NOT NULL, \`currency\` varchar(3) NOT NULL DEFAULT 'USD', \`status\` varchar(50) NOT NULL DEFAULT 'pending', \`customer_id\` varchar(255) NULL, \`payment_method_id\` varchar(255) NULL, \`payment_method_types\` text NULL, \`client_secret\` varchar(500) NULL, \`card_brand\` varchar(50) NULL, \`card_last4\` varchar(4) NULL, \`allow_save_card\` tinyint NOT NULL DEFAULT 0, \`webhook_payload\` json NULL, \`gateway_response\` json NULL, \`payment_id\` varchar(36) NULL, UNIQUE INDEX \`REL_bd9ea459da974733d8823cd3cd\` (\`payment_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`gateway\` \`gateway\` enum ('paypal', 'stripe', 'braintree', 'lemon_squeezy', 'airwallex', 'twocheckout', 'ngan_luong', 'onepay') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`nganluong_details\` ADD CONSTRAINT \`FK_cc8ca70b899b128dc220d2bd44e\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`twocheckout_details\` ADD CONSTRAINT \`FK_4d6ee157dc618422c96d47d7649\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`airwallex_details\` ADD CONSTRAINT \`FK_bd9ea459da974733d8823cd3cd9\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
