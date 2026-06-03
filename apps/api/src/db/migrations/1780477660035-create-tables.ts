import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1780477660035 implements MigrationInterface {
    name = 'CreateTables1780477660035'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`twocheckout_details\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`checkout_session_id\` varchar(255) NOT NULL, \`ref_no\` varchar(100) NULL, \`merchant_order_ref\` varchar(255) NULL, \`amount_cents\` int NOT NULL, \`currency\` varchar(3) NOT NULL DEFAULT 'USD', \`status\` varchar(50) NOT NULL DEFAULT 'pending', \`payment_url\` varchar(1000) NULL, \`pay_method\` varchar(100) NULL, \`card_last4\` varchar(4) NULL, \`ipn_payload\` json NULL, \`gateway_response\` json NULL, \`payment_id\` varchar(36) NULL, UNIQUE INDEX \`REL_4d6ee157dc618422c96d47d764\` (\`payment_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`gateway\` \`gateway\` enum ('paypal', 'stripe', 'braintree', 'lemon_squeezy', 'airwallex', 'twocheckout') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`twocheckout_details\` ADD CONSTRAINT \`FK_4d6ee157dc618422c96d47d7649\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`twocheckout_details\` DROP FOREIGN KEY \`FK_4d6ee157dc618422c96d47d7649\``);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`gateway\` \`gateway\` enum ('paypal', 'stripe', 'braintree', 'lemon_squeezy', 'airwallex') NOT NULL`);
        await queryRunner.query(`DROP INDEX \`REL_4d6ee157dc618422c96d47d764\` ON \`twocheckout_details\``);
        await queryRunner.query(`DROP TABLE \`twocheckout_details\``);
    }

}
