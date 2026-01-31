const express = require("express");
const router = express.Router();

const trekController = require("../controllers/trekController");
const upload = require("../middleware/multer");

router.post(
  "/",
  upload.fields([
    { name: "TrekImage", maxCount: 1 },
    { name: "TrekGallery", maxCount: 10 },
  ]),
  trekController.createTrek,
);

router.put(
  "/:id",
  upload.fields([
    { name: "TrekImage", maxCount: 1 },
    { name: "TrekGallery", maxCount: 10 },
  ]),
  trekController.updateTrek,
);
router.get("/filter", trekController.filterTreksByDifficulty);
router.get("/", trekController.getAllTreks);
router.get("/:id", trekController.getTrekById);

router.delete("/:id", trekController.deleteTrek);

module.exports = router;
