import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCollections1779287326115 implements MigrationInterface {
  name = 'AddCollections1779287326115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`collections\` (
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` timestamp(6) NULL,
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(200) NOT NULL,
        \`slug\` varchar(255) NOT NULL,
        \`description\` text NULL,
        \`short_description\` varchar(500) NULL,
        \`image\` varchar(500) NULL,
        \`banner_image\` varchar(500) NULL,
        \`seo_title\` varchar(200) NULL,
        \`seo_description\` varchar(500) NULL,
        \`is_featured\` tinyint NOT NULL DEFAULT 0,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`sort_order\` int NOT NULL DEFAULT 0,
        UNIQUE INDEX \`IDX_collections_slug\` (\`slug\`),
        INDEX \`IDX_collections_is_active\` (\`is_active\`),
        INDEX \`IDX_collections_is_featured\` (\`is_featured\`),
        INDEX \`IDX_collections_sort_order\` (\`sort_order\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `CREATE TABLE \`product_collections\` (
        \`collection_id\` varchar(36) NOT NULL,
        \`product_id\` varchar(36) NOT NULL,
        INDEX \`IDX_product_collections_collection\` (\`collection_id\`),
        INDEX \`IDX_product_collections_product\` (\`product_id\`),
        PRIMARY KEY (\`collection_id\`, \`product_id\`)
      ) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `ALTER TABLE \`product_collections\`
        ADD CONSTRAINT \`FK_product_collections_collection\`
        FOREIGN KEY (\`collection_id\`) REFERENCES \`collections\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE \`product_collections\`
        ADD CONSTRAINT \`FK_product_collections_product\`
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_collections\` DROP FOREIGN KEY \`FK_product_collections_product\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_collections\` DROP FOREIGN KEY \`FK_product_collections_collection\``,
    );
    await queryRunner.query(`DROP TABLE \`product_collections\``);
    await queryRunner.query(`DROP TABLE \`collections\``);
  }
}
