// NPM packages imports
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { DateTime } from 'luxon';
import bcrypt from 'bcryptjs';

// Models imports
import Driver from '../../models/Driver';
/* -------------------------------------------------------------------------- */

export const registerDriver = async (req: Request, res: Response) => {
  // Finds the validation errors in this request and wraps them in an object
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let response = {
      err: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        passwordConfirm: '',
      },
      success: false,
    };

    for (const error of errors.array()) {
      switch (error.param) {
        case 'firstName':
          response.err.firstName = error.msg;
          break;

        case 'lastName':
          response.err.lastName = error.msg;
          break;

        case 'email':
          response.err.email = error.msg;
          break;

        case 'password':
          response.err.password = error.msg;
          break;

        case 'passwordConfirm':
          response.err.passwordConfirm = error.msg;
          break;

        default:
          break;
      }
    }

    res.send(response);
    return;
  }

  // All input fields had valid values

  // Encrypt the password
  const passwordHash = await bcrypt.hash(req.body.password, 10);

  // Handle registration time
  const nowUtcIso = DateTime.now().toUTC().toISO();

  const data: {
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
    password: string;
    registeredOn: string;
    registeredWith: string;
    accumulatedTime: number;
  } = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    displayName: `${req.body.firstName} ${req.body.lastName}`,
    email: req.body.email,
    password: passwordHash,
    registeredOn: nowUtcIso,
    registeredWith: 'local',
    accumulatedTime: 0,
  };

  // Save driver to the database
  const result = await Driver.create(data);

  if (result) {
    res.send({ success: true });
    return;
  }

  res.send({ success: false });
};

export const updatePersonalInfo = async (req: Request, res: Response) => {
  // Finds the validation errors in this request and wraps them in an object
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let response = {
      err: {
        firstName: '',
        lastName: '',
      },
      success: false,
    };

    for (const error of errors.array()) {
      switch (error.param) {
        case 'firstName':
          response.err.firstName = error.msg;
          break;

        case 'lastName':
          response.err.lastName = error.msg;
          break;

        default:
          break;
      }
    }

    res.send(response);
    return;
  }

  // All input fields had valid values
  const result = await Driver.updatePersonalInfo(
    parseInt(req.params.driverId),
    req.body.firstName,
    req.body.lastName
  );

  res.send({ success: result });
};

export const updateContactInfo = async (req: Request, res: Response) => {
  // Finds the validation errors in this request and wraps them in an object
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let response = {
      err: {
        email: '',
      },
      success: false,
    };

    for (const error of errors.array()) {
      switch (error.param) {
        case 'email':
          response.err.email = error.msg;
          break;

        default:
          break;
      }
    }

    res.send(response);
    return;
  }

  // All input fields had valid values
  const result = await Driver.updateContactInfo(
    parseInt(req.params.driverId),
    req.body.email
  );

  res.send({ success: result });
};

export const updatePassword = async (req: Request, res: Response) => {
  // Finds the validation errors in this request and wraps them in an object
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let response = {
      err: {
        currentPassword: '',
        newPassword: '',
      },
      success: false,
    };

    for (const error of errors.array()) {
      switch (error.param) {
        case 'currentPassword':
          response.err.currentPassword = error.msg;
          break;

        case 'newPassword':
          response.err.newPassword = error.msg;
          break;

        default:
          break;
      }
    }

    res.send(response);
    return;
  }

  // All input fields had valid values
  // Encrypt the new password
  const newPasswordHash = await bcrypt.hash(req.body.newPassword, 10);
  const result = await Driver.updatePassword(
    parseInt(req.params.driverId),
    newPasswordHash
  );

  res.send({ success: result });
};
