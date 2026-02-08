import { Injectable, NotFoundException } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { faker } from '@faker-js/faker';
import { UsersQueryDto } from './dto/get-users.query.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    if (process.env.SEED_ON_START !== 'true') return;

    if (await this.isDBNotEmpty()) {
      console.log('Database is not empty -> skip data upload.');
      return;
    } else {
      console.log('Database is empty -> starting data upload...');
    }

    type UserSeed = {
      name: string;
      email: string;
      phone: string;
      birthDate: Date;
    };

    const batchSize = 10_000;
    const total = 2_000_000;
    const batches = Math.ceil(total / batchSize);
    let uniqueIndexCounter = 0;

    for (let i = 0; i < batches; i++) {
      const batch: UserSeed[] = [];
      for (let j = 0; j < batchSize; j++) {
        batch.push(this.generateUser(uniqueIndexCounter));
        uniqueIndexCounter++;
      }
      await this.userModel.insertMany(batch, { ordered: false });
      console.log(`Add batch #${i + 1}/${batches}`);
    }
  }

  async getUserById(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUsers(query: UsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    type UsersFilter = {
      name?: string | RegExp;
      email?: string;
      phone?: string;
    };
    const filter: UsersFilter = {};
    if (query.name) {
      const escaped = query.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = new RegExp(escaped, 'i');
    }
    if (query.email) filter.email = query.email;
    if (query.phone) filter.phone = query.phone;

    const users = await this.userModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await this.userModel.countDocuments(filter);

    return { users, total, page, limit };
  }

  private generateUser(index: number) {
    return {
      name: faker.person.fullName(),
      email: `${index}-${faker.internet.email()}`,
      phone: `+${380000000000 + index}`,
      birthDate: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }),
    };
  }

  private async isDBNotEmpty() {
    const existing = await this.userModel.countDocuments();
    return existing > 0;
  }
}
