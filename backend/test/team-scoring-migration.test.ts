import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
describe('チーム採点の移行', () => {
  it('既存の大会・問題を保持し、チームなし・未判定で開始する', () => {
    const db = new Database(':memory:');
    try {
      db.exec('CREATE TABLE Tournament (id TEXT); CREATE TABLE Quiz (id TEXT, answerText TEXT); INSERT INTO Tournament VALUES (\'old\'); INSERT INTO Quiz VALUES (\'q\',\'既存の解答\');');
      db.exec(readFileSync('prisma/migrations/0005_team_scoring/migration.sql', 'utf8'));
      expect(db.prepare('SELECT * FROM Tournament').get()).toEqual({ id: 'old', teams: '[]' });
      expect(db.prepare('SELECT * FROM Quiz').get()).toEqual({ id: 'q', answerText: '既存の解答', answerRevealed: 0, judgments: '{}' });
    } finally { db.close(); }
  });
});
