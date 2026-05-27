import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class R2Service implements OnModuleInit {
  private readonly logger = new Logger(R2Service.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.getOrThrow<string>('R2_ACCOUNT_ID');
    this.bucket = this.config.getOrThrow<string>('R2_BUCKET_NAME');
    this.publicUrl = this.config.getOrThrow<string>('R2_PUBLIC_URL').replace(/\/$/, '');

    // S3 API endpoint — must be the account-level R2 endpoint, NOT the public CDN URL.
    // Do NOT use forcePathStyle: Cloudflare R2 treats the full path as the object key,
    // so adding the bucket to the path (path-style) doubles it: /bucket/bucket/key.
    const endpoint =
      this.config.get<string>('R2_PRIVATE_URL') ?? `https://${accountId}.r2.cloudflarestorage.com`;

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  async onModuleInit() {
    // Configure CORS so the admin app can PUT files directly from the browser.
    // Runs on every start but is idempotent. Best-effort — failure is logged, not thrown.
    const appUrl = this.config.get<string>('APP_URL') ?? '';
    const origins = ['http://localhost:4201', 'http://localhost:4200'];
    if (appUrl && !origins.includes(appUrl)) origins.push(appUrl);

    try {
      await this.client.send(
        new PutBucketCorsCommand({
          Bucket: this.bucket,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedOrigins: origins,
                AllowedMethods: ['PUT'],
                AllowedHeaders: ['Content-Type'],
                MaxAgeSeconds: 3600,
              },
            ],
          },
        }),
      );
      this.logger.debug('R2 CORS configured for direct browser uploads');
    } catch (err) {
      this.logger.warn(
        `Could not configure R2 CORS automatically — direct uploads will fall back to server proxy. Error: ${(err as Error).message}`,
      );
    }
  }

  /**
   * Upload a buffer directly to R2.
   * Returns the public CDN URL of the uploaded object.
   */
  async upload(buffer: Buffer, mime = 'image/png', prefix = 'products'): Promise<string> {
    const key = `${prefix}/${randomUUID()}.${mime.split('/')[1] ?? 'png'}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mime,
      }),
    );

    this.logger.debug(`Uploaded ${key}`);
    return `${this.publicUrl}/${key}`;
  }

  /**
   * Generate a short-lived presigned PUT URL so the client can upload directly.
   * Returns both the presigned URL (for the PUT request) and the final public CDN URL.
   */
  async getPresignedUrl(
    key: string,
    contentType: string,
    expiresIn = 300,
  ): Promise<{ presignedUrl: string; publicUrl: string; key: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(this.client, command, { expiresIn });

    return {
      presignedUrl,
      publicUrl: `${this.publicUrl}/${key}`,
      key,
    };
  }

  /**
   * Generate a presigned PUT URL for a new file, auto-assigning a UUID key.
   * Public URL uses the same format as upload() for consistency.
   */
  async getPresignedUploadUrl(
    mime: string,
    prefix = 'products',
    expiresIn = 300,
  ): Promise<{ presignedUrl: string; publicUrl: string; key: string }> {
    const ext = mime.split('/')[1] ?? 'jpg';
    const key = `${prefix}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mime,
    });

    const presignedUrl = await getSignedUrl(this.client, command, { expiresIn });

    return {
      presignedUrl,
      publicUrl: `${this.publicUrl}/${key}`,
      key,
    };
  }

  /**
   * Delete an object by its storage key (not full URL).
   */
  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    this.logger.debug(`Deleted ${key}`);
  }

  /** Extract the storage key from a full public CDN URL. */
  keyFromUrl(url: string): string {
    return url.replace(`${this.publicUrl}/`, '');
  }
}
