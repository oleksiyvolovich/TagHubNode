const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const apn = require('apn');
const path = require('path');

const app = express();

// Определение схемы и модели сообщения

// Подключение к MongoDB
mongoose.connect('mongodb://localhost/taghub', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("server connected to taghub"))
    .catch((err) => console.log(err));


const chatSchema = new mongoose.Schema({
    targetUser:String,
    messagesGUIDs:[String]
});

const channelSchema = new mongoose.Schema({
    name:String,
    tags: [String]
});

const TagHubUserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const TagHubUserDataSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    likedMessagesGUIDS:[String],
    channelModels:[channelSchema],
    postedMessagesGUIDS:[String],
    additionalData:[String]
})
const messageSchema = new mongoose.Schema({
    mediaFiles: [String],
    guid:String,
    text: String,
    author: String,
    creationTime: String,
    tags: [String]
});


const commentSchema = new mongoose.Schema({
    messageGUID: { type: String, required: true },
    comments: [messageSchema]
});
const logSchema = new mongoose.Schema({
    message:String
});

TagHubUserSchema.pre('save', function(next) {
    const user = this;
    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

const TagHubUserData = mongoose.model('TagHubUserData',TagHubUserDataSchema);

const TagHubUser = mongoose.model('TagHubUser', TagHubUserSchema);


const Message = mongoose.model('Message', messageSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Channel = mongoose.model("Channel",channelSchema)
const LogModel= mongoose.model("LogModel", logSchema);
const ChatModel= mongoose.model("ChatModel", chatSchema);

// Парсинг тела запроса
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const filePath = path.join(__dirname, 'AuthKey_2KM5Q88N5G.p8');

// настройки APNS-сервера
const options = {
    token: {
        key: filePath,
        keyId: '2KM5Q88N5G',
        teamId: 'XSJJ46AGM5'
    },
    production: true // false для sandbox, true для production-режима
};

const apnProvider = new apn.Provider(options);

app.post('/comments', async (req, res) => {
    const { messageGUID, comments } = req.body;

    console.log(comments);
    try {
        // Проверяем, существует ли запись в базе данных для данного сообщения
        let commentData = await Comment.findOne({ messageGUID });

        if (!commentData) {
            // Если запись не существует, создаем новый объект комментария и сохраняем его в базе данных
            commentData = new Comment({
                messageGUID,
                comments
            });
            await commentData.save();
        } else {
            // Если запись существует, обновляем ее, добавляя новые комментарии
            commentData.comments.push(...comments);
            await commentData.save();
        }

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/updateUserData', async (req, res) => {
    const { username, likedMessagesGUIDS, postedMessagesGUIDS,channelModels,additionalData } = req.body;

    try {
        // Находим данные пользователя в базе данных
        const userData = await TagHubUserData.findOne({ username });
        if (!userData) {
            // Если данных пользователя нет, вернем ошибку
            return res.status(404).json({ error: "User data not found" });
        }

        // Обновляем поля данных пользователя
        userData.likedMessagesGUIDS = likedMessagesGUIDS;
        userData.postedMessagesGUIDS = postedMessagesGUIDS;
        userData.channelModels = channelModels;
        userData.additionalData = additionalData;
        await userData.save();

        // Возвращаем обновленный объект данных пользователя
        return res.status(200).json(userData);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Проверяем, существует ли пользователь в базе данных
        const user = await TagHubUser.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Incorrect username or password" });
        }

        // Проверяем, соответствует ли пароль
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Incorrect username or password" });
        }

        // Ищем данные пользователя в базе данных
        const userData = await TagHubUserData.findOne({ username },{ _id: 0, __v: 0 });
        if (!userData) {
            // Если данных пользователя нет, создаем новый объект данных пользователя
            const newUserData = new TagHubUserData({
                username: user.username,
                likedMessagesGUIDS: [],
                channelModels: [],
                postedMessagesGUIDS: [],
                additionalData:[]
            });
            await newUserData.save();

            // Возвращаем новый объект данных пользователя
            return res.status(200).json(newUserData);
        }

        // Если данные пользователя уже существуют, возвращаем их
        return res.status(200).json(userData);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log("registration request");
    console.log(req.body);

    try {
        const user = await TagHubUser.create({ username, password });
        res.status(201).json({ success: true });

        const newUserData = new TagHubUserData({
            username: username,
            likedMessagesGUIDS: [],
            channelModels: [],
            postedMessagesGUIDS: [],
            additionalData:[]
        });
        await newUserData.save();

        console.log("registration success for user " + username);
    } catch (err) {
        res.status(400).json({ error: err.message });
        console.log("registration failed");
    }
});

app.post('/logs', (req, res) => {
    const log = new LogModel(req.body);

    console.log(log.message);
    res.send('log has been posted');
});

app.post('/messages', (req, res) => {
    const message = new Message(req.body);

    console.log(message);

    message.save()
        .then(async () => {

            console.log("start searching for users");

            const users = await TagHubUserData.find({
                channelModels: {
                    $elemMatch: {
                        tags: { $in: message.tags }
                    }
                }
            });

            console.log("Users" + users);

            // Формируем массив устройств для отправки уведомлений
            const devices = users.map(user => user.additionalData);
            const uniqueDevices = devices.filter((device, index) => {
                return devices.indexOf(device) === index;
            });



            console.log("Devices" + devices);

            // Формируем пакет уведомлений
            const notification = new apn.Notification({
                alert: message.text,
                topic: 'com.alexeyvolovych.taghub',
                payload: { message: message.guid }
            });
            for (let i = 0; i < uniqueDevices.length; i++){
                apnProvider.send(notification, uniqueDevices[i])
                    .then((result) => console.log('Уведомление отправлено успешно:'))
                    .catch((error) => console.error('Ошибка отправки уведомления:', error));
            }
            res.send('Message was successfully saved to database');
        })
        .catch((err) => res.status(400).send('Unable to save to database'));
});

app.put('/messages/:id', (req, res) => {
    console.log("put request");
    const id = req.params.id;
    const msg = new Message(req.body);

    console.log(req.body);
    console.log(msg.tags);

    Message.findOneAndUpdate({ guid: id }, { tags: msg.tags}, { new: true })
        .then((message) => {
            const { __v, ...rest } = message.toObject();
            console.log(rest);
            console.log("Updated");
            res.send(rest);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error updating message');
        });
});

app.delete('/messages/:id', (req, res) => {
    console.log("delete request");
    const id = req.params.id;
    Message.findOneAndDelete({ guid: id })
        .select('-_id -__v') // исключаем поля _id и __v из выборки
        .then((message) => {
            if (message) {
                res.send(message);
            } else {
                res.status(404).send('Message not found');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error deleting message');
        });
});


// get messages by GUID
app.get('/likedmessages', async (req, res) => {
    const guids = req.query.guids.split(',');
    
    console.log(guids);

    try {
        // Используем метод find для поиска сообщений с переданными GUID-ами
        const messages = await Message.find({ guid: { $in: guids } });

        return res.status(200).json(messages);
    } catch (error) {
        console.error('Ошибка при поиске сообщений:', error);
        return res.status(500).json({ error: 'An error occurred while fetching messages.' });
    }
});

app.get('/messages', (req, res) => {
    try {
        const tags = req.query.tags.split(',');

        console.log(tags);

        Message.find({ tags: { $regex: new RegExp(tags.join("|"), "i") } })
            .select('-_id -__v') // исключаем поля _id и __v из выборки
            .then((messages) => {
                if (messages.length > 0) {
                    const filteredMessages = messages.map((message) => {
                        const { _id, ...rest } = message.toObject();
                        return { id: _id, ...rest };
                    });
                    res.send(filteredMessages);
                } else {
                    res.status(404).send('No messages found');
                }
            })
            .catch((err) => {
                console.error(err)
                res.status(500).send('Error searching database')
            });
    } catch (err) {
        console.error(err)
        res.status(400).send('Invalid tags parameter')
    }
});

app.get('/comments/:guid', async (req, res) => {
    try {
        const comments = await Comment.findOne({ messageGUID: req.params.guid }, { _id: 0, __v: 0 });
        if (comments) {
            return res.status(200).json(comments);
        } else {
            return res.status(404).json({ error: "Comments not found" });
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(8000, () => console.log('Server started on port 8000'));
