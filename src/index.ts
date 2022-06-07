import http from 'http';

// NPM package imports
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Server } from 'socket.io';

// Models imports
import Address from './models/Address';
import Driver from './models/Driver';

// Routers imports
import { driverAuthRouter } from './routers/driver/auth.router';
import { driverMainRouter } from './routers/driver/driver.router';

// Interfaces imports
import { IPostgresDriver } from './interfaces/interface.db';

import db from './db/db.config';
import localAuth from './utils/passport/passport.local';

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_HOSTNAME],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('trust proxy', 1);
/* -------------------------------------------------------------------------- */
/*                          MIDDLEWARE CONGFIGURATION                         */
/* -------------------------------------------------------------------------- */
app.use(express.json());

app.use(
  cors({
    origin: function (origin, callback) {
      // bypass the requests with no origin (like curl requests, mobile apps, etc )
      if (!origin) return callback(null, true);

      if (
        [
          process.env.CLIENT_HOSTNAME,
          process.env.CLIENT_ADMIN_HOSTNAME,
          process.env.CLIENT_INSPECTOR_HOSTNAME,
        ].indexOf(origin) === -1
      ) {
        var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(
  session({
    secret: 'secretcode',
    resave: true,
    name: 'connect.sid',
    saveUninitialized: true,
    cookie:
      process.env.NODE_ENV === 'development'
        ? { httpOnly: false }
        : {
            sameSite: 'none',
            secure: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // One Week
            httpOnly: false,
          },
  })
);

app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());
passport.use(localAuth);

passport.serializeUser(
  (user: IPostgresDriver & { role: string }, done: any) => {
    done(null, { id: user.id, role: user.role });
  }
);

passport.deserializeUser(
  async (serializedUser: { id: number; role: string }, done: any) => {
    // Driver
    if (serializedUser.role === 'driver') {
      try {
        const user = await Driver.findOne('id', serializedUser.id);

        let { password, ...sanitizedUser }: any = user;

        // Add role field
        sanitizedUser['role'] = serializedUser.role;

        done(null, sanitizedUser);
      } catch (error) {
        console.log(error);
      }
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                                   ROUTING                                  */
/* -------------------------------------------------------------------------- */
app.use('/driver', driverMainRouter);
app.use('/driver/auth', driverAuthRouter);

io.on('connection', (socket) => {
  socket.emit(
    'connection-success',
    'Socket connection has been initialized successfully.'
  );
  socket.on('fetch-addresses', async () => {
    const data = await Address.fetchAll();
    socket.emit('addresses', data);
  });
});

server.listen(port, async () => {
  console.log(`App is running on port ${port}`);
  const result = await db.query(`SELECT NOW()`);
  console.log(`[db] ${result.rows[0].now}`);
});
