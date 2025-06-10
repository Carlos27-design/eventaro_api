import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly _filesService: FilesService,
    private readonly _configService: ConfigService,
  ) {}

  @Get('event/:imageName')
  getEventImage(@Res() res: Response, @Param('imageName') imageName: string) {
    const path = this._filesService.getStaticEventImage(imageName);

    res.sendFile(path);
  }

  @Post('event')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './static/event',
        filename: fileNamer,
      }),
    }),
  )
  uploadEventImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('make sure that the file is not empty');
    }

    const secureUrl = `${this._configService.get('HOST_API')}/files/event/${file.filename}`;

    return { secureUrl, imageName: file.filename };
  }
}
