import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';

describe('問題枠の追加マイグレーション', () => {
  it('既存行を保持し、旧問題を選択肢なしの通常問題として移行する', () => {
    const db = new Database(':memory:');
    try {
      db.exec('CREATE TABLE "Tournament" (id TEXT PRIMARY KEY, points TEXT); CREATE TABLE "Quiz" (id TEXT PRIMARY KEY, questionText TEXT);');
      db.prepare('INSERT INTO "Tournament" VALUES (?, ?)').run('t', '10,20');
      db.prepare('INSERT INTO "Quiz" VALUES (?, ?)').run('q', '以前の問題');
      db.exec(readFileSync('prisma/migrations/0002_question_slots/migration.sql', 'utf8'));
      expect(db.prepare('SELECT * FROM "Tournament"').get()).toEqual({ id: 't', points: '10,20', questionSlots: null });
      expect(db.prepare('SELECT * FROM "Quiz"').get()).toEqual({ id: 'q', questionText: '以前の問題', label: null, choiceCount: 0, choices: '[]' });
    } finally { db.close(); }
  });
});
