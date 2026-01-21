export class AuthResponseUserDto {
  id: string;
  email: string;
  name: string | null;
}

export class AuthResponseDto {
  accessToken: string;
  user: AuthResponseUserDto;
}
