import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAirwallexTable1780423510007 implements MigrationInterface {
    name = 'AddAirwallexTable1780423510007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`airwallex_details\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`checkout_session_id\` varchar(255) NOT NULL, \`payment_intent_id\` varchar(255) NULL, \`checkout_session_ref\` varchar(255) NULL, \`amount_cents\` int NOT NULL, \`currency\` varchar(3) NOT NULL DEFAULT 'USD', \`status\` varchar(50) NOT NULL DEFAULT 'pending', \`customer_id\` varchar(255) NULL, \`payment_method_id\` varchar(255) NULL, \`payment_method_types\` text NULL, \`client_secret\` varchar(500) NULL, \`card_brand\` varchar(50) NULL, \`card_last4\` varchar(4) NULL, \`allow_save_card\` tinyint NOT NULL DEFAULT 0, \`webhook_payload\` json NULL, \`gateway_response\` json NULL, \`payment_id\` varchar(36) NULL, UNIQUE INDEX \`REL_bd9ea459da974733d8823cd3cd\` (\`payment_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`card_details\` CHANGE \`brand\` \`brand\` enum ('visa', 'mastercard', 'amex', 'discover', 'jcb') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`gateway\` \`gateway\` enum ('paypal', 'stripe', 'braintree', 'lemon_squeezy', 'airwallex') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`airwallex_details\` ADD CONSTRAINT \`FK_bd9ea459da974733d8823cd3cd9\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`airwallex_details\` DROP FOREIGN KEY \`FK_bd9ea459da974733d8823cd3cd9\``);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`gateway\` \`gateway\` enum ('paypal', 'stripe', 'braintree', 'lemon_squeezy') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`card_details\` CHANGE \`brand\` \`brand\` enum ('visa', 'mastercard', 'amex', 'discover') NOT NULL`);
        await queryRunner.query(`DROP INDEX \`REL_bd9ea459da974733d8823cd3cd\` ON \`airwallex_details\``);
        await queryRunner.query(`DROP TABLE \`airwallex_details\``);
    }

}
