const { Router } = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJson = require("../../../config/swagger.json");

const router = Router();

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerJson));

module.exports = router;
