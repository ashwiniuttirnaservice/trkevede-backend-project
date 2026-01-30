const express = require("express");
const router = express.Router();

const {
    addToWishlist,
    removeFromWishlist,
    getMyWishlist,
    checkWishlist,
} = require("../controllers/wishlistController");




router.post("/", addToWishlist);
router.get("/", getMyWishlist);
router.get("/check/:trekId", checkWishlist);
router.delete("/:trekId", removeFromWishlist);

module.exports = router;
