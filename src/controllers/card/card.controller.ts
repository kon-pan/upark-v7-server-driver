// NPM packages imports
import { Request, Response } from 'express';
import { IActiveCard } from '../../interfaces/interface.main';
import Card from '../../models/Card';

export const insertCard = async (req: Request, res: Response) => {
  const {
    card,
    useAccumulatedTime,
  }: { card: IActiveCard; useAccumulatedTime: boolean } = req.body;

  let result: boolean;
  if (useAccumulatedTime) {
    result = await Card.insert(card, 'accumulated-time');
  } else {
    result = await Card.insert(card);
  }

  if (result) {
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
};

export const selectInactiveCards = async (req: Request, res: Response) => {
  const driverId = req.params.driverId;
  const result = await Card.select('inactive-user', parseInt(driverId));
  res.send({ inactiveCards: result });
};

export const selectActiveCards = async (req: Request, res: Response) => {
  const driverId = req.params.driverId;
  const result = await Card.select('active-user', parseInt(driverId));
  res.send({ activeCards: result });
};

export const cancelCard = async (req: Request, res: Response) => {
  const { driverId, cardId, expiresAt } = req.body;
  const result = await Card.cancel(driverId, cardId, expiresAt);
  res.send({ success: result });
};

export const extendCard = async (req: Request, res: Response) => {
  const cardId = parseInt(req.params.cardId);

  const {
    expiresAt,
    duration,
    price,
    useAccumulatedTime,
  }: {
    expiresAt: string;
    duration: number;
    price: number;
    useAccumulatedTime: boolean;
  } = req.body;

  let result: boolean;
  if (useAccumulatedTime) {
    result = await Card.extend(
      cardId,
      expiresAt,
      duration,
      0,
      'accumulated-time'
    );
  } else {
    result = await Card.extend(cardId, expiresAt, duration, price);
  }

  if (result) {
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
};
