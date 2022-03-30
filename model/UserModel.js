var bcrypt = require('bcryptjs');

//importing DB transaction helper to read write.
var dbTransaction = require('./dbManager/dbTransaction');
var dbConstants = require('./dbManager/dbConstants');
//user actions specifier



var User = function(user) {
    this.name = user.full_name;
    this.username = user.username;
    this.email = user.email;
    this.password = user.password;
    this.join_date = user.joinDate;
    this.bio = user.bio;
    this.pp_link = user.ppicLink;
    this.no_followers = user.noOfFollowers;
    this.no_written = user.noOfWrittenArticles;
}

User.prototype.createUser = function(callback) {
    //encrypt the password and save user info.
    this.password = bcrypt.hashSync(this.password, 8);
    dbTransaction.addRow(dbConstants.USER_TABLE, [dbConstants.COL_NAME,
            dbConstants.COL_USERNAME,
            dbConstants.COL_EMAIL,
            dbConstants.COL_PASSWORD,
            dbConstants.COL_BIO,
            dbConstants.COL_PP_LINK,
            dbConstants.COL_NO_FOLLOWERS,
            dbConstants.COL_NO_WRITTEN
        ], [this.name,
            this.username,
            this.email,
            this.password,
            this.bio,
            this.pp_link,
            Number(this.no_followers),
            Number(this.no_written)
        ],
        (err, result) => {
            if (err) callback(err);
            callback(null, result);
        }
    );
}

User.prototype.findUserByUsername = function(callback) {
    var CONDITION = `username = '${this.username}'`;
    dbTransaction.selectSingleRow(dbConstants.USER_TABLE, CONDITION, (err, result) => {
        if (err) callback(err);
        if (result) {
            callback(null, result);
        }
    });
}

User.prototype.getExploreUsers = function(userId, callback) {
    var CONDITION = `1 LIMIT 15`;
    dbTransaction.selectSingleRow(dbConstants.USER_TABLE, CONDITION, (err, results) => {
        if (err) callback(err);
        callback(null, results);
    }, [dbConstants.COL_UID,
        dbConstants.COL_NAME,
        dbConstants.COL_USERNAME,
        dbConstants.COL_EMAIL,
        dbConstants.COL_JOIN_DATE,
        dbConstants.COL_BIO,
        dbConstants.COL_PP_LINK,
        dbConstants.COL_NO_FOLLOWERS,
        dbConstants.COL_NO_WRITTEN
    ]);
}

User.prototype.findUserById = function(userId, callback) {
    var CONDITION = `uid = '${userId}'`;
    dbTransaction.selectSingleRow(dbConstants.USER_TABLE, CONDITION, (err, result) => {
        if (err) callback(err);
        if (result) {
            callback(null, result);
        }
    });
}
User.prototype.getFollowingStory = function(userId, callback) {
    var CONDITION = ` INNER JOIN (SELECT uid_followed FROM Followers WHERE uid_follower = ${userId}) AS Follower ON Story.writer_id = Follower.uid_followed INNER JOIN User ON Story.writer_id=User.uid`;
    dbTransaction.selectSingleRow(dbConstants.STORY_TABLE, CONDITION,
        (err, results) => {
            if (err) return callback(err);
            return callback(null, results);
        }, ['Story.sid',
            'Story.title',
            'Story.content',
            'Story.img_links',
            'Story.written_date',
            'User.full_name',
            'Story.no_of_well_written',
            'Story.g_topic',
            'Story.s_topic'
        ]);
}
User.prototype.followUnfollow = function(userToFollow, follower, type, callback) {
    dbTransaction.selectSingleRow(dbConstants.USER_TABLE, `uid=${userToFollow}`, (err, results) => {
        if (err) callback(err);
        var num = null
        dbTransaction.selectSingleRow(dbConstants.FOLLOWER_TABLE, `uid_followed=${userToFollow} AND uid_follower = ${follower}`, (err, result2) => {
            if (err) callback(err);
            if (result2.length != 0) {
                num = [Number(results[0].no_of_followers) - 1];
                type = "unfollow";
            } else {
                num = [Number(results[0].no_of_followers) + 1];
                type = "follow";
            }
            dbTransaction.updateRow(dbConstants.USER_TABLE, ["no_of_followers"], num, `uid=${userToFollow}`, (err, results) => {
                if (err) callback(err);
                if (type === "follow") {
                    dbTransaction.addRow(dbConstants.FOLLOWER_TABLE, [dbConstants.COL_UID_FOLLOWED,
                        dbConstants.COL_UID_FOLLOWER
                    ], [userToFollow,
                        follower
                    ], (err, results) => {
                        if (err) callback(err);
                        return callback(null, results);
                    });
                } else {
                    var CONDITION = ` ${dbConstants.COL_UID_FOLLOWED} = ${userToFollow} AND ${dbConstants.COL_UID_FOLLOWER} = ${follower}`;
                    dbTransaction.deleteRow(dbConstants.FOLLOWER_TABLE, CONDITION, (err, results) => {
                        if (err) callback(err);
                        return callback(null, results);
                    });
                }
            });
        });

    });

}
User.prototype.setBio = function(userId, bio, callback) {
    var CONDITION = `uid=${userId}`;
    dbTransaction.updateRow(dbConstants.USER_TABLE, ['bio'], [bio], CONDITION, (err, results) => {
        if (err) return callback(err);
        return callback(null, results);
    });
}
User.prototype.searchUser = function(userName, callback) {
    var CONDITION = `full_name LIKE '%${userName}%'`;
    dbTransaction.searchTable(dbConstants.USER_TABLE, CONDITION, (err, results) => {
        if (err) return callback(err);
        return callback(null, results);
    });
}
module.exports = User;