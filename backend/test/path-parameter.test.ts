import { describe, expect, it } from 'vitest';
import { pathParameter } from '../src/api-helper';

describe('ルートパラメーター', () => {
  it('単一のIDをそのまま返す', () => { expect(pathParameter({ id: 'id' }, 'id')).toBe('id'); });
  it('配列や欠落したIDはDBに渡さない', () => {
    expect(() => pathParameter({ id: ['a', 'b'] }, 'id')).toThrow();
    expect(() => pathParameter({}, 'id')).toThrow();
  });
});
