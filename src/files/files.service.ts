import { join } from 'path';
import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {

  getFilePath(fileName: string){
    const path = join(__dirname,'../../images', fileName);
    if(!existsSync(path)) throw new NotFoundException(`File ${fileName} not found`);
    return path;
  }

}
