import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import uploadRouter from '../../src/routes/upload';
import { errorHandler } from '../../src/middleware/errorHandler';

// AWS SDK関連のモジュールは、外部との通信を行わないようにモック化する
vi.mock('@aws-sdk/client-s3', () => {
  const S3Client = vi.fn();
  const PutObjectCommand = vi.fn();
  return { S3Client, PutObjectCommand };
});

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use('/upload', uploadRouter);
app.use(errorHandler);

describe('アップロードAPI', async () => {
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.IMAGE_UPLOAD_BUCKET_NAME = 'test-bucket';
    process.env.AWS_REGION = 'ap-northeast-1';
  });

  describe('POST /image (署名付きURL発行)', () => {
    it.each([['video/mp4', 'mp4'], ['audio/mpeg', 'mp3'], ['audio/wav', 'wav']])('メディア %s の署名にサイズと形式を含める', async (fileType, extension) => {
      vi.mocked(getSignedUrl).mockResolvedValue('https://example.com/signed');
      const res = await request(app).post('/upload/media').send({ fileName: 'untrusted.html', fileType, fileSize: 1024, tournamentId: 't-id', participantId: 'p-id' });
      expect(res.status).toBe(200);
      expect(res.body.objectUrl).toMatch(new RegExp(`\\.${extension}$`));
      const { PutObjectCommand } = await import('@aws-sdk/client-s3');
      expect(PutObjectCommand).toHaveBeenCalledWith(expect.objectContaining({ ContentType: fileType, ContentLength: 1024 }));
    });

    it.each([
      { fileType: 'text/html' }, { fileType: 'video/quicktime' }, { fileSize: 0 },
      { fileSize: 104857601 }, { fileSize: '1024' }, { tournamentId: '../outside' }, { participantId: {} },
    ])('不正なメディア署名リクエストを拒否する: %j', async (override) => {
      const res = await request(app).post('/upload/media').send({ fileName: 'movie.mp4', fileType: 'video/mp4', fileSize: 1024, tournamentId: 't-id', participantId: 'p-id', ...override });
      expect(res.status).toBe(400);
      expect(getSignedUrl).not.toHaveBeenCalled();
    });
    it('正しいリクエストで署名付きURLが発行されること', async () => {
      const mockSignedUrl = 'https://test-bucket.s3.ap-northeast-1.amazonaws.com/some-signed-url';
      (getSignedUrl as vi.Mock).mockResolvedValue(mockSignedUrl);

      const res = await request(app).post('/upload/image').send({
        fileName: 'test.jpg',
        fileType: 'image/jpeg',
        tournamentId: 'test-tournament-id',
        participantId: 'test-participant-id',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.signedUrl).toBe(mockSignedUrl);
      expect(res.body.objectUrl).toMatch(/\/uploads\/test-tournament-id\/test-participant-id\/.*\.jpg$/);
      expect(getSignedUrl).toHaveBeenCalledOnce();
    });

    it('必須フィールドが不足している場合に400エラーを返すこと', async () => {
      // fileTypeフィールドが欠けているため、バリデーションエラーとなることを期待する
      const res = await request(app).post('/upload/image').send({ fileName: 'test.jpg' });

      expect(res.statusCode).toBe(400);
    });
  });
});
