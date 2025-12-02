const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
    invoice: {
      type: Number,
      required: false,
      default: 0,
    },
    cart: [{}],
    user_info: {
      name: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      contact: {
        type: String,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      country: {
        type: String,
        required: false,
      },
      zipCode: {
        type: String,
        required: false,
      },
    },
    subTotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },
    shippingOption: {
      type: String,
      required: false,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    cardInfo: {
      type: Object,
      required: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Delivered", "Cancel"],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-increment invoice number
orderSchema.pre("save", async function () {
  if (this.isNew && !this.invoice) {
    try {
      const lastOrder = await mongoose.model("Order").findOne({}, { invoice: 1 }).sort({ invoice: -1 });
      this.invoice = lastOrder ? lastOrder.invoice + 1 : 10000;
    } catch (error) {
      console.error("Error generating invoice number:", error);
      this.invoice = 10000;
    }
  }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
