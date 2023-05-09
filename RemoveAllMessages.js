const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/taghub', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

const Message = mongoose.model('Message', new mongoose.Schema({
    text: String,
    tags: [String]
}));

Message.deleteMany({})
    .then((result) => console.log(`Deleted ${result.deletedCount} messages`))
    .catch((err) => console.log(err))
    .finally(() => mongoose.disconnect());
