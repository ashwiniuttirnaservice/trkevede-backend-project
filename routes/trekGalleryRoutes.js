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

router.put(
  "/:id",
  upload.array("TrekGalleryImage", 10),
  trekGalleryController.updateGallery,
);

router.delete("/:galleryId/:itemId", trekGalleryController.deleteGalleryItem);

module.exports = router;
