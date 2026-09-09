import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';

describe('正解選択肢の移行', () => {
  it('既存問題の選択肢・解答文を保持し、正解は未設定にする', () => {
    const db = new Database(':memory:');
    try {
      db.exec('CREATE TABLE Quiz (id TEXT PRIMARY KEY, choices TEXT, answerText TEXT);');
      db.prepare('INSERT INTO Quiz VALUES (?,?,?)').run('old', '["A","B"]', '以前の解答文');
      db.exec(readFileSync('prisma/migrations/0004_correct_choice/migration.sql', 'utf8'));
      expect(db.prepare('SELECT * FROM Quiz').get()).toEqual({ id: 'old', choices: '["A","B"]', answerText: '以前の解答文', correctChoiceIndex: null });
      db.exec('UPDATE Quiz SET correctChoiceIndex=0');
      expect(db.prepare('SELECT correctChoiceIndex FROM Quiz').get()).toEqual({ correctChoiceIndex: 0 });
    } finally { db.close(); }
  });
});
