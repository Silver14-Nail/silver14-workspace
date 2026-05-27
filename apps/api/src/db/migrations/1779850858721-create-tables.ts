import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1779850858721 implements MigrationInterface {
    name = 'CreateTables1779850858721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`checkout_sessions\` ADD \`coupon_discount_type\` varchar(50) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`checkout_sessions\` DROP COLUMN \`coupon_discount_type\``);
    }

}
