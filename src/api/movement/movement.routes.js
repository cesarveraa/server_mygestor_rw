const express = require('express');
const router = express.Router();
const { getMovements,deleteMovement, addMovement, updateMovement} = require('./movement.controller');


router.get('/:recordId', getMovements);
router.delete("/:recordId/:movementId", deleteMovement);
router.post('/:recordId', addMovement);
router.put("/:recordId/:movementId", updateMovement);

module.exports = router;
