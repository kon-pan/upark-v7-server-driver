import db from '../db/db.config';

// Interfaces imports
import { IPostgresAddress } from 'src/interfaces/interface.db';

export default class Address {
  static async fetchAll(): Promise<IPostgresAddress[]> {
    try {
      const result = await db.query('SELECT * FROM addresses ORDER BY id ASC');

      return result.rows;
    } catch (error) {
      console.log(error);
    }
  }

  static async findOne(
    col: string,
    value: string | number
  ): Promise<IPostgresAddress> {
    switch (col) {
      case 'id':
        try {
          const result = await db.query('SELECT * FROM addresses WHERE id=$1', [
            value,
          ]);

          if (result.rowCount === 0) {
            return {} as IPostgresAddress; // user id does not exist
          }

          const row: IPostgresAddress = result.rows[0];
          return row;
        } catch (error) {
          console.log(error);
        }

        break;

      default:
        break;
    }
  }

  static async count(type: 'all'): Promise<number> {
    switch (type) {
      case 'all':
        try {
          const result = await db.query(`
        SELECT COUNT(*) FROM addresses
        `);

          return result.rows[0].count;
        } catch (error) {
          throw error;
        }

      default:
        break;
    }
  }
}
