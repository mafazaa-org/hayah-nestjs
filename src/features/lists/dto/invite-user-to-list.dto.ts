import { IsEmail, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export enum ListMemberRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export class InviteUserToListDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(ListMemberRole)
  role: ListMemberRole;
}
