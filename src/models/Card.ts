import { DateTime } from 'luxon';
import db from '../db/db.config';
import {
  IPostgresActiveCard,
  IPostgresInactiveCard,
} from '../interfaces/interface.db';
import { IActiveCard, IInactiveCard } from '../interfaces/interface.main';

export default class Card {
  static async insert(
    card: IActiveCard,
    method?: 'accumulated-time'
  ): Promise<boolean> {
    let nowUtc;
    let expireUtc;

    // Check if card is short/long term
    if (card.duration > 300) {
      nowUtc = DateTime.fromISO(card.startsAt).toUTC();
      expireUtc = nowUtc.plus({ minutes: card.duration });
    } else {
      // Starting datetime
      nowUtc = DateTime.now().toUTC();
      // Expiration datetime
      expireUtc = nowUtc.plus({ minutes: card.duration });
    }

    let sql: string;
    let data;
    if (method === 'accumulated-time') {
      sql = `
      WITH new_card AS (
        INSERT INTO active_cards(
          license_plate, vehicle_name, duration, 
          cost, starts_at, expires_at, driver_id, 
          address_id
        ) 
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
      ), 
      update_addresses AS (
        UPDATE 
          addresses 
        SET 
          occupied = occupied + 1 
        WHERE 
          addresses.id = (
            SELECT 
              address_id 
            FROM 
              new_card
          )
      ) 
      UPDATE 
        drivers 
      SET 
        accumulated_time = accumulated_time - (
          SELECT 
            duration 
          FROM 
            new_card
        ) 
      WHERE 
        id = $9      
      `;

      data = [
        card.vehicleLicensePlate,
        card.vehicleName,
        card.duration,
        0,
        nowUtc.toISO(),
        expireUtc.toISO(),
        card.driverId,
        card.addressId,
        card.driverId,
      ];
    } else {
      sql = `
      WITH new_card AS (
        INSERT INTO active_cards(
          license_plate, vehicle_name, duration, 
          cost, starts_at, expires_at, driver_id, 
          address_id
        ) 
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
      ), payment AS (
      INSERT INTO earnings(amount, datetime) 
        SELECT t.cost, $9 FROM (SELECT cost FROM new_card) t
      )
      UPDATE 
        addresses 
      SET 
        occupied = occupied + 1 
      WHERE 
        addresses.id = (SELECT address_id FROM new_card)
      `;
      data = [
        card.vehicleLicensePlate,
        card.vehicleName,
        card.duration,
        card.cost,
        nowUtc.toISO(),
        expireUtc.toISO(),
        card.driverId,
        card.addressId,
        DateTime.now().toUTC().toISO(),
      ];
    }

    try {
      const result = await db.query(sql, data);

      if (result.rowCount > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  static async select(
    value: 'active-user' | 'active-all' | 'inactive-user',
    driverId?: number
  ): Promise<IActiveCard[] | IInactiveCard[]> {
    switch (value) {
      case 'active-user':
        try {
          const response = await db.query(
            `
            SELECT
              active_cards.id, 
              active_cards.driver_id, 
              active_cards.address_id, 
              addresses.name as address_name, 
              active_cards.vehicle_name, 
              active_cards.license_plate, 
              active_cards.cost,
              active_cards.duration,
              active_cards.starts_at, 
              active_cards.expires_at 
            FROM 
              active_cards 
              JOIN addresses ON active_cards.address_id = addresses.id 
            WHERE 
              driver_id = $1 
            ORDER BY 
              id DESC
            `,
            [driverId]
          );

          if (response.rowCount > 0) {
            let activeCards: IActiveCard[] = [];
            (response.rows as IPostgresActiveCard[]).forEach((card) => {
              activeCards.push({
                id: card.id,
                driverId: card.driver_id,
                addressId: card.address_id,
                addressName: card.address_name,
                vehicleName: card.vehicle_name,
                vehicleLicensePlate: card.license_plate,
                cost: card.cost,
                duration: card.duration,
                startsAt: card.starts_at,
                expiresAt: card.expires_at,
              });
            });

            return activeCards;
          }

          return [] as IActiveCard[];
        } catch (error) {
          console.log(error);
        }

        break;

      case 'inactive-user':
        try {
          const response = await db.query(
            `
            SELECT
              inactive_cards.id, 
              inactive_cards.driver_id, 
              inactive_cards.address_id, 
              addresses.name as address_name, 
              inactive_cards.vehicle_name, 
              inactive_cards.license_plate, 
              inactive_cards.cost,
              inactive_cards.duration,
              inactive_cards.starts_at, 
              inactive_cards.expired,
              inactive_cards.cancelled
            FROM 
              inactive_cards 
              JOIN addresses ON inactive_cards.address_id = addresses.id 
            WHERE 
              driver_id = $1 
            ORDER BY 
              id DESC
            `,
            [driverId]
          );

          if (response.rowCount > 0) {
            let inactiveCards: IInactiveCard[] = [];
            (response.rows as IPostgresInactiveCard[]).forEach((card) => {
              inactiveCards.push({
                id: card.id,
                driverId: card.driver_id,
                addressId: card.address_id,
                addressName: card.address_name,
                vehicleName: card.vehicle_name,
                licensePlate: card.license_plate,
                cost: card.cost,
                duration: card.duration,
                startsAt: card.starts_at,
                cancelled: card.cancelled,
                expired: card.expired,
              });
            });

            return inactiveCards;
          }

          return [] as IInactiveCard[];
        } catch (error) {
          console.log(error);
        }

        break;

      default:
        break;
    }
  }

  /**
   * Cancel an active card. Remove a card from active_cards table and move it
   * to inactive_cards. Update driver's accumulated time.
   */
  static async cancel(
    driverId: number,
    cardId: number,
    expiresAt: string
  ): Promise<boolean> {
    // Calculate remaing time
    const remaining = DateTime.fromISO(expiresAt).diffNow([
      'minutes',
      'seconds',
    ]);

    try {
      const result = await db.query(
        `
      WITH cancelled AS (
        DELETE FROM
          active_cards
        WHERE
          id = $1 RETURNING *
      ),
      insert_cancelled AS (
        INSERT INTO inactive_cards(
          license_plate, vehicle_name, duration,
          cost, starts_at, expires_at, expired,
          cancelled, driver_id, address_id
        )
        SELECT
          license_plate,
          vehicle_name,
          duration,
          cost,
          starts_at,
          expires_at,
          false as expired,
          true as cancelled,
          driver_id,
          address_id
        FROM
          cancelled RETURNING *
      )
      UPDATE
        drivers
      SET
        accumulated_time = accumulated_time + $2
      WHERE
        id = $3
      `,
        [cardId, remaining.minutes, driverId]
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

  static async extend(
    cardId: number,
    expiresAt: string,
    duration: number,
    price: number,
    method?: 'accumulated-time'
  ): Promise<boolean> {
    const dt = DateTime.fromISO(expiresAt).plus({ minutes: duration });

    let sql: string;
    let data;
    if (method === 'accumulated-time') {
      sql = `
      WITH extended_card AS (
        UPDATE 
          active_cards 
        SET 
          expires_at = $1 
        WHERE 
          id = $2 RETURNING *
      ) 
      UPDATE 
        drivers 
      SET 
        accumulated_time = accumulated_time - $3
      WHERE id = (SELECT driver_id FROM extended_card)
      `;
      data = [dt.toUTC().toISO(), cardId, duration];
    } else {
      sql = `
      WITH extension AS (
        UPDATE 
          active_cards 
        SET 
          expires_at = $1, 
          cost = cost + $2 
        WHERE 
          id = $3 RETURNING *
      )
      INSERT INTO earnings(amount, datetime) VALUES ($4, $5)
        

      `;
      data = [
        dt.toUTC().toISO(),
        price,
        cardId,
        price,
        DateTime.now().toUTC().toISO(),
      ];
    }

    try {
      const result = await db.query(sql, data);

      if (result.rowCount > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  static async inspect(licensePlate: string): Promise<boolean> {
    try {
      const result = await db.query(
        `
      SELECT * FROM active_cards WHERE license_plate=$1 
      `,
        [licensePlate]
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
