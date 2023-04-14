const { Router } = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Collab API",
      version: "1.0.0",
    },
  },
  apis: ["./src/components/**/*.controller.js"],
};

const openapiSpecification = swaggerJsdoc(options);

const router = Router();

router.use("/", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

module.exports = router;
