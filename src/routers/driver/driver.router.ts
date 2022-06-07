//NPM packages imports
import express from 'express';
import insertVehicleValidator from '../../utils/validators/driver/forms/insert-vehicle.form.validator';

// Controllers imports
import * as driverController from '../../controllers/driver/driver.controller';
import * as vehicleController from '../../controllers/vehicle/vehicle.controller';
import * as cardController from '../../controllers/card/card.controller';
import * as stripeController from '../../controllers/stripe/stripe.controller';
import * as addressController from '../../controllers/address/address.controller';

// Validators imports
import registerValidator from '../../utils/validators/driver/forms/register.form.validator';
import updatePersonalInfoValidator from '../../utils/validators/driver/forms/update-personal-info.form.validator';
import updateContactInfoValidator from '../../utils/validators/driver/forms/update-contact-info.form.validator';
import updatePasswordValidator from '../../utils/validators/driver/forms/update-password.form.validator';
/* -------------------------------------------------------------------------- */

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                 GET ROUTES                                 */
/* -------------------------------------------------------------------------- */
router.get('/address/:addressId', addressController.getAddress)
// Remove a driver's saved vehicle
router.get('/delete/vehicle/:vehicleId', vehicleController.deleteVehicle);
// Fetch inactive card/s (if any) of a specific driver
router.get(
  '/:driverId/select/inactive-cards',
  cardController.selectInactiveCards
);
// Fetch active card/s (if any) of a specific driver
router.get('/:driverId/select/active-cards', cardController.selectActiveCards);
// Fetch saved vehicles (if any) of a specific driver
router.get('/:driverId/vehicles', vehicleController.getVehicles);

/* -------------------------------------------------------------------------- */
/*                                 POST ROUTES                                */
/* -------------------------------------------------------------------------- */
// Update a driver's contact info (email)
router.post(
  '/:driverId/account/password/update',
  updatePasswordValidator,
  driverController.updatePassword
);
// Update a driver's contact info (email)
router.post(
  '/:driverId/account/contact-info/update',
  updateContactInfoValidator,
  driverController.updateContactInfo
);
// Update a driver's personal info (firstName, lastName)
router.post(
  '/:driverId/account/personal-info/update',
  updatePersonalInfoValidator,
  driverController.updatePersonalInfo
);
// Extend a cards duration
router.post('/card/:cardId/extend', cardController.extendCard);
// Cancel a specific driver's card
router.post('/card/cancel', cardController.cancelCard);
// Insert a new parking card in to the database
router.post('/card/insert', cardController.insertCard);
// Create stripe payment intent
router.post(
  '/payment/create-payment-intent',
  stripeController.createPaymentIntent
);
// Edit a vehicle's info
router.post(
  '/update/vehicle/:vehicleId',
  insertVehicleValidator,
  vehicleController.updateVehicle
);
// Insert a new vehicle in to the database
router.post(
  '/:driverId/insert/vehicle',
  insertVehicleValidator,
  vehicleController.insertVehicle
);
router.post('/register', registerValidator, driverController.registerDriver);

export { router as driverMainRouter };
