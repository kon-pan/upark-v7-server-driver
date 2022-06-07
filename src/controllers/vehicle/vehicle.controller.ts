// NPM package imports
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// NPM models imports
import Vehicle from '../../models/Vehicle';

export const getVehicles = async (req: Request, res: Response) => {
  const driverId = parseInt(req.params.driverId);
  const result = await Vehicle.select('driver-all', driverId);

  res.send(result);
};

export const deleteVehicle = async (req: Request, res: Response) => {
  const vehicleId = parseInt(req.params.vehicleId);
  const result = await Vehicle.delete(vehicleId);
  res.send({ success: result });
};

export const updateVehicle = async (req: Request, res: Response) => {
  // Finds the validation errors in this request and wraps them in an object
  const errors = validationResult(req);
  const vehicleId = parseInt(req.params.vehicleId);

  if (!errors.isEmpty()) {
    let response = {
      err: {
        vehicleName: '',
        licensePlate: '',
      },
      success: false,
    };

    for (const error of errors.array()) {
      switch (error.param) {
        case 'vehicleName':
          response.err.vehicleName = error.msg;
          break;

        case 'licensePlate':
          response.err.licensePlate = error.msg;
          break;

        default:
          break;
      }
    }

    res.send(response);
    return;
  }

  // All input fields had valid values
  const result = await Vehicle.update(
    vehicleId,
    req.body.vehicleName,
    req.body.licensePlate
  );

  if (result) {
    res.send({ success: true });
    return;
  }

  res.send({ success: false });
};

export const insertVehicle = async (req: Request, res: Response) => {
  // Finds the validation errors in this request and wraps them in an object
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let response = {
      err: {
        vehicleName: '',
        licensePlate: '',
      },
      success: false,
    };

    for (const error of errors.array()) {
      switch (error.param) {
        case 'vehicleName':
          response.err.vehicleName = error.msg;
          break;

        case 'licensePlate':
          response.err.licensePlate = error.msg;
          break;

        default:
          break;
      }
    }

    res.send(response);
    return;
  }

  // All input fields had valid values
  const result = await Vehicle.insert(
    Number.parseInt(req.params.driverId),
    req.body.vehicleName,
    req.body.licensePlate
  );

  if (result) {
    res.send({ success: true });
    return;
  }

  res.send({ success: false });
};
