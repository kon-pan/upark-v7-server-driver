export interface IPostgresDriver {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  display_name: string;
  email: string;
  password?: string | null;
  registered_on: string;
  registered_with: string;
  accumulated_time: number;
}

export interface IPostgresAddress {
  id: number;
  name: string;
  available: number;
  occupied: number;
  position: [number, number];
}

export interface IPostgresVehicle {
  id: number;
  name: string;
  license_plate: string;
  driver_id: number;
}

export interface IPostgresActiveCard {
  id: number;
  license_plate: string;
  vehicle_name: string;
  duration: number;
  cost: number;
  starts_at: string;
  expires_at: string;
  driver_id: number;
  address_id: number;
  address_name: string;
}

export interface IPostgresInactiveCard {
  id: number;
  driver_id: number;
  address_id: number;
  address_name: string;
  vehicle_name: string;
  license_plate: string;
  cost: number;
  duration: number;
  starts_at: string;
  expired: boolean;
  cancelled: boolean;
}
