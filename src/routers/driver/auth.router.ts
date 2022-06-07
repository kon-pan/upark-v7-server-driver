//NPM packages imports
import express, { Request, Response } from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/get', (req: Request, res: Response) => {
  res.send(req.user);
});

router.post('/login', passport.authenticate('local'), function (req, res) {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.

  res.send({ success: true });
});

router.get('/logout', function (req, res) {
  req.logout();
  res.send({ success: true });
});

export { router as driverAuthRouter };
