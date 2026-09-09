import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { hashPassword, verifyPassword } from '../src/password';

describe('参加者の移行', () => {
  it('既存行を保持し、同じ表示名を許可してIDの重複は拒否する', async () => {
    const db = new Database(':memory:');
    try {
      db.exec('CREATE TABLE Participant (id TEXT PRIMARY KEY, name TEXT, password TEXT, tournamentId TEXT); CREATE UNIQUE INDEX Participant_tournamentId_name_key ON Participant(tournamentId,name);');
      db.prepare('INSERT INTO Participant VALUES (?,?,?,?)').run('old', '以前の名前', 'oldpass1', 't');
      db.exec(readFileSync('prisma/migrations/0003_participant_credentials/migration.sql', 'utf8'));
      expect(db.prepare('SELECT * FROM Participant').get()).toMatchObject({ id: 'old', name: '以前の名前', password: 'oldpass1', loginId: null, loginAttempts: 0, loginWindowStart: null });
      const hash = await hashPassword('oldpass1');
      db.prepare('UPDATE Participant SET password=? WHERE id=?').run(hash, 'old');
      expect(await verifyPassword('oldpass1', hash)).toBe(true);
      expect(await verifyPassword('wrong', hash)).toBe(false);
      expect(await hashPassword('oldpass1')).not.toBe(hash);
      db.prepare('INSERT INTO Participant (id,name,tournamentId,loginId) VALUES (?,?,?,?)').run('new', '以前の名前', 't', 'user1');
      expect(() => db.prepare('INSERT INTO Participant (id,name,tournamentId,loginId) VALUES (?,?,?,?)').run('dup', '別の名前', 't', 'user1')).toThrow();
    } finally { db.close(); }
  });
});
