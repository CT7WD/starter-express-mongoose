const router = require("express").Router({ mergeParams: true });
const controller = require("./users.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// router used for when request is send and ID is provided,
// it will go ahead and use the specified method,
// by linking controller.read, controller.update,
// controller.delete, or methodNotAllowed.
router
    .route("/:userId")
    .get(controller.read)
    .put(controller.update)
    .delete(controller.delete)
    .all(methodNotAllowed);

router
    .route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

module.exports = router;
