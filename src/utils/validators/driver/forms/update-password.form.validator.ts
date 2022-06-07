import { check } from 'express-validator';
import { isObjectEmpty } from '../../../utils';
import bcrypt from 'bcryptjs';

import Driver from '../../../../models/Driver';

const updatePasswordValidator = [
  check('currentPassword')
    .not()
    .isEmpty()
    .withMessage('Εισάγετε τιμή σε αυτό το πεδίo.')
    .bail()
    .custom((value, { req }) => {
      return new Promise(async (resolve, reject) => {
        const driver = await Driver.findOne(
          'id',
          parseInt(req.params.driverId)
        );

        const match = await bcrypt.compare(value, driver.password); // true/false

        if (match) {
          resolve(true);
        } else {
          reject('Ο κωδικός πρόσβασης που εισάγατε δεν είναι σωστός.');
        }
      });
    }),
  check('newPassword')
    .not()
    .isEmpty()
    .withMessage('Εισάγετε τιμή σε αυτό το πεδίo.')
    .bail()
    .isLength({ min: 8 })
    .withMessage(
      'Ο κωδικός σας πρέπει να αποτελείται τουλάχιστον απο 8 χαρακτήρες.'
    )
    .bail()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})|^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,}|)$/
    )
    .withMessage(
      'Ο κωδικός σας πρέπει να περιέχει τουλάχιστον 1 κεφαλαίο γράμμα, 1 μικρό γράμμα, 1 αριθμό και 1 ειδικό χαρακτήρα.'
    )
    .bail(),
];

export default updatePasswordValidator;
