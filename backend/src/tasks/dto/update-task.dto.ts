import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['todo', 'doing', 'completed'])
  @IsOptional()
  status?: string;

  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  dueDate?: string;

  @IsArray()
  @IsOptional()
  assignees?: string[];

  @IsArray()
  @IsOptional()
  labels?: string[];

  @IsArray()
  @IsOptional()
  subtasks?: { title: string; completed?: boolean }[];

  @IsArray()
  @IsOptional()
  resources?: { title: string; url: string }[];
}
