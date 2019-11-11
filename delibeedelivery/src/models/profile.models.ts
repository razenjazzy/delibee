import { Serializable } from "./serializalble.interface";

export class Profile {
  id: number;
  is_online: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  longitude: number;
  latitude: number;
  assigned: number;

  constructor() {
    this.is_online = 1;
  }
}