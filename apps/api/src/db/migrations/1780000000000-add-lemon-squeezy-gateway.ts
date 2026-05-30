import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLemonSqueezyGateway1780000000000 implements MigrationInterface {
  name = 'AddLemonSqueezyGateway1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payments\` MODIFY COLUMN \`gateway\` ENUM('paypal','stripe','braintree','lemon_squeezy') NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payments\` MODIFY COLUMN \`gateway\` ENUM('paypal','stripe','braintree') NOT NULL`,
    );
  }
}
