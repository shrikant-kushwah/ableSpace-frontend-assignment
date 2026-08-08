import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './task.schema';
import { User, UserDocument } from '../users/user.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Automatically seed the database on startup if empty
  async onModuleInit() {
    await this.seedDatabase();
  }

  async seedDatabase() {
    const userCount = await this.userModel.countDocuments({
      email: { $ne: 'guest@tms.local' },
    });
    const taskCount = await this.taskModel.countDocuments();

    if (userCount === 0 && taskCount === 0) {
      console.log('Seeding initial database content...');

      // Create users
      const admin = await this.userModel.create({
        name: 'Admin',
        avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin',
        email: 'admin@tms.local',
        role: 'Administrator',
      });

      const designer = await this.userModel.create({
        name: 'Designer',
        avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=designer',
        email: 'designer@tms.local',
        role: 'Designer',
      });

      const qaTeam = await this.userModel.create({
        name: 'QA Team',
        avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=qa',
        email: 'qa@tms.local',
        role: 'QA Engineer',
      });

      const security = await this.userModel.create({
        name: 'Security',
        avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=security',
        email: 'security@tms.local',
        role: 'Security Auditor',
      });

      const cnMember = await this.userModel.create({
        name: 'CN',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=CN',
        email: 'cn@tms.local',
        role: 'Developer',
      });

      // Create Figma tasks
      const tasksData = [
        {
          title: 'Design Homepage',
          description:
            'Create landing page mockups for desktop and mobile devices.',
          status: 'todo',
          priority: 'high',
          dueDate: new Date('2026-09-12'),
          assignees: [admin._id],
          labels: ['Design', 'Deployment'],
          subtasks: [
            { title: 'Create initial wireframes', completed: true },
            { title: 'Define style guide & typography', completed: false },
          ],
          resources: [
            { title: 'Figma Design Guidelines', url: 'https://figma.com' },
          ],
          comments: [
            {
              authorName: 'Admin',
              authorAvatar: admin.avatarUrl,
              content: "Let's focus on a minimal, premium dark aesthetic.",
              createdAt: new Date(),
            },
          ],
        },
        {
          title: 'Develop Login Feature',
          description: 'Implement secure guest and Google OAuth sign-in.',
          status: 'todo',
          priority: 'low',
          dueDate: new Date('2026-09-15'),
          assignees: [cnMember._id],
          labels: ['Deployment'],
          subtasks: [
            { title: 'Setup JWT authentication', completed: true },
            { title: 'Implement passport strategies', completed: true },
            { title: 'Guest session handler', completed: false },
          ],
        },
        {
          title: 'Test Payment Gateway',
          description:
            'Verify sandbox transactions and webhook signature authentication.',
          status: 'todo',
          priority: 'medium',
          dueDate: new Date('2026-09-18'),
          assignees: [],
          labels: ['Deployment'],
        },
        {
          title: 'Write API Documentation',
          description:
            'Document NestJS endpoints, request schemas, and response validation codes.',
          status: 'doing',
          priority: 'high',
          dueDate: new Date('2026-07-29'),
          assignees: [admin._id],
          labels: ['Deployment'],
          subtasks: [
            { title: 'Document Auth module endpoints', completed: true },
            { title: 'Document Tasks module endpoints', completed: false },
          ],
        },
        {
          title: 'Implement Search Function',
          description:
            'Setup MongoDB text indexes to search titles and descriptions.',
          status: 'doing',
          priority: 'medium',
          dueDate: new Date('2026-07-29'),
          assignees: [admin._id],
          labels: ['Deployment'],
        },
        {
          title: 'Deploy to Production',
          description:
            'Prepare pipeline and deploy frontend and backend instances.',
          status: 'doing',
          priority: 'low',
          dueDate: new Date('2026-07-29'),
          assignees: [admin._id],
          labels: ['Deployment'],
        },
        {
          title: 'Code Review Completed',
          description:
            'Verify security and code structure rules of task controllers.',
          status: 'doing',
          priority: 'low',
          dueDate: new Date('2026-07-29'),
          assignees: [admin._id],
          labels: ['Deployment'],
        },
        {
          title: 'Design Mockups Finalized',
          description:
            'Incorporate designer feedback and freeze Figma screens.',
          status: 'doing',
          priority: 'low',
          dueDate: new Date('2026-07-29'),
          assignees: [admin._id],
          labels: ['Deployment'],
        },
        {
          title: 'Feature Testing Passed',
          description: 'All unit and automated integration tests run green.',
          status: 'completed',
          priority: 'high',
          dueDate: new Date('2026-07-25'),
          assignees: [qaTeam._id],
          labels: ['Testing', 'Deployment'],
          subtasks: [{ title: 'Write automated spec tests', completed: true }],
        },
        {
          title: 'UI Design Updated',
          description:
            'Apply glassmorphism effects and tailored gradient buttons.',
          status: 'completed',
          priority: 'high',
          dueDate: new Date('2026-07-26'),
          assignees: [designer._id],
          labels: ['Design', 'Deployment'],
        },
        {
          title: 'Security Audit Completed',
          description:
            'Verify API validation bounds and input sanitation rules.',
          status: 'completed',
          priority: 'high',
          dueDate: new Date('2026-07-28'),
          assignees: [security._id],
          labels: ['Audit', 'Deployment'],
        },
      ];

      await this.taskModel.insertMany(tasksData);
      console.log('Database successfully seeded!');
    }
  }

  async findAll(
    search?: string,
    status?: string,
    priority?: string,
    label?: string,
  ): Promise<TaskDocument[]> {
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (label) {
      query.labels = label;
    }

    return this.taskModel.find(query).populate('assignees').exec();
  }

  async findOne(id: string): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id).populate('assignees').exec();
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto): Promise<TaskDocument> {
    const assigneesIds =
      createTaskDto.assignees?.map((id) => new Types.ObjectId(id)) || [];
    const newTask = new this.taskModel({
      ...createTaskDto,
      assignees: assigneesIds,
    });
    const saved = await newTask.save();
    return this.findOne(saved._id.toString());
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<TaskDocument> {
    const updates: any = { ...updateTaskDto };
    if (updateTaskDto.assignees) {
      updates.assignees = updateTaskDto.assignees.map(
        (aid) => new Types.ObjectId(aid),
      );
    }
    const updated = await this.taskModel
      .findByIdAndUpdate(id, updates, { new: true })
      .populate('assignees')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.taskModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async addComment(
    id: string,
    authorName: string,
    authorAvatar: string,
    content: string,
  ): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    task.comments.push({
      authorName,
      authorAvatar,
      content,
      createdAt: new Date(),
    });
    await task.save();
    return this.findOne(id);
  }

  async addResource(
    id: string,
    title: string,
    url: string,
  ): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    task.resources.push({ title, url });
    await task.save();
    return this.findOne(id);
  }

  async clearAndReseed() {
    await this.taskModel.deleteMany({});
    await this.userModel.deleteMany({ email: { $ne: 'guest@tms.local' } });
    await this.seedDatabase();
  }
}
