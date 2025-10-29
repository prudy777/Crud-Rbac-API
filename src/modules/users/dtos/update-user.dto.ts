import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiExtraModels } from '@nestjs/swagger';

// Keeping your class name as-is: UpdateUsertDto
@ApiExtraModels() // helps Swagger pick up the derived schema
export class UpdateUsertDto extends PartialType(CreateUserDto) {}
