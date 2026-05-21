import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderFields1779287326114 implements MigrationInterface {
  name = 'AddOrderFields1779287326114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`carrier\` varchar(100) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`internal_notes\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`internal_notes\``);
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`carrier\``);
  }
}
