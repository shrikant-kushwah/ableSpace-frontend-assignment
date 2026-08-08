import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('label') label?: string,
  ) {
    return this.tasksService.findAll(search, status, priority, label);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.tasksService.delete(id);
    return { success: true };
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Request() req: { user?: { name?: string; avatarUrl?: string } },
    @Body('content') content: string,
  ) {
    const authorName = req.user?.name || 'Anonymous';
    const authorAvatar = req.user?.avatarUrl || '';
    return this.tasksService.addComment(id, authorName, authorAvatar, content);
  }

  @Post(':id/resources')
  async addResource(
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('url') url: string,
  ) {
    return this.tasksService.addResource(id, title, url);
  }

  @Post('reseed')
  async reseed() {
    await this.tasksService.clearAndReseed();
    return { success: true, message: 'Database reseeded successfully!' };
  }
}
