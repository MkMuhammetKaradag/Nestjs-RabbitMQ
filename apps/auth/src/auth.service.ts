import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewUserDTO } from './dtos/new-user.dto';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';
import { ExistingUserDTO } from './dtos/existing-user.dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
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
  async doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<Boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.findByEmail(email);
    const doesUsewrExist = !!user;
    if (!doesUsewrExist) return null;
    const doesPasswordMatch = await this.doesPasswordMatch(
      password,
      user.password,
    );
    if (!doesPasswordMatch) return null;
    return user;
  }
  async login(existingUser: Readonly<ExistingUserDTO>) {
    const { email, password } = existingUser;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }
    const jwt = await this.jwtService.signAsync({
      user,
    });
    return { token: jwt };
  }

  async verifyJwt(jwt: string): Promise<{ exp: number }> {
    if (!jwt) {
      throw new UnauthorizedException('');
    }
    try {
      const { exp } = await this.jwtService.verifyAsync(jwt);
      return { exp };
    } catch (error) {
      throw new UnauthorizedException('');
    }
  }
}
