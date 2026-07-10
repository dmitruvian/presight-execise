import { clientDistDir, port } from './infrastructure/config/config';
import { initializeSchema, openDatabase } from './infrastructure/database/sqlite';
import { SqliteUsersRepository } from './infrastructure/persistence/sqliteUsersRepository';
import { createApp } from './presentation/http/app';

const db = openDatabase();
initializeSchema(db);

const app = createApp({
  clientDistDir,
  usersRepository: new SqliteUsersRepository(db)
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
