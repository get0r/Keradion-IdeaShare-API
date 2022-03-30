//here connect routes with controller methodes
/*
Example
get app from ./index.js as a parameter

then use app to get
app.get("/signup",userController.createUser);


*/
var express = require('express');
var router = express.Router();
var userController = require('../controller/user.controller');


router.get("/", function(req, res) {
    res.status(200).send("Heroku Keradion");
});

router.post("/search", userController.searchUser);
router.post("/search/article", userController.searchArticle);
router.post("/signUp", userController.signUp);
router.post("/login", userController.login);
router.post("/:userId/post", userController.writeStory);
router.post("/:userId/bio", userController.setBio);
router.get("/:userId", userController.getProfile);
router.get("/:userId/home", userController.getHomeStory);
router.get("/:userId/explore/:topic", userController.getExploreStory);
router.get("/:userId/expeople", userController.getExplorePeople);
router.get("/:storyId/well", userController.setWellWritten);
router.get("/:userId/:uid/follow", userController.followUser);
router.get("/:userId/:uid/unfollow", userController.followUser);
router.get("/:userId/:storyId/report/:type", userController.reportStory);

module.exports = router;