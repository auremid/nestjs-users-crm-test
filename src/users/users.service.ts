import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { faker } from '@faker-js/faker';
import { UsersQueryDto } from './dto/get-users.query.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    if (process.env.SEED_ON_START !== 'true') return;

    if (await this.isDBNotEmpty()) {
      this.logger.log('seed skip db_not_empty');
      return;
    } else {
      this.logger.log('seed start db_empty');
    }

    const startTime = performance.now();

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

    this.logger.log(`seed start total=${total} batchSize=${batchSize}`);

    for (let i = 0; i < batches; i++) {
      const batch: UserSeed[] = [];
      for (let j = 0; j < batchSize; j++) {
        batch.push(this.generateUser(uniqueIndexCounter));
        uniqueIndexCounter++;
      }
      await this.userModel.insertMany(batch, { ordered: false });
      this.logger.log(`seed progress batch=${i + 1}/${batches}`);
    }
    const endTime = performance.now();
    this.logger.log(
      `seed done total=${total} time=${Math.ceil((endTime - startTime) / 1000)} seconds`,
    );
  }

  async getUserById(userId: string) {
    if (!isValidObjectId(userId)) {
      this.logger.warn(`getUserById invalid_id id=${userId}`);
      throw new BadRequestException('Invalid user id');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      this.logger.warn(`getUserById not_found id=${userId}`);
      throw new NotFoundException('User not found');
    }

    this.logger.log(`getUserById ok id=${userId}`);
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

    this.logger.log(
      `getUserList ok page=${page} limit=${limit} count=${users.length} filter: ( name="${query.name ?? ''}" email="${query.email ?? ''}" phone="${query.phone ?? ''}" )`,
    );

    return { users, total, page, limit };
  }

  async createUser(body: CreateUserDto) {
    try {
      const created = await this.userModel.create(body);
      this.logger.log(`createUser ok name="${created.name}" id=${created._id}`);
      return created;
    } catch (err: any) {
      if (err?.code === 11000) {
        this.logger.warn(
          `createUser duplicate key: ${JSON.stringify(err.keyValue)}`,
        );
        throw new ConflictException('Email or phone already exists');
      }
      this.logger.error(`createUser failed: ${err?.message}`);
      throw err;
    }
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
