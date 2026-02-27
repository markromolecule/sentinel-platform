import { prisma } from './db';

export const dbClient = prisma.$kysely;

export type DbClient = typeof dbClient;
