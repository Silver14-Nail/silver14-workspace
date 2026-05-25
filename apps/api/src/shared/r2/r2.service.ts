import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.getOrThrow<string>('R2_ACCOUNT_ID');
    const endpoint =
      this.config.get<string>('R2_PRIVATE_URL') ?? `https://${accountId}.r2.cloudflarestorage.com`;

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      forcePathStyle: true, // R2 requires path-style: endpoint/{bucket}/{key}
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
      },
      // Disable automatic CRC32 checksums — browser fetch can't compute them,
      // so presigned PUT URLs must not require them.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });

    this.bucket = this.config.getOrThrow<string>('R2_BUCKET_NAME');
    this.publicUrl = this.config.getOrThrow<string>('R2_PUBLIC_URL');
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
