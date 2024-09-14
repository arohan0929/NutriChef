import { AzureOpenAI } from "openai";
import express from "express";
import cors from 'cors';
import fetch from 'node-fetch';
const app = express();
const port = 3000;

// require("dotenv").config();
import dotenv from 'dotenv';
dotenv.config();

app.use(cors());

async function aiSuggestions(name, ingredients, prompts) {

  try {

    const openaiPrompt = `Here is a recipe called ${name} with the following ingredients array:
    ${ingredients}
    Based on the instructions: "${prompts}" modify the ingredients list you may modify, add, or delete ingredients. Return the updated ingredients comma separated and do not say anything else but the ingredients.
    `;


    const endpoint = process.env.OPENAI_ENDPOINT;
    const apiKey = process.env.OPENAI_API_KEY;
    const apiVersion = "2024-05-01-preview";
    const deployment = "gpt-35-turbo"; // This must match your deployment name

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
      if (choice.role === "assistant") {
        return choice.content;
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
app.get("/api/get-suggested-ingredients", async (req, res) => {

  // get ingredients from req and the prompt
  const name = req.body.name;
  const ingredients = req.body.ingredients;
  const prompt = req.body.prompts;

  try {

    // Call the AI function
    let suggestedIngredients = await aiSuggestions(name, ingredients, prompt);
    if (!suggestedIngredients) {
      res.send("No suggestions found");
    }

    // the suggested ingredients are in a string comma separated make it an array
    suggestedIngredients = suggestedIngredients.split(",");
    // if this is not an array return the original ingredients
    if (!Array.isArray(suggestedIngredients)) {
      res.send(ingredients);
    }

    // return the suggested ingredients
    res.send(suggestedIngredients);
  } catch (error) {
    console.log("Error fetching suggested ingredients", error);
    return res.send(ingredients);
  }

});


function cleanNutritionixData(obj) {
  let cleanArr = [];
  let foods = obj.foods;
  foods.forEach((food) => {
    cleanArr.push({
      name: food.food_name,
      qty: food.serving_qty,
      unit: food.serving_unit,
      wtg: food.serving_weight_grams,
      calor: food.nf_calories,
      fat: food.nf_total_fat,
      saturatedFat: food.nf_saturated_fat,
      cholestrol: food.nf_cholesterol,
      sodium: food.nf_sodium,
      carbs: food.nf_total_carbohydrate,
      fiber: food.nf_dietary_fiber,
      sugars: food.nf_sugars,
      protein: food.nf_protein,
    });
  });

  const uniqueFoods = cleanArr.filter((obj, index, self) => {
    return index === self.findIndex((item) => item.name === obj.name);
  });

  return uniqueFoods;
}


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/get-ingredients-nutrition",  async (req, res) => {
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