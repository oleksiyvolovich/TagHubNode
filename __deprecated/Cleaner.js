'use strict';

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/taghub', {useNewUrlParser: true, useUnifiedTopology: true})
	.then(() => console.log('MongoDB connected'))
	.catch((err) => console.log(err));

const channelSchema = new mongoose.Schema({
	name: String,
	tags: [String]
});

const Message = mongoose.model('Message', new mongoose.Schema({
	text: String,
	tags: [String]
}));

const TagHubUserSchema = new mongoose.Schema({
	username: {type: String, required: true, unique: true},
	password: {type: String, required: true}
});
const TagHubUser = mongoose.model('TagHubUser', TagHubUserSchema);

const TagHubUserDataSchema = new mongoose.Schema({
	username: {type: String, required: true, unique: true},
	likedMessagesGUIDS: [String],
	channelModels: [channelSchema],
	postedMessagesGUIDS: [String],
	additionalData: [String]
});

const TagHubUserData = mongoose.model('TagHubUserData', TagHubUserDataSchema);

TagHubUserData.deleteMany({}).then((result) => console.log(`Deleted ${result.deletedCount} user datas`));
TagHubUser.deleteMany({}).then((result) => console.log(`Deleted ${result.deletedCount} users`));

/* Message.deleteMany({
    $or: [
        { text: { $exists: false } },
        { text: "empty" },
        { text: { $eq: '' } },
        { tags: { $exists: false } },
        { tags: { $size: 0 } },
    ]
})
    .then((result) => console.log(`Deleted ${result.deletedCount} messages`))
    .catch((err) => console.log(err))
    .finally(() => mongoose.disconnect());*/
