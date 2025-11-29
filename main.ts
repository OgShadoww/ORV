import axios from "axios";
import * as readline from "readline";
import * as cheerio from "cheerio";

// INPUT
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask how many chapters user need
function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Function to fetch specific chapter text
async function fetch_chapter(count: number): Promise<string> {
  let url: string = "https://orv.pages.dev/stories/orv";

  const responce = await axios.get(`${url}/read/ch_${count}`);
  const html = responce.data;
  const $ = cheerio.load(html);
  let text = "";
  
  $("p").each((_, el) => {
    text += $(el).text().trim() + "\n";
  })

  return text;
}

async function ollama_retelling(ch: string): Promise<string> {
  let url: string = "http://localhost:11434/api/generate";
  const response = await axios.post(url, {
    model: "mistral",
    prompt: `
      Retell the following ORV chapter in a clean, simple, engaging way.
      Avoid spoilers, keep structure clear, focus on what actually happens.
      Chapter text:

      ${ch}
    `,
    stream: false
  });

  return response.data.response;
}

// Main function
async function main() {
  const ans = await ask("How many chapters you need: ");
  rl.close();

  const chapter = parseInt(ans);

  for(let i: number = 1; i < chapter + 1; i++) {
    console.log(`\n===== CHAPTER ${i} RETELLING =====\n`);
    const ch: string = await fetch_chapter(i);
    const rt: string = await ollama_retelling(ch);
    
    console.log(rt);
  }
}

main().catch(console.error);
