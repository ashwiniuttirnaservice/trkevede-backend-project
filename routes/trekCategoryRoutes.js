const express = require("express");
const router = express.Router();

const trekCategoryController = require("../controllers/trekCategorycController");

const upload = require("../middleware/multer");

router.post(
  "/",
  upload.single("TrekCategoryImage"),
  trekCategoryController.createCategory,
);

router.get("/", trekCategoryController.getAllCategories);

router.get("/:id", trekCategoryController.getCategoryById);

router.put(
  "/:id",
  upload.single("TrekCategoryImage "),
  trekCategoryController.updateCategory,
);

router.delete("/:id", trekCategoryController.deleteCategory);

module.exports = router;
