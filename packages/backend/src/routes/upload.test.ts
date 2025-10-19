import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import uploadRouter from "./upload";

// Mock the AWS SDK modules
vi.mock("@aws-sdk/client-s3", () => {
  const S3Client = vi.fn();
  const PutObjectCommand = vi.fn();
  return { S3Client, PutObjectCommand };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use("/upload", uploadRouter);

describe("アップロードAPI", async () => {
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.IMAGE_UPLOAD_BUCKET_NAME = "test-bucket";
    process.env.AWS_REGION = "ap-northeast-1";
  });

  describe("POST /image (署名付きURL発行)", () => {
    it("正しいリクエストで署名付きURLが発行されること", async () => {
      const mockSignedUrl =
        "https://test-bucket.s3.ap-northeast-1.amazonaws.com/some-signed-url";
      (getSignedUrl as vi.Mock).mockResolvedValue(mockSignedUrl);

      const res = await request(app)
        .post("/upload/image")
        .send({ fileName: "test.jpg", fileType: "image/jpeg" });

      expect(res.statusCode).toBe(200);
      expect(res.body.signedUrl).toBe(mockSignedUrl);
      expect(res.body.objectUrl).toContain("test.jpg");
      expect(getSignedUrl).toHaveBeenCalledOnce();
    });

    it("必須フィールドが不足している場合に400エラーを返すこと", async () => {
      const res = await request(app)
        .post("/upload/image")
        .send({ fileName: "test.jpg" }); // Missing fileType

      expect(res.statusCode).toBe(400);
    });
  });
});
