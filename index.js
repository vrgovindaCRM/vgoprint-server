const express = require("express");
const cors = require("cors");
const connect = require("./src/config/connect");
const errorHandler = require('./src/middlewares/errorHandler');
const validateProduct = require('./src/middlewares/validateProduct');
require("dotenv").config();
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(errorHandler);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const { userRoute } = require("./src/routes/user.routes");
const { productRoute } = require("./src/routes/product.routes");
const { sizeRouter } = require("./src/routes/size.routes")
const { homepageRouter } = require("./src/routes/homepage.routes");
const { footerRouter } = require("./src/routes/footerAddress.routes");
const { adminRouter } = require("./src/routes/admin.routes");
const { orderRouter } = require("./src/routes/order.routes");
const { aboutRouter } = require("./src/routes/about.routes");
const { ownDetailsRouter } = require("./src/routes/ownDetails.routes");
const { visionRouter } = require("./src/routes/visionmissionpolicy.routes");
const { Descriptionrouter } = require("./src/routes/productDescription.routes");
const { paymentRoutes } = require("./src/routes/payment.routes");
const termsRouter = require("./src/routes/terms.routes");
const enquiryRouter = require("./src/routes/enquiry.routes");
const contactRouter = require("./src/routes/contact.routes");

app.use("/user", userRoute);
app.use("/product", productRoute);
app.use("/home-page-printing-details", homepageRouter);
app.use("/address", footerRouter);
app.use("/admin", adminRouter);
app.use("/size",sizeRouter)
app.use('/order',orderRouter);
app.use('/about',aboutRouter);
app.use('/ownDetails',ownDetailsRouter);
app.use('/vissionmissionpolicy',visionRouter)
app.use('/description',Descriptionrouter);
app.use('/payment',paymentRoutes);
app.use('/terms',termsRouter);
app.use('/enquiry', enquiryRouter);
app.use('/contact', contactRouter)

app.get("/", (req, res) => {
  res.render("animation");
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await connect();
    console.log(`Connected to MongoDB and server listening on port ${PORT}`);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
});
