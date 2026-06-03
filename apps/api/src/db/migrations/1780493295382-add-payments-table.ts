import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentsTable1780493295382 implements MigrationInterface {
    name = 'AddPaymentsTable1780493295382'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // twocheckout_details already created by migration 1780477660035 — skip
        await queryRunner.query(`CREATE TABLE \`nganluong_details\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`checkout_session_id\` varchar(36) NOT NULL, \`nl_token\` varchar(255) NULL, \`order_code\` varchar(150) NOT NULL, \`transaction_id\` varchar(100) NULL, \`amount_vnd\` bigint NOT NULL, \`payment_method\` varchar(50) NOT NULL, \`bank_code\` varchar(50) NOT NULL, \`status\` varchar(20) NOT NULL DEFAULT 'pending', \`checkout_response\` json NULL, \`order_check_response\` json NULL, \`webhook_payload\` json NULL, \`card_brand\` varchar(50) NULL, \`card_last4\` varchar(10) NULL, \`payment_id\` varchar(36) NULL, UNIQUE INDEX \`REL_cc8ca70b899b128dc220d2bd44\` (\`payment_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`onepay_details\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`checkout_session_id\` varchar(36) NOT NULL, \`merch_txn_ref\` varchar(40) NOT NULL, \`transaction_no\` varchar(50) NULL, \`txn_response_code\` varchar(10) NULL, \`amount_onepay\` bigint NOT NULL, \`card_list\` varchar(256) NULL, \`vpc_card\` varchar(20) NULL, \`pay_channel\` varchar(20) NULL, \`card_num\` varchar(32) NULL, \`status\` varchar(20) NOT NULL DEFAULT 'pending', \`callback_payload\` json NULL, \`query_dr_response\` json NULL, \`payment_id\` varchar(36) NULL, UNIQUE INDEX \`REL_3703ad2cf1ada72c37f5795924\` (\`payment_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`gateway\` \`gateway\` enum ('paypal', 'stripe', 'braintree', 'lemon_squeezy', 'airwallex', 'twocheckout', 'ngan_luong', 'onepay') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`nganluong_details\` ADD CONSTRAINT \`FK_cc8ca70b899b128dc220d2bd44e\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`onepay_details\` ADD CONSTRAINT \`FK_3703ad2cf1ada72c37f5795924b\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`onepay_details\` DROP FOREIGN KEY \`FK_3703ad2cf1ada72c37f5795924b\``);
        await queryRunner.query(`ALTER TABLE \`nganluong_details\` DROP FOREIGN KEY \`FK_cc8ca70b899b128dc220d2bd44e\``);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`gateway\` \`gateway\` enum ('paypal', 'stripe', 'braintree', 'lemon_squeezy', 'airwallex', 'twocheckout') NOT NULL`);
        await queryRunner.query(`DROP INDEX \`REL_3703ad2cf1ada72c37f5795924\` ON \`onepay_details\``);
        await queryRunner.query(`DROP TABLE \`onepay_details\``);
        await queryRunner.query(`DROP INDEX \`REL_cc8ca70b899b128dc220d2bd44\` ON \`nganluong_details\``);
        await queryRunner.query(`DROP TABLE \`nganluong_details\``);
    }

}
