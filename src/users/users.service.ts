import { Injectable } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { faker } from '@faker-js/faker';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

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

  async onModuleInit() {
    console.log('UsersService initialized');

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
}
