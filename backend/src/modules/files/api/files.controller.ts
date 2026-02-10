import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { Public } from '../../../shared/decorators/public.decorator';
import { FilesService } from '../files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async upload(@UploadedFiles() files: unknown[], @Req() request: Request) {
    const baseUrl = this.getBaseUrl(request);
    const basePath = this.getBasePath(request);
    return this.filesService.upload(files, baseUrl, basePath);
  }

  @Public()
  @Get('public/:token')
  async downloadPublic(
    @Param('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { stream, stat, filename } = await this.filesService.getPublicObject(token);
    const contentType =
      stat.metaData?.['content-type'] ?? stat.metaData?.['Content-Type'] ?? 'application/octet-stream';

    response.setHeader('Content-Type', contentType);
    response.setHeader('Content-Length', stat.size);
    response.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    return new StreamableFile(stream);
  }

  private getBaseUrl(request: Request) {
    const forwardedProto = request.headers['x-forwarded-proto'];
    const forwardedHost = request.headers['x-forwarded-host'];
    const protocol = Array.isArray(forwardedProto)
      ? forwardedProto[0]
      : forwardedProto ?? request.protocol;
    const host = Array.isArray(forwardedHost)
      ? forwardedHost[0]
      : forwardedHost ?? request.get('host');

    return `${protocol}://${host}`;
  }

  private getBasePath(request: Request) {
    const originalUrl = request.originalUrl ?? '';
    const path = request.path ?? '';
    if (!originalUrl || !path) {
      return request.baseUrl || '/files';
    }

    const basePath = originalUrl.endsWith(path)
      ? originalUrl.slice(0, Math.max(0, originalUrl.length - path.length))
      : request.baseUrl;

    return basePath || '/files';
  }
}
