import { ProfileSettings } from '../entities/profile-settings.entity';
import { User } from '../entities/user.entity';

class ProfileSettingsResponse {
  thema: string;
  notificatiesAan: boolean;
  dagelijksStappendoel: number;
  taal: string;

  constructor(settings: ProfileSettings) {
    this.thema = settings.thema;
    this.notificatiesAan = settings.notificatiesAan;
    this.dagelijksStappendoel = settings.dagelijksStappendoel;
    this.taal = settings.taal;
  }
}

export class UserProfileResponse {
  id: string;
  naam: string;
  email: string;
  geboortedatum: string;
  isGeblokkeerd: boolean;
  createdAt: Date;
  instellingen: ProfileSettingsResponse | null;

  constructor(user: User) {
    this.id = user.id;
    this.naam = user.naam;
    this.email = user.email;
    this.geboortedatum = user.geboortedatum;
    this.isGeblokkeerd = user.isGeblokkeerd;
    this.createdAt = user.createdAt;
    this.instellingen = user.profileSettings
      ? new ProfileSettingsResponse(user.profileSettings)
      : null;
  }
}
