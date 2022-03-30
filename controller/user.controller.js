//here define methodes that uses Model to CRUD userModel
//but accepts req,res callback

var UserModel = require('../model').UserModel;
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs')
var dbTransaction = require('../model/dbManager/dbTransaction');
var dbConstants = require('../model/dbManager/dbConstants');
var StoryModel = require('../model').StoryModel;


var envConfig = require('../config').envConfig;

function userModelController() {}

userModelController.prototype.signUp = function(req, res) {
    //get userModel data usign the model and register him.
    var userModel = new UserModel(req.body);
    userModel.findUserByUsername((err, results) => {
        if (err) throw err;
        if (results.length != 0) {
            return res.send({
                'success': 'false',
                'reason': 'username already taken'
            });
        } else {
            //Register User here...
            userModel.createUser((err, results) => {
                if (err) throw err;
                var jwtToken = jwt.sign({ userModel }, envConfig.jwtSecret);
                userModel.findUserByUsername((err, results) => {
                    if (err) throw err;
                    return res.status(200).send({
                        'success': 'true',
                        'token': jwtToken,
                        'userId': results[0].uid
                    });
                });
            });
        }
    });

}
userModelController.prototype.login = function(req, res) {
    var userModel = new UserModel(req.body);
    console.log("HERE ON LOGIN REQ");
    //check the user using his username
    userModel.findUserByUsername((err, results) => {
        if (err) throw err;
        if (results.length == 0) {
            return res.status(404).send({
                'success': 'false',
                'reason': 'Wrong Username or Password'
            });
        } else {
            var retrivedUser = new UserModel(results[0]);
            var isPasswordValid = bcrypt.compareSync(userModel.password, retrivedUser.password);
            if (isPasswordValid) {
                var token = jwt.sign({ userModel }, envConfig.jwtSecret, { expiresIn: 86400 });
                return res.status(200).send({
                    'success': 'true',
                    token,
                    'userId': results[0].uid
                });
            } else {
                return res.status(404).send({
                    'success': 'false',
                    'reason': 'Wrong Username or Password'
                });
            }
        }
    });
}

userModelController.prototype.getProfile = function(req, res) {
    var userId = req.url.slice(1, req.url.length);
    console.log(userId)
    var CONDITION = `uid = '${userId}'`;
    dbTransaction.selectSingleRow(dbConstants.USER_TABLE, CONDITION, (err, results) => {
        if (err) throw err;
        if (results.length == 0) {
            return res.status(404).send({
                'success': 'false',
                'reason': "No User found."
            });
        } else {
            return res.status(200).send({
                'uid': results[0].uid,
                'full_name': results[0].full_name,
                'username': results[0].username,
                'email': results[0].email,
                'ppicLink': results[0].pp_link,
                'noOfFollowers': results[0].no_of_followers,
                'bio': results[0].bio
            })
        }
    });
}

userModelController.prototype.writeStory = function(req, res) {
    var story = new StoryModel(req.body);
    story.createStory((err, results) => {
        if (err) throw err;
        return res.status(200).send({
            'success': 'true',
        });
    });
}

userModelController.prototype.getHomeStory = function(req, res) {
    var userId = req.url.slice(1, req.url.length - 5);
    var user = new UserModel(req);
    user.getFollowingStory(userId, (err, results1) => {
        if (err) throw err;
        user.getExploreUsers(userId, (err, results) => {
            if (err) throw err;
            return res.status(200).send({
                storyList: results1,
                userList: results
            });
        });
    });
}

userModelController.prototype.getExploreStory = function(req, res) {
    var story = new StoryModel(req);
    var topic = req.url.split("/")[3];
    story.getNewestStories(topic, (err, results) => {
        if (err) throw err;
        return res.status(200).send({
            storyList: results
        });
    });
}

userModelController.prototype.getExplorePeople = function(req, res) {
    var user = new UserModel(req);
    var userId = req.url.split("/")[1];
    user.getExploreUsers(userId, (err, results) => {
        if (err) throw err;
        return res.status(200).send({
            userList: results
        });
    });
}

userModelController.prototype.setWellWritten = function(req, res) {
    var storyId = req.url.substring(1, req.url.length - 5);
    var CONDITION = ` sid = ${storyId}`;
    console.log(req.url);
    dbTransaction.selectSingleRow(dbConstants.STORY_TABLE, CONDITION, (err, results) => {
        if (err) throw err;
        dbTransaction.updateRow(dbConstants.STORY_TABLE, ["no_of_well_written"], [Number(results[0].no_of_well_written) + 1], CONDITION,
            (err, results) => {
                if (err) throw err;
                return res.status(200).send({
                    'success': 'true'
                });
            });
    }, ["no_of_well_written"]);


}

userModelController.prototype.reportStory = function(req, res) {
    var url = req.url.split("/");
    var userId = url[1],
        storyId = url[2],
        type = url[4];
    dbTransaction.addRow(dbConstants.REPORT_TABLE, [dbConstants.COL_UID,
        dbConstants.COL_SID,
        dbConstants.COL_TYPE,
    ], [userId,
        storyId,
        type
    ], (err, results) => {
        if (err) throw err;
        return res.status(200).send({
            'success': 'true'
        });
    });
}

userModelController.prototype.followUser = function(req, res) {
    var url = req.url.split("/");
    var userToFollow = url[2];
    var follower = url[1];
    var type = url[3];
    console.log(req.url);
    var user = new UserModel(req);
    user.followUnfollow(userToFollow, follower, type, (err, results) => {
        if (err) throw err;
        return res.status(200).send({
            'success': 'true'
        });
    });
}

userModelController.prototype.setBio = function(req, res) {
    var user = new UserModel(req);
    var bio = req.body.bio;
    var userId = req.url.split("/")[1];
    user.setBio(userId, bio, (err, results) => {
        if (err) throw err;
        return res.status(200).send({
            'success': 'true'
        });
    });
}

userModelController.prototype.searchUser = function(req, res) {
    var user = new UserModel(req);
    var userName = req.body.userName;
    console.log(userName);
    user.searchUser(userName, (err, results) => {
        if (err) throw err;
        return res.status(200).send({
            userList: results
        });
    });
}
userModelController.prototype.searchArticle = function(req, res) {
    var story = new StoryModel(req);
    var title = req.body.title;
    console.log(title);
    story.searchArticle(title, (err, results) => {
        if (err) throw err;
        return res.status(200).send({
            storyList: results
        });
    });
}

module.exports = new userModelController();