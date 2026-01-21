import { IsEnum } from 'class-validator';
import { ListMemberRole } from './invite-user-to-list.dto';

export class UpdateListMemberRoleDto {
  @IsEnum(ListMemberRole)
  role: ListMemberRole;
}
