import { IPostgresVehicle } from 'src/interfaces/interface.db';
import db from '../db/db.config';

export default class Vehicle {
  static async select(
    value: 'driver-all' | 'driver-one',
    driverId?: number,
    column?: 'license-plate',
    licensePlate?: string
  ): Promise<{ vehicleId: number; name: string; licensePlate: string }[]> {
    if (value === 'driver-all') {
      try {
        const result = await db.query(
          'SELECT * FROM vehicles WHERE driver_id=$1',
          [driverId]
        );

        let data: {
          vehicleId: number;
          name: string;
          licensePlate: string;
        }[] = [];

        if (result.rowCount > 0) {
          (result.rows as IPostgresVehicle[]).forEach((vehicle) => {
            data.push({
              vehicleId: vehicle.id,
              name: vehicle.name,
              licensePlate: vehicle.license_plate,
            });
          });

          return data;
        } else {
          return data;
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (value === 'driver-one') {
      switch (column) {
        case 'license-plate':
          try {
            const result = await db.query(
              'SELECT * FROM vehicles WHERE driver_id = $1 AND license_plate = $2',
              [driverId, licensePlate]
            );

            let data: {
              vehicleId: number;
              name: string;
              licensePlate: string;
            }[] = [];

            if (result.rowCount > 0) {
              (result.rows as IPostgresVehicle[]).forEach((vehicle) => {
                data.push({
                  vehicleId: vehicle.id,
                  name: vehicle.name,
                  licensePlate: vehicle.license_plate,
                });
              });

              return data;
            } else {
              return data;
            }
          } catch (error) {
            console.log(error);
          }
          break;

        default:
          break;
      }
    }
  }

  static async insert(
    driverId: number,
    vehicleName: string,
    licensePlate: string
  ): Promise<boolean> {
    try {
      const result = await db.query(
        `
      INSERT INTO vehicles(name, license_plate, driver_id) 
      VALUES ($1, $2, $3)
      `,
        [vehicleName, licensePlate, driverId]
      );

      if (result.rowCount > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  static async update(
    vehicleId: number,
    vehicleName: string,
    licensePlate: string
  ): Promise<boolean> {
    try {
      const result = await db.query(
        `
      UPDATE vehicles
      SET name = $1, license_plate = $2
      WHERE id = $3
      `,
        [vehicleName, licensePlate, vehicleId]
      );

      if (result.rowCount > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  static async delete(vehicleId: number): Promise<boolean> {
    try {
      const result = await db.query(
        `
      DELETE FROM vehicles WHERE id = $1
      `,
        [vehicleId]
      );

      if (result.rowCount > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
