import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import readLineSync from "readline-sync";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

function getWeatherDetails(city){
    if(city.toLowerCase()==="wardha"){
        return '10 °C';
    }
    if(city.toLowerCase()==="nagpur"){
        return '14 °C';
    }
    if(city.toLowerCase()==="ayodhya"){
        return '18 °C';
    }
    if(city.toLowerCase()==="banaras"){
        return '19 °C';
    }
    if(city.toLowerCase()==="hyderabad"){
        return '20 °C';
    }
    if(city.toLowerCase()==="bangalore"){
        return '22 °C';
    }
}

const tools = {
    "getWeatherDetails": getWeatherDetails
}

const SYSTEM_PROMPT=`
You are an AI Assistant with START, PLAN, ACTION, Observation and Output State.
Wait for user prompt and first PLAN using available tools.
After planning take ACTION with appropriate tools and wait for Observation based on Action.
Once you get the observation, return AI Response base on START prompt and Observation.

Strictly follow the Json Output format as in examples.

Available Tools:
- function getWeatherDetails(city): Returns the current weather of the given city.

EXAMPLE:
START
{"type": "user", "user": "What is the sum of weather of wardha and nagpur?"}
{"type": "plan", "plan": "I will call the getWeatherDetails for Wardha."}
{"type": "action", "function": "getWeatherDetails" "input": "wardha"}
{"type": "observation", "observation": "10 °C"}
{"type": "plan", "user": "I will call the getWeatherDetails for Nagpur."}
{"type": "action", "function": "getWeatherDetails", "input": "nagpur"}
{"type": "observation", "observation": "14 °C"}
{"type": "output", "output": "The sum of weather of Wardha and Nagpur os 24 °C."}
`;


const messages = [{role:'system', content: SYSTEM_PROMPT}];

while (true) {
    const query = readLineSync.question('>>');
    const q = {type: 'user', user: query};
    messages.push({role:'user', content: JSON.stringify(q)});

    while (true) {
        const chat = await client.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            response_format : { type: "json_object" }
        });
        const result = chat.choices[0].message.content;
        messages.push({role:'assistant', content: result});

        console.log(`\n\n--START AI--`);
        console.log(result);
    console.log(`--END AI--\n\n`);

        const call = JSON.parse(result);

        if(call.type === 'output'){
            console.log(`call output: ${call.output}`);
            break;
        }
        else if (call.type === 'action'){
            let fn = tools[call.function];
            const observation = fn(call.input);
            const obs = {type: 'observation', observation: observation};
            messages.push({role:'user', content: JSON.stringify(obs)});
        }
    }
}

