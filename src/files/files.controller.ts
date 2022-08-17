import { Controller, Get, InternalServerErrorException, Param, ParseFilePipeBuilder, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { FilesService } from './files.service';

@Controller('files')
@ApiTags('Files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file',{
      limits: {
        files: 1,
      },
      storage: diskStorage({
        destination: './images',
        filename: (req, file, cb) => {
          const fileExtension = file.mimetype.split('/')[1];
          const fileName = `${uuid()}.${fileExtension}`;
          cb(null,fileName)
        }
      })
    })
  )
  uploadProductImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: new RegExp(/(png|jpe?g|gif)/),
      })
      .build()
    ) 
    file: Express.Multer.File
  ) {
    const hostUrl = this.configService.get('API_URL');
    if(!hostUrl) throw new InternalServerErrorException('API_URL env variable not found');
    return `${hostUrl}/images/${file.filename}`;
  }

  @Get(':fileName')
  getFile(
    @Param('fileName') fileName: string,
    @Res() res: Response
  ) {
    const path = this.filesService.getFilePath(fileName);
    res.sendFile(path);
  }

}
