import mongoose from "mongoose";
import { userSchema } from "./UserSchema";
import { UserDBAdapter, UserDBEntity } from "@/infrastructure/storage/models/UserModel";
import { UserRepository } from "@/application/repositories/UserRepository";
import { UserId } from "@/domain/core/UserId";
import { User } from "@/domain/core/User";

export class MongoDBUserRepository implements UserRepository {
  private _model = mongoose.model<UserDBEntity>("UserSchema", userSchema);

  async getUsers(): Promise<User[]> {
    return this._model.find().lean().then((users) => {
      return users.map(user => UserDBAdapter.asDomainEntity(user));
    });
  }

  async getPermissions(): Promise<Permission[]> {
    return this._model.find().lean().then((users) => {
      return users.map(user => user.asDomainEntity(user)).map(user => user.permissions).unique();
    });
  }

  async getUserById(userId: UserId): Promise<User> {
    const user = await this._model.findOne({
      id: userId.mail
    }).lean();
    if (!user) {
      throw new Error("User not found");
    }
    return UserDBAdapter.asDomainEntity(user);
  }

  async getPermissionsByUserId(userId: UserId): Promise<Permission> {
    return (await this.getUserById(userId)).permissions;
  }

  async saveUser(user: User): Promise<void> {
    return this._model.create(UserDBAdapter.asDBEntity(user));
  }

  async updateUser(user: User): Promise<void> {
    return this._model.updateOne({
      id: user.id.mail
    }, UserDBAdapter.asDBEntity(user));
  }

  async removeUser(userId: UserId): Promise<void> {
    return this._model.deleteOne({ id: userId.mail });
  }
}