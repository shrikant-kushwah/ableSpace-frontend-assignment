import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(
    name: string,
    avatarUrl?: string,
    email?: string,
    role?: string,
    username?: string,
  ): Promise<UserDocument> {
    const newUser = new this.userModel({ name, avatarUrl, email, role, username });
    const saved = await newUser.save();
    return saved;
  }

  async update(
    id: string,
    updates: Partial<User>,
  ): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOrCreateGuest(name: string): Promise<UserDocument> {
    const existing = await this.userModel
      .findOne({ email: 'guest@tms.local' })
      .exec();
    if (existing) {
      return existing;
    }
    return this.create(
      name,
      'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
      'guest@tms.local',
      'Guest',
      'guest',
    );
  }
}
