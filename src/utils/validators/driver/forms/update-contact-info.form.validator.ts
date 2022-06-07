import { check } from 'express-validator';
import { isObjectEmpty } from '../../../utils';

import Driver from '../../../../models/Driver';

const updateContactInfoValidator = [
  check('email')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Εισάγετε τιμή σε αυτό το πεδίo.')
    .bail()
    .isEmail()
    .withMessage('Εισάγετε μια σωστή διεύθυνση ηλ. ταχυδρομείου.')
    .bail()
    .custom((value) => {
      return new Promise(async (resolve, reject) => {
        const driver = await Driver.findOne('email', value);
        if (isObjectEmpty(driver)) {
          resolve(true);
        } else {
          reject('Η διεύθυνση ηλ. ταχυδρομείου που εισάγατε χρησιμοποιείται.');
        }
      });
    }),
];

export default updateContactInfoValidator;
