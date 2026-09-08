import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseDocument } from 'yaml';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../cloudformation/application.yaml', import.meta.url), 'utf8');
const template = parseDocument(source, { logLevel: 'silent' }).toJS();

test('DBを非公開にし、NATとコンテナ配布を作成しない', () => {
  assert.equal(template.Resources.Database.Properties.PubliclyAccessible, false);
  assert.equal(template.Resources.Database.Properties.MultiAZ, false);
  assert.equal(template.Resources.Database.Properties.StorageEncrypted, true);
  const types = Object.values(template.Resources as Record<string, { Type: string }>).map(resource => resource.Type);
  assert.ok(!types.includes('AWS::EC2::NatGateway'));
  assert.ok(!types.includes('AWS::ECR::Repository'));
  assert.equal(template.Resources.Backend.Properties.Runtime, 'nodejs24.x');
});

test('SPA書き換えがAPIエラーやアセットをHTMLへ変換しない', () => {
  const handler = runInNewContext(`${template.Resources.SpaRewrite.Properties.FunctionCode}; handler;`);
  for (const uri of ['/', '/gather', '/gather/tournaments/123', '/terms', '/privacy', '/contact']) assert.equal(handler({ request: { uri } }).uri, '/index.html');
  for (const uri of ['/api/quizzes/missing', '/assets/app.js', '/uploads/example.png']) assert.equal(handler({ request: { uri } }).uri, uri);
});

test('画像とバックアップのバケットは公開しない', () => {
  for (const name of ['Frontend', 'Uploads', 'Backups']) {
    assert.equal(template.Resources[name].Properties.PublicAccessBlockConfiguration.BlockPublicPolicy, true);
  }
  assert.equal(template.Resources.Maintenance.Properties.ReservedConcurrentExecutions, 1);
});

test('全環境で同じ業務テーブル定義を利用する', async () => {
  const schemas = await Promise.all(['schema.prisma', 'schema.test.prisma', 'schema.e2e.prisma', 'schema.postgres.prisma'].map(name => readFile(new URL(`../backend/prisma/${name}`, import.meta.url), 'utf8')));
  const models = schemas.map(schema => schema.slice(schema.indexOf('model Tournament')).replace(/\/\/[^\n]*/g, '').replace(/\s+/g, ''));
  for (const model of models) assert.equal(model, models[0]);
});
