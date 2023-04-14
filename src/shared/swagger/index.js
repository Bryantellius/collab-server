const { Router } = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJson = require("../../../docs/swagger.json");

const router = Router();

const swaggerOptions = {
  explorer: true,
};

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerJson, swaggerOptions));

module.exports = router;
