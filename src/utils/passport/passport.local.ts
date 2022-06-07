// NPM package imports
import passportLocal from 'passport-local';
import bcrypt from 'bcryptjs';

// Models imports
import Driver from '../../models/Driver';

// Interfaces imports
import { IPostgresDriver } from 'src/interfaces/interface.db';

import { isObjectEmpty } from '../utils';
/* -------------------------------------------------------------------------- */

const LocalStrategy = passportLocal.Strategy;

const localAuth = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async function (username, password, done) {
    try {
      let user: IPostgresDriver & { role?: string } = await Driver.findOne(
        'email',
        username
      );

      // Check if the returned user or admin object is empty
      if (isObjectEmpty(user)) {
        // Email doesn't match any database entry in either users or admins table

        return done(null, false);
      } else {
        // Email matched a database entry

        if (!isObjectEmpty(user)) {
          // Email matches a driver
          // Compare provided password with stored password
          const match = await bcrypt.compare(password, user.password); // true/false

          if (!match) {
            return done(null, false);
          }

          // Add user role before serialization
          user['role'] = 'driver';
          return done(null, user);
        }
      }
    } catch (error) {
      return done(error);
    }
  }
);

export default localAuth;
