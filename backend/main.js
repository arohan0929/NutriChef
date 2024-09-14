const { AzureOpenAI } = require("openai");
require("dotenv").config();

async function main() {
 
  try {
    // Form the prompt for OpenAI to modify the recipe
    const openaiPrompt = `Here is a recipe called Creamy Garlic chicken with the following ingredients array:
     [
      "2  boneless (skinless chicken breasts (about 1.3 lbs. total))",
      "0.50 tsp Italian seasoning ",
      "0.50 tsp salt ",
      "0.25 tsp freshly cracked black pepper ",
      "0.25 cup all-purpose flour ",
      "2 Tbsp olive oil ",
      "2 Tbsp butter (divided)",
      "1  whole garlic bulb (about 8-9 garlic cloves) ",
      "1 cup chicken broth ",
      "0.75 cup heavy cream ",
      "0.50 tsp garlic powder ",
      "Salt and Pepper to taste "
      ]
    Based on the instruction 'Increase the protein", modify the ingredients list you may modify, add, or delete ingredients. Return the updated ingredients comma separated and do not say anything else but the ingredients.
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
        console.log(choice.message);
      }
    }


    // Return the modified ingredients
    //   context.res = {
    //     status: 200,
    //     body: {
    //       originalIngredients: ingredients,
    //       modifiedIngredients: JSON.parse(modifiedIngredients), // Parse the response from OpenAI
    //     },
    //   };
    
  catch (error) {
    console.error(error);
  }
}

main();
