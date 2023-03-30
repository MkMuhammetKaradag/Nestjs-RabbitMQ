import { MigrationInterface, QueryRunner } from "typeorm";

export class ThirdMigration1680169829272 implements MigrationInterface {
    name = 'ThirdMigration1680169829272'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "firstName" TO "name"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "name" TO "firstName"`);
    }

}
