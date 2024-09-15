import { AzureOpenAI } from "openai";
import express, { json } from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
const app = express();
const port = 3000;

// require("dotenv").config();
import dotenv from 'dotenv';
// look for dotenv inside /backend/.env
dotenv.config({ path: 'backend/.env' });

app.use(cors());
app.use(json());


async function aiSuggestions(name, ingredients, prompts) {

  try {

    const openaiPrompt = `Here is a recipe called ${name} with the following ingredients array:
    ${ingredients}
    Based on the instructions: "${prompts}" modify the ingredients list you may modify, add, or delete ingredients. Return the updated ingredients comma separated and do not say anything else expect the string.
    Do not give an introduction to the sting like Suggested Ingredients: "ingredient1, ingredient2" just return the "ingredient1", "ingredient2" string. Make sure to wrap each ingredient in quotes and separate them with a comma.
    `;


    const endpoint = process.env.OPENAI_ENDPOINT;
    const apiKey = process.env.OPENAI_API_KEY;
    const apiVersion = "2024-05-01-preview";
    const deployment = "gpt-35-turbo"; // This must match your deployment name

    console.log("OpenAI Prompt: ", apiKey);


    const client = new AzureOpenAI({
      endpoint,
      apiKey,
      apiVersion,
      deployment,
    });

    const result = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a nutritionist.",
        },
        {
          role: "user",
          content: openaiPrompt
        }
      ],
      max_tokens: 150,
      temperature: 0.5,
      stop: ["\n"],
    });


    for (const choice of result.choices) {
      if (choice.message.role === "assistant") {
        return choice.message.content;
      }
    }
  }
  catch (error) {
    console.error(error);
    return null;
  }
}

// let corsOptions = {
//   origin: 'http://localhost:5173',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
app.get("/api/get-suggested-ingredients/", async (req, res) => {

  // get ingredients from req and the prompt
  const name = req.query.name;
  const ingredients = req.query.ingredients;
  const prompt = req.query.prompts;

  if (!name || !ingredients || !prompt) {
    return res.status(400).send("Missing name, ingredients or prompt");
  }



  try {

    // Call the AI function
    let suggestedIngredients = await aiSuggestions(name, ingredients, prompt);
    console.log(suggestedIngredients);
    if (!suggestedIngredients) {
      res.status(500).send("Error fetching suggested ingredients");
    }

    // add [] to the string
    suggestedIngredients = `[${suggestedIngredients}]`;
    // parse the string to an array
    suggestedIngredients = JSON.parse(suggestedIngredients);
    // return the array
    return res.send(suggestedIngredients);


  } catch (error) {
    console.log("Error fetching suggested ingredients", error);
    return res.status(500).send("Error fetching suggested ingredients");
  }

});





app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/get-ingredients-nutrition", async (req, res) => {
  console.log("Request received");

  // get ingredients from req
  const ingredients = req.query.ingredients;
  console.log("Ingredients: ", ingredients);

  if (!ingredients) {
    return res.status(400).send("Missing ingredients");
  }

  try {
    const response = await fetch(
      "https://trackapi.nutritionix.com/v2/natural/nutrients",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": process.env.NUTRITIONIX_APP_ID,
          "x-app-key": process.env.NUTRITIONIX_API_KEY,
        },
        body: JSON.stringify({
          // @ts-ignore
          query: ingredients,
        }),
      });


    console.log("Response: ", response);

    if (!response.ok) {
      let error = await response.json();
      console.log("Error: ", error);

      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return res.send(cleanNutritionixData(data));
  } catch (error) {
    console.error("Error fetching nutritional information:", error);
    return res.status(500).send("Error fetching nutritional information");
  }

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});