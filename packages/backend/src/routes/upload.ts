import { Router, Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const router = Router();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-1",
});
const IMAGE_UPLOAD_BUCKET = process.env.IMAGE_UPLOAD_BUCKET_NAME;

router.post("/image", async (req: Request, res: Response) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res
        .status(400)
        .json({ error: "fileName and fileType are required" });
    }

    if (!IMAGE_UPLOAD_BUCKET) {
      console.error(
        "IMAGE_UPLOAD_BUCKET_NAME environment variable is not set.",
      );
      return res.status(500).json({ error: "Server configuration error" });
    }

    const key = `uploads/${Date.now()}-${fileName}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: IMAGE_UPLOAD_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600,
    }); // URL expires in 1 hour

    res.json({
      signedUrl,
      objectUrl: `https://${IMAGE_UPLOAD_BUCKET}.s3.${process.env.AWS_REGION || "ap-northeast-1"}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
});

export default router;
