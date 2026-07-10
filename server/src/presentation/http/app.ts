import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { getUsers, type UsersRepository } from '../../application/users/getUsers';
import { BadRequestError } from '../../domain/errors';
import { parseUsersQuery } from './parseUsersQuery';

type AppDependencies = {
  clientDistDir: string;
  usersRepository: UsersRepository;
};

export function createApp({ clientDistDir, usersRepository }: AppDependencies): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/users', (req, res, next) => {
    try {
      res.json(getUsers(usersRepository, parseUsersQuery(req)));
    } catch (error) {
      next(error);
    }
  });

  if (fs.existsSync(clientDistDir)) {
    app.use(express.static(clientDistDir));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(clientDistDir, 'index.html'));
    });
  }

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof BadRequestError) {
      res.status(400).json({ error: error.message });
      return;
    }

    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
