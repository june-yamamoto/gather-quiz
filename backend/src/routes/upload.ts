import { Router, Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, pathToUploadImage, pathToUploadMedia } from '../api-helper';
import { BadRequestError } from '../errors/HttpErrors';
import { mediaExtensions } from '../media-validation';

const router = Router();
/** mount先に合わせて署名発行の相対パスを得る。 */
const uploadRouterPath = (path: string) => path.substring(pathToUploadImage().replace('/image', '').length);
const imageExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

/** 署名でサイズ・MIMEを固定し、ファイル名によるHTML配置やパス操作を防ぐ。 */
const signUpload = (media: boolean) =>
  asyncHandler(async (req: Request, res: Response) => {
    const { fileName, fileType, fileSize, tournamentId, participantId } = req.body;
    const extensions = media ? mediaExtensions : imageExtensions;
    if (
      typeof fileName !== 'string' ||
      !fileName ||
      fileName.length > 255 ||
      typeof fileType !== 'string' ||
      !Object.hasOwn(extensions, fileType) ||
      typeof tournamentId !== 'string' ||
      !/^[\w-]{1,100}$/.test(tournamentId) ||
      typeof participantId !== 'string' ||
      !/^[\w-]{1,100}$/.test(participantId)
    ) {
      throw new BadRequestError('ファイル形式またはアップロード先が不正です。');
    }
    // 既存の画像クライアントとの互換性のため、画像だけはサイズ省略を許容する。
    if (
      (media || fileSize !== undefined) &&
      (!Number.isSafeInteger(fileSize) || fileSize <= 0 || fileSize > (media ? 100 : 10) * 1024 * 1024)
    ) {
      throw new BadRequestError(
        media ? '動画・音声は1バイト以上100 MB以下にしてください。' : '画像は1バイト以上10 MB以下にしてください。'
      );
    }
    const bucket = process.env.IMAGE_UPLOAD_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'ap-northeast-1';
    if (!bucket) throw new Error('Upload bucket is not configured');
    const key = 'uploads/' + tournamentId + '/' + participantId + '/' + uuidv4() + '.' + extensions[fileType];
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
      ...(fileSize !== undefined ? { ContentLength: fileSize } : {}),
    });
    const signedUrl = await getSignedUrl(new S3Client({ region }), command, { expiresIn: 3600 });
    res.json({
      signedUrl,
      objectUrl:
        (process.env.IMAGE_PUBLIC_BASE_URL || 'https://' + bucket + '.s3.' + region + '.amazonaws.com') + '/' + key,
    });
  });

router.post(uploadRouterPath(pathToUploadImage()), signUpload(false));
router.post(uploadRouterPath(pathToUploadMedia()), signUpload(true));
export default router;
