const { Configuration, OpenAIApi } = require("openai");
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const configuration = new Configuration({
    apiKey: "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",
});

// Подключение к MongoDB
mongoose.connect('mongodb://localhost/taghub', { useNewUrlParser: true, useUnifiedTopology: true })
    .then( () => {
        console.log('Creator connected.MongoDB connected');
         populateDatabase();
    })
    .catch((err) => console.log(err));

// Определение схемы и модели сообщения
const messageSchema = new mongoose.Schema({
    guid:String,
    text: String,
    tags: [String]
});

const Message = mongoose.model('Message', messageSchema);

// Подключение к OpenAI API
const openaiApi = new OpenAIApi(configuration);

// Парсинг тела запроса
const app = express();
app.use(bodyParser.json());

// Функция для генерации текста сообщения с помощью OpenAI
async function generateMessage(tags) {
    console.log("generaiong begin");

    const prompt =`Create a message related to next themes: ${tags.join(', ')} `;

    let message = "empty";

    try{
        const completions = await openaiApi.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 1024,
            /*n: 1,
            stop: '\n'*/
        });

        message = completions.data.choices[0].text.trim();

        console.log(message);
    }catch (error)
    {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
    }

    return message;
}

function generateGuid() {
    let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.floor(Math.random() * 16);
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    return guid;
}


// Заполнение базы данных сообщениями
async function populateDatabase() {
    const tagsList = [
        'Trade', 'Ukraine', 'Work', 'Unity', 'Nature',
        'Big Cities', 'Concerts', 'Music', 'War', 'Science','News','History','Movies'
    ];

    for (let i = 0; i < 1000; i++) {
        const tags = [];
        const messageTagsCount = Math.floor(Math.random() * 10) + 1;

        for (let j = 0; j < messageTagsCount; j++) {
            const tagIndex = Math.floor(Math.random() * tagsList.length);
            tags.push(tagsList[tagIndex]);
        }

        const messageText = await generateMessage(tags).catch("OpenAI error");

        console.log("message generation finish");
        const message = new Message({ guid:generateGuid(),text: messageText, tags: tags });

        console.log("result message " + message);

        message.save()
            .then(console.log("Saved to database"))
            .catch((err) => console.log("saving failed with error"));
    }
}


console.log("Finished with success");
