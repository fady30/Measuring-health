import { User } from '../../users/entities/user.entity';

export class RegisterResponse {
  id: string;
  naam: string;
  email: string;

  constructor(user: User) {
    this.id = user.id;
    this.naam = user.naam;
    this.email = user.email;
  }
}
