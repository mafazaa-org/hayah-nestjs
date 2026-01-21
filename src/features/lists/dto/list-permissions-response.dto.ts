export class ListPermissionsResponseDto {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  role: 'owner' | 'editor' | 'viewer' | null;
}
