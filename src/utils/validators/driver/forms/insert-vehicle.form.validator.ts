import capitalize from 'capitalize';
import { check } from 'express-validator';
import { isObjectEmpty } from '../../../utils';

import Driver from '../../../../models/Driver';
import Vehicle from 'src/models/Vehicle';

const insertVehicleValidator = [
  check('vehicleName')
    .trim()
    .stripLow()
    .not()
    .isEmpty()
    .withMessage('Εισάγετε τιμή σε αυτό το πεδίο.')
    .bail()
    .isLength({ min: 2, max: 20 })
    .withMessage(
      'Το όνομα του οχήματος πρέπει να αποτελείται απο 2 εώς 20 χαρακτήρες.'
    )
    .bail()
    .customSanitizer((value: string) => {
      let str = value.toLowerCase();
      let strArr = str.split(' ');
      str = '';
      strArr.forEach((el) => {
        str = str + el.charAt(0).toUpperCase() + el.slice(1) + ' ';
      });

      return str.trim();
    }),
  check('licensePlate')
    .trim()
    .stripLow()
    .not()
    .isEmpty()
    .withMessage('Εισάγετε τιμή σε αυτό το πεδίo.')
    .bail()
    .isLength({ min: 4, max: 10 })
    .withMessage(
      'Ο αριθμός κυκλοφορίας του οχήματος πρέπει να αποτελείται απο 4 εώς 10 χαρακτήρες.'
    )
    .bail()
    .customSanitizer((value: string) => {
      return value.replace(' ', '').toUpperCase();
    }),
];

export default insertVehicleValidator;
