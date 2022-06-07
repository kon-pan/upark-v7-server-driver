import { Request, Response } from 'express';

// Models imports
import Address from '../../models/Address';

export const getAddress = async (req: Request, res: Response) => {
  const address = await Address.findOne('id', parseInt(req.params.addressId));
  res.send(address);
};

export const getAddresses = async (req: Request, res: Response) => {
  const addresses = await Address.fetchAll();
  res.send(addresses);
};

export const getAddressesCount = async (req: Request, res: Response) => {
  const addressesCount = await Address.count('all');

  res.send({ addressesCount });
};
