import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { Client as MinioClient } from 'minio';
import { randomUUID } from 'node:crypto';
interface UploadFile {
  buffer: Buffer;
  originalname?: string;
  mimetype?: string;
}

@Injectable()
export class FilesService {
  private readonly minioClient?: MinioClient;
  private readonly bucketName: string;
  private readonly presignedExpirySeconds: number;
  private readonly minioEnabled: boolean;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT ?? 'localhost';
    const port = Number(process.env.MINIO_PORT ?? 9000);
    const useSSL = (process.env.MINIO_USE_SSL ?? 'false').toLowerCase() === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY ?? '';
    const secretKey = process.env.MINIO_SECRET_KEY ?? '';

    this.bucketName = process.env.MINIO_BUCKET ?? 'hotel-media';
    this.presignedExpirySeconds = Number(process.env.MINIO_PRESIGNED_EXPIRES ?? 3600);
    this.minioEnabled = Boolean(accessKey && secretKey);
    if (this.minioEnabled) {
      this.minioClient = new MinioClient({
        endPoint: endpoint,
        port,
        useSSL,
        accessKey,
        secretKey,
      });
    }
  }

  async upload(files?: unknown[]) {
    if (!this.minioEnabled || !this.minioClient) {
      throw new BadRequestException('MinIO access key/secret key are required');
    }
    if (!Array.isArray(files) || files.length === 0) {
      throw new BadRequestException('Files are required');
    }

    const results: { link: string; expires?: string }[] = [];

    for (const file of files) {
      results.push(await this.uploadOne(file));
    }

    return results.length === 1 ? results[0] : results;
  }

  private async uploadOne(file?: unknown) {
    if (!this.isUploadFile(file)) {
      throw new BadRequestException('File is required');
    }
    if (!this.minioClient) {
      throw new BadRequestException('MinIO access key/secret key are required');
    }

    const filename = file.originalname || `upload-${randomUUID()}`;
    const contentType = file.mimetype || 'application/octet-stream';
    const objectName = `${randomUUID()}-${filename}`;

    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName);
      }

      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.buffer.length,
        {
          'Content-Type': contentType,
        },
      );
    } catch (error) {
      throw new BadGatewayException('MinIO upload failed');
    }

    return {
      link: await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        this.presignedExpirySeconds,
      ),
      expires: new Date(Date.now() + this.presignedExpirySeconds * 1000).toISOString(),
    };
  }

  private isUploadFile(file: unknown): file is UploadFile {
    if (!file || typeof file !== 'object') {
      return false;
    }

    return Buffer.isBuffer((file as UploadFile).buffer);
  }

}
