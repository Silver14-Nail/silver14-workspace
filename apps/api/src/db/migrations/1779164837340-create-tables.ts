import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1779164837340 implements MigrationInterface {
    name = 'CreateTables1779164837340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`password_resetsEntity\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`token_hash\` varchar(255) NOT NULL, \`is_used\` tinyint NOT NULL DEFAULT 0, \`expires_at\` timestamp NOT NULL, \`user_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_5ebbbc8849edd34320cc2b3f60\` (\`token_hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`password_resetsEntity\` ADD CONSTRAINT \`FK_97277a34805255535e6a651221d\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`password_resetsEntity\` DROP FOREIGN KEY \`FK_97277a34805255535e6a651221d\``);
        await queryRunner.query(`DROP INDEX \`IDX_5ebbbc8849edd34320cc2b3f60\` ON \`password_resetsEntity\``);
        await queryRunner.query(`DROP TABLE \`password_resetsEntity\``);
    }

}
