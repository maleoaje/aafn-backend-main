const express = require("express");
const router = express.Router();
const {
  addOrder,
  getOrderById,
  getOrderCustomer,
  createPaymentIntent,
  addRazorpayOrder,
  createOrderByRazorPay,
  sendEmailInvoiceToCustomer,
} = require("../controller/customerOrderController");

const { isAuth } = require("../config/auth");
const { emailVerificationLimit } = require("../lib/email-sender/sender");

//test endpoint
router.post("/test", (req, res) => {
  res.status(200).send({ message: "Test endpoint works!" });
});

//add a order (requires auth)
router.post("/add", isAuth, addOrder);

// create stripe payment intent
router.post("/create-payment-intent", createPaymentIntent);

//add razorpay order
router.post("/add/razorpay", addRazorpayOrder);

//add a order by razorpay
router.post("/create/razorpay", createOrderByRazorPay);

//get a order by id
router.get("/:id", getOrderById);

//get all order by a user (requires auth)
router.get("/", isAuth, getOrderCustomer);

//#send email invoice to customer
router.post(
  "/customer/invoice",
  emailVerificationLimit,
  sendEmailInvoiceToCustomer
);

module.exports = router;
