import { MigrationInterface, QueryRunner } from 'typeorm';

// Speeds up listProducts()'s infinite-scroll query: WHERE type + isActive,
// ORDER BY createdAt (the default sort). Without this MySQL was filtering
// off the single-column `type` index then filesorting the matched rows by
// hand — with it, it reads rows already in the right order straight off
// the index (confirmed via EXPLAIN: "Using filesort" goes away).
export class AddProductListingIndex1785784532844 implements MigrationInterface {
  name = 'AddProductListingIndex1785784532844';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX \`IDX_products_type_active_created\` ON \`products\` (\`type\`, \`is_active\`, \`created_at\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_products_type_active_created\` ON \`products\``);
  }
}
