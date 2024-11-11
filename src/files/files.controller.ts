import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/createFile.dto';
import { IFile } from './interfaces/files.interface';


@Controller('Files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @Post()
    async create(@Body() createFileDto: CreateFileDto): Promise<IFile> {
        return this.filesService.create(createFileDto);
    }

    @Get()
    async findAll(): Promise<IFile[]> {
        return this.filesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<IFile> {
        return this.filesService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() createFileDto: CreateFileDto): Promise<IFile> {
        return this.filesService.update(id, createFileDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<any> {
        return this.filesService.delete(id);
    }
}


