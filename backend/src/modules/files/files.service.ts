import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { Client as MinioClient } from 'minio';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
interface UploadFile {
  buffer: Buffer;
  originalname?: string;
  mimetype?: string;
}

@Injectable()
export class FilesService {
  private readonly minioClient?: MinioClient;
  private readonly bucketName: string;
  private readonly minioEnabled: boolean;
  private readonly fileLinkBaseUrl: string;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT ?? 'localhost';
    const port = Number(process.env.MINIO_PORT ?? 9000);
    const useSSL = (process.env.MINIO_USE_SSL ?? 'false').toLowerCase() === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY ?? '';
    const secretKey = process.env.MINIO_SECRET_KEY ?? '';

    this.bucketName = process.env.MINIO_BUCKET ?? 'hotel-media';
    this.minioEnabled = Boolean(accessKey && secretKey);
    this.fileLinkBaseUrl = (process.env.FILES_PUBLIC_BASE_URL ?? '').replace(/\/$/, '');
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

  async upload(files?: unknown[], baseUrl?: string, basePath?: string) {
    if (!this.minioEnabled || !this.minioClient) {
      throw new BadRequestException('MinIO access key/secret key are required');
    }
    if (!Array.isArray(files) || files.length === 0) {
      throw new BadRequestException('Files are required');
    }

    const results: string[] = [];

    for (const file of files) {
      results.push(await this.uploadOne(file, baseUrl, basePath));
    }

    return results;
  }

  private async uploadOne(file?: unknown, baseUrl?: string, basePath?: string) {
    if (!this.isUploadFile(file)) {
      throw new BadRequestException('File is required');
    }
    if (!this.minioClient) {
      throw new BadRequestException('MinIO access key/secret key are required');
    }

    const filename = file.originalname || `upload-${randomUUID()}`;
    const contentType = file.mimetype || 'application/octet-stream';
    const fileExtension = extname(filename);
    const objectName = `${randomUUID()}${fileExtension}`;

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
          'x-amz-meta-original-name': filename,
        },
      );
    } catch (error) {
      throw new BadGatewayException('MinIO upload failed');
    }

    return this.buildPublicLink(objectName, baseUrl, basePath);
  }

  async getPublicObject(objectName: string) {
    if (!this.minioEnabled || !this.minioClient) {
      throw new BadRequestException('MinIO access key/secret key are required');
    }
    if (!objectName) {
      throw new BadRequestException('File id is required');
    }
    if (objectName.includes('/') || objectName.includes('..')) {
      throw new BadRequestException('Invalid file id');
    }

    try {
      const [stat, stream] = await Promise.all([
        this.minioClient.statObject(this.bucketName, objectName),
        this.minioClient.getObject(this.bucketName, objectName),
      ]);

      return {
        stream,
        stat,
        filename:
          stat.metaData?.['x-amz-meta-original-name'] ??
          stat.metaData?.['X-Amz-Meta-Original-Name'] ??
          objectName,
      };
    } catch (error) {
      throw new BadGatewayException('MinIO download failed');
    }
  }

  private isUploadFile(file: unknown): file is UploadFile {
    if (!file || typeof file !== 'object') {
      return false;
    }

    return Buffer.isBuffer((file as UploadFile).buffer);
  }

  private buildPublicLink(objectName: string, baseUrl?: string, basePath?: string) {
    const resolvedBaseUrl = (baseUrl ?? this.fileLinkBaseUrl ?? '').replace(/\/$/, '');
    const resolvedBasePath = (basePath ?? '/files').replace(/\/$/, '');
    const resolvedBasePathWithApi = resolvedBasePath.startsWith('/api')
      ? resolvedBasePath
      : `/api${resolvedBasePath === '/' ? '' : resolvedBasePath}`;
    if (resolvedBaseUrl) {
      return `${resolvedBaseUrl}${resolvedBasePathWithApi}/public/${objectName}`;
    }

    return `${resolvedBasePathWithApi}/public/${objectName}`;
  }
}
