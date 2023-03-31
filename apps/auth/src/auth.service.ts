import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewUserDTO } from './dtos/new-user.dto';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async getUsers() {
    console.log('servis içi');
    return this.userRepository.find();
  }
  async findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'firstName', 'lastName', 'email', 'password'],
    });
  }
  // async postUser() {
  //   return this.userRepository.save({ firstName: 'Barry' });
  // }
  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    console.log(password);
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }
  async register(newUser: Readonly<NewUserDTO>): Promise<UserEntity> {
    const { firstName, lastName, email, password } = newUser;
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(
        'An  account  with  that email  already exists!',
      );
    }
    const hashedPassword = await this.hashPassword(password);

    const user = await this.userRepository.save({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    delete user.password;
    return user;
  }
}
