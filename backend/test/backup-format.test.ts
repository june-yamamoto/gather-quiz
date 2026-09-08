import { describe, expect, it } from 'vitest';
import { encodeBackup, decodeBackup } from '../src/backup-format';

describe('DBバックアップ形式', () => {
  it('日本語とnullを保持して復元できる', () => {
    const tables = { Tournament: [{ id: 'a', name: '日本語', regulation: null }], Participant: [], Quiz: [] };
    expect(decodeBackup(encodeBackup(tables, 'schema-v1'), 'schema-v1').tables).toEqual(tables);
  });

  it('異なるスキーマのバックアップを拒否する', () => {
    const bytes = encodeBackup({ Tournament: [], Participant: [], Quiz: [] }, 'schema-v1');
    expect(() => decodeBackup(bytes, 'schema-v2')).toThrow('スキーマ');
  });

  it('破損したバックアップを拒否する', () => {
    expect(() => decodeBackup(Buffer.from('broken'), 'schema-v1')).toThrow();
  });
});
