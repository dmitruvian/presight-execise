import path from 'node:path';

const packageRoot = path.resolve(__dirname, '../../..');

const configuredDatabasePath = process.env.DATABASE_PATH ?? process.env.SERVER_DATABASE_PATH;

export const dataDir = process.env.SERVER_DATA_DIR
  ? path.resolve(process.env.SERVER_DATA_DIR)
  : path.join(packageRoot, 'data');

export const databasePath = configuredDatabasePath
  ? path.resolve(configuredDatabasePath)
  : path.join(dataDir, 'users.db');

export const clientDistDir = process.env.CLIENT_DIST_DIR
  ? path.resolve(process.env.CLIENT_DIST_DIR)
  : path.resolve(packageRoot, '..', 'client', 'dist');

export const port = Number.parseInt(process.env.PORT ?? '3000', 10);
