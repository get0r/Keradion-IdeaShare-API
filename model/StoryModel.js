//importing DB transaction helper to read write.
var dbTransaction = require('./dbManager/dbTransaction');
var dbConstants = require('./dbManager/dbConstants');


var Story = function(story) {
    this.title = story.title;
    if (story.content)
        this.content = story.content.replace(/'/g, "\\'");
    else this.content = story.content;
    this.img_links = story.imgLinks || "";
    this.written_date = story.writtenDate;
    this.writer_id = Number(story.writerId);
    this.no_of_well_written = Number(story.no_of_well_written);
    this.g_topic = story.g_topic;
    this.s_topic = story.s_topic;
}

Story.prototype.createStory = function(callback) {
    dbTransaction.addRow(dbConstants.STORY_TABLE, [dbConstants.COL_TITLE,
            dbConstants.COL_CONTENT,
            dbConstants.COL_IMG_LINKS,
            dbConstants.COL_WRITER_ID,
            dbConstants.COL_WELL_WRITTEN,
            dbConstants.COL_GTOPIC,
            dbConstants.COL_STOPIC
        ], [this.title,
            this.content,
            this.img_links,
            this.writer_id,
            Number(this.no_of_well_written),
            this.g_topic,
            this.s_topic
        ],
        (err, result) => {
            if (err) callback(err);
            callback(null, result);
        }
    );
}

Story.prototype.getNewestStories = function(topic, callback) {
    var CONDITION = ` INNER JOIN ${dbConstants.USER_TABLE} ON Story.writer_id=User.uid`
    if (topic === "Newest") {
        CONDITION += ` ORDER BY written_date DESC`;
    } else if (topic === "Popular") {
        CONDITION += ` ORDER BY no_of_well_written DESC`;
    } else {
        CONDITION += ` WHERE g_topic = '${topic}'`;
    }
    dbTransaction.selectSingleRow(dbConstants.STORY_TABLE, CONDITION,
        (err, results) => {
            if (err) callback(err);
            callback(null, results);
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
Story.prototype.searchArticle = function(title, callback) {
    var CONDITION = `title LIKE '%${title}%'`;
    dbTransaction.searchTable(dbConstants.STORY_TABLE, CONDITION, (err, results) => {
        if (err) return callback(err);
        return callback(null, results);
    });
}

module.exports = Story;