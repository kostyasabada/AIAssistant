
import dotenv from 'dotenv'
dotenv.config();
import { OpenAI } from 'openai';
import * as readline from 'node:readline/promises';
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

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

    const userQuestion = await askQuestion("\nWhat is your question? ");
   
    // close the readline
    rl.close();
  } catch (error) {
    console.error(error);
  }
}

// Call the main function
main();