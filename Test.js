const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);

async function generateText() {
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: "Hello world",
    });
    console.log(completion.data.choices[0].text);
}

generateText();
