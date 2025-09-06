export enum UserType {
  ADMIN = 'ADMIN',
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL'
}

export interface User {
  username: string;
  userType: UserType;
}
