import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema()
export class Subtask {
  @Prop({ required: true })
  title: string;

  @Prop({ default: false })
  completed: boolean;
}

const SubtaskSchema = SchemaFactory.createForClass(Subtask);

@Schema()
export class Comment {
  @Prop({ required: true })
  authorName: string;

  @Prop()
  authorAvatar: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema()
export class Resource {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  url: string;
}

const ResourceSchema = SchemaFactory.createForClass(Resource);

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({
    required: true,
    enum: ['todo', 'doing', 'completed'],
    default: 'todo',
  })
  status: string;

  @Prop({ required: true, enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: string;

  @Prop()
  dueDate: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  assignees: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ type: [SubtaskSchema], default: [] })
  subtasks: Subtask[];

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];

  @Prop({ type: [ResourceSchema], default: [] })
  resources: Resource[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
