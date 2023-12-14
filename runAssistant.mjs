import dotenv from 'dotenv';
dotenv.config();
import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as readline from 'node:readline/promises';
import { resolve } from 'path';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Create a OpenAI connection
const secretKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: secretKey,
});

async function askQuestion(question) {
  const answer = await rl.question(question);
  console.log('answer:::', answer);
  return answer;
}

async function main() {
  try {
    // Upload a file with an "assistants" purpose
    const file = await openai.files.create({
      file: fs.createReadStream('test.txt'),
      purpose: 'assistants',
    });
    console.log(file);
    const userQuestion = await askQuestion('\nWhat is your question? ');

    const assistant = await openai.beta.assistants.create({
      name: 'Milka Mystery',
      instructions: 'figure out who has eaten the milka',
      tools: [{ type: 'retrieval' }],
      model: 'gpt-4-1106-preview',
      file_ids: [file.id],
    });

    const thread = await openai.beta.threads.create();

    const message = await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: userQuestion,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    console.log(1, runStatus);

    while (runStatus.status !== 'completed') {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log(runStatus.status);
      if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
        console.log('can not receive answer');
        break;
      }

      console.log(runStatus.status);
    }

    const messages = await openai.beta.threads.messages.list(thread.id);

    messages.data.forEach((mes) => {
      console.log(mes.content);
    });

    // console.log('messages:::', messages);

    // close the readline
    rl.close();
  } catch (error) {
    console.error(error);
  }
}

// Call the main function
main();
