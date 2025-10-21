import { Router, Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const router = Router();

// 環境変数がモジュール読み込み時に評価されることを防ぐため、S3クライアントの初期化を関数内で行う
const getS3Client = () => new S3Client({ region: process.env.AWS_REGION || 'ap-northeast-1' });

router.post('/image', async (req: Request, res: Response) => {
  // テスト実行時など、環境変数の動的な変更に対応するため、リクエストハンドラ内で環境変数を評価する
  const imageUploadBucket = process.env.IMAGE_UPLOAD_BUCKET_NAME;
  const awsRegion = process.env.AWS_REGION || 'ap-northeast-1';

  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName and fileType are required' });
    }

    if (!imageUploadBucket) {
      console.error('IMAGE_UPLOAD_BUCKET_NAME environment variable is not set.');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const s3Client = getS3Client();
    const key = `uploads/${Date.now()}-${fileName}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: imageUploadBucket,
      Key: key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600,
    });

    res.json({
      signedUrl,
      objectUrl: `https://${imageUploadBucket}.s3.${awsRegion}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

export default router;
