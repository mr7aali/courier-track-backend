import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ILoginBody, RegisterBodyDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
// import { UserRole, Users } from '../schema/users';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { dycrypt, encryptPassword } from './encrypt';
// import { handleMongoErrors } from 'src/utils/error.handle';
import { Response } from 'express';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // Login Function
  async login(dto: ILoginBody, res: Response) {
    const user = await this.userModel
      .findOne({ email: dto.email })
      .select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const { password, ...userData } = user.toObject();
    try {
      const dycrpttext = dycrypt(password);
      if (dycrpttext !== dto.password) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (error: unknown) {
     
      throw new UnauthorizedException('Unknown error occurred while log in');
    }
    const accessToken = await this.signToken(
      user._id.toString(),
      user.email,
      user.role,
    );

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token: accessToken.access_token,
      },
    });
  }

  // Register Function
  async register(dto: RegisterBodyDto, res: Response) {
    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({ email: dto.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const encrypt = await encryptPassword(dto.password);
      const hash = encrypt.iv + ':' + encrypt.key + ':' + encrypt.encryptedText;
      
      const user = new this.userModel({        
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: dto.role,
        password: hash,
        status: 'active',
      });
      
      await user.save();

      // Generate JWT token
      const accessToken = await this.signToken(
        user._id.toString(),
        user.email,
        user.role,
      );

      // Return user data without password
      const { password, ...userData } = user.toObject();

      return res.json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userData,
          token: accessToken.access_token,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Unknown error occurred while registering user');
    }
  }

  // Sign JWT Token
  async signToken(
    id: string,
    email: string,
    role: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: id, email, role };
    const token = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '1h',
    });

    return {
      access_token: token,
    };
  }
}
