import { Location } from '../geocoder/types';

export type Hotel = {
  id: number;
  district: string;
  area: string;
  name: string;
  category: string;
  validFrom: Date;
  website: string | null;
};

export type HotelWithLocation = Hotel & { location: Location };

