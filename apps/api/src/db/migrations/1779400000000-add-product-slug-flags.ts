import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductSlugFlags1779400000000 implements MigrationInterface {
  name = 'AddProductSlugFlags1779400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`products\` ADD \`slug\` varchar(255) NULL`);
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD UNIQUE INDEX \`IDX_products_slug\` (\`slug\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD \`is_new\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD \`is_best_seller\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`products\` DROP INDEX \`IDX_products_slug\``);
    await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`slug\``);
    await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`is_new\``);
    await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`is_best_seller\``);
  }
}
