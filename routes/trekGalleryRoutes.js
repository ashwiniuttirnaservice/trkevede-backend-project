const express = require("express");
const router = express.Router();

const trekGalleryController = require("../controllers/trekGalleryController");

const upload = require("../middleware/multer");

router.post(
  "/",
  upload.array("TrekGalleryImage", 10),
  trekGalleryController.addGallery,
);

router.get("/", trekGalleryController.getAllGallery);

router.get("/:itemId", trekGalleryController.getGalleryItem);

router.put(
  "/:itemId",
  upload.array("TrekGalleryImage", 10),
  trekGalleryController.updateGalleryItem,
);

router.delete("/:itemId", trekGalleryController.deleteGalleryItem);

module.exports = router;
