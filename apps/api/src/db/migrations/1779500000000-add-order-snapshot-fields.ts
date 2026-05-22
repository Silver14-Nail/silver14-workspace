import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderSnapshotFields1779500000000 implements MigrationInterface {
    name = 'AddOrderSnapshotFields1779500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`product_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`product_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`product_slug\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`sku\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`thumbnail\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`coupon_code\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`coupon_discount_type\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`coupon_discount_value\` decimal(10,2) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`coupon_discount_value\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`coupon_discount_type\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`coupon_code\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`thumbnail\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`sku\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`product_slug\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`product_name\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`product_id\``);
    }
}
