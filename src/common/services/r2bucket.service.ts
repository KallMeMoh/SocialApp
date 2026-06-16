import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  R2_ACCESS_KEY_ID,
  R2_ACCOUNT_ID,
  R2_BUCKET_NAME,
  R2_SECRET_ACCESS_KEY,
} from '../../config/index.js';

export class R2BucketService {
  private _client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  async generateUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    return await getSignedUrl(this._client, command, { expiresIn: 60 });
  }

  async generateReadUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    return await getSignedUrl(this._client, command, {
      expiresIn: 60 * 60 * 6,
    });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await this._client.send(command);
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this._client.send(
        new HeadObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
        }),
      );
      return true;
    } catch (err) {
      return false;
    }
  }
}

const r2bucketService = new R2BucketService();
export default r2bucketService;
