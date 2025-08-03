import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';


export class ILoginBody {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterBodyDto {


  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsString()
  name:string;

  @IsString()
  phone:string;
  
  @IsNotEmpty()
  @IsString()
  password: string;

  // @IsEnum(UserRole, { message: 'role must be Manager or user' })
  // role: UserRole;
  @IsString()
  role:string
}
