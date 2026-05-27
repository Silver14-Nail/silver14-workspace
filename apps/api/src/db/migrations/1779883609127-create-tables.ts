import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1779883609127 implements MigrationInterface {
    name = 'CreateTables1779883609127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`color_name\` varchar(100) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`color_name\``);
    }

}
