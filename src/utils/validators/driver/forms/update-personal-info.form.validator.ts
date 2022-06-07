import { check } from 'express-validator';
import { isObjectEmpty } from '../../../utils';

import Driver from '../../../../models/Driver';

const updatePersonalInfoValidator = [
  check('firstName')
    .trim()
    .stripLow()
    .not()
    .isEmpty()
    .withMessage('Εισάγετε τιμή σε αυτό το πεδίο.')
    .bail()
    .customSanitizer((value) => {
      let titleCased = value.toLowerCase();
      titleCased = titleCased.charAt(0).toUpperCase() + titleCased.slice(1);
      return titleCased;
    }),
  check('lastName')
    .trim()
    .stripLow()
    .not()
    .isEmpty()
    .withMessage('Εισάγετε τιμή σε αυτό το πεδίo.')
    .bail()
    .customSanitizer((value) => {
      let titleCased = value.toLowerCase();
      titleCased = titleCased.charAt(0).toUpperCase() + titleCased.slice(1);
      return titleCased;
    }),
];

export default updatePersonalInfoValidator;
