import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./schemas/users.schema";
import { CreateUserDto } from "./dto/create-user.dto";
import { PaginationParams } from "../../commonDto/paginationParams.dto";
import { BanUsersInfo } from "./dto/user-banInfo.dto";


@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
  }

  async clearAll(): Promise<void> {
    await this.userModel.deleteMany({});
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ id: userId });
    return result.deletedCount > 0;
  }

  async findUserByLoginOrEmail(search): Promise<User> {

    const filter = {
      $or: [
        { login: search },
        { email: search }
      ]
    };

    return this.userModel.findOne(filter);
  }

  async countDocuments(filter): Promise<number> {
    return this.userModel.count(filter);
  }

  async findUsers(filter, {
    pageNumber,
    pageSize,
    sortBy,
    sortDirection
  }: PaginationParams): Promise<User[]> {
    return this.userModel.find(filter).sort({ [sortBy]: sortDirection === "asc" ? 1 : -1 })
      .limit(pageSize).skip((pageNumber - 1) * pageSize);
  }


  async getBanedUsers(): Promise<User[]> {
    return this.userModel.find({ "banInfo.isBanned": true });
  }


  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async updateConfirmCode(userId: string, confirmationCode: string): Promise<void> {
    await this.userModel.findOneAndUpdate({ id: userId }, { "emailConfirmation.confirmationCode": confirmationCode });
  }


  async findUserByConfirmationCode(confirmationCode: string): Promise<User | null> {
    return this.userModel.findOne({ "emailConfirmation.confirmationCode": confirmationCode });
  }

  async confirmUser(userId: string): Promise<void> {
    await this.userModel.findOneAndUpdate({ id: userId }, { "emailConfirmation.isConfirmed": true });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userModel.findOne({ id });
  }

  async banUser(userId: string, banInfo: BanUsersInfo): Promise<void> {
    await this.userModel.findOneAndUpdate({ id: userId }, { banInfo });
  }

}