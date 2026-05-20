import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVariantImageFields1779300000000 implements MigrationInterface {
  name = 'AddVariantImageFields1779300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_images\` ADD \`is_main\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` ADD \`sku\` varchar(100) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` ADD UNIQUE INDEX \`IDX_product_variants_sku\` (\`sku\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` ADD \`is_available\` tinyint NOT NULL DEFAULT 1`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` DROP INDEX \`IDX_product_variants_sku\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` DROP COLUMN \`is_available\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` DROP COLUMN \`sku\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_images\` DROP COLUMN \`is_main\``,
    );
  }
}
