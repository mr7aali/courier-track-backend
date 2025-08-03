import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';


export class ILoginBody {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  pass: string;
}

export class RegisterBodyDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  pass: string;

  // @IsEnum(UserRole, { message: 'role must be Manager or user' })
  // role: UserRole;
  @IsString()
  role:string
}
