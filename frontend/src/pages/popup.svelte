<script>
  // @ts-nocheck

  import HealthRating from "../lib/healthRating.svelte";

  import { onMount } from "svelte";

  const apiKey = "qdgr";
  const appId = "fnwekg"; // Replace with your Nutritionix App ID

  async function getCurrentIngredients() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["currentIngredients"], async function (result) {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(result["currentIngredients"]);
      });
    });
  }

  async function getNutrition() {
    let ingredients = await getCurrentIngredients();
    // @ts-ignore

    if (!ingredients) {
      return;
    }

    console.log(ingredients);
    ingredients = ingredients.map((ingredient) => {
      // find / and take the value before and after and divide to nearest 2 decimal
      let fraction = ingredient.match(/\d+\/\d+/g);
      if (fraction) {
        fraction.forEach((frac) => {
          let [num, den] = frac.split("/");
          ingredient = ingredient.replace(frac, (num / den).toFixed(2));
        });
      }
      return ingredient;
    });
    // if the ingrdients have a dollar sign remove the numbers after it but if a new character execpet for decmal or number come do not remove
    ingredients = ingredients.map((ingredient) => {
      return ingredient.replace(/\$\d+(\.\d+)?/, "");
    });

    // whenever there is a comma put everything after it in parenthesis
    ingredients = ingredients.map((ingredient) => {
      return ingredient.replace(/,(.*)/, "($1)");
    });

    ingredients = ingredients.map((ingredient) => {
      return ingredient.replace(/\(\s*\)/, "");
    });

    ingredients = ingredients.map((ingredient) => {
      return ingredient
        .replace(/\s*\(\s*/g, " (") // Ensure a space before '(' and remove any spaces right after '('
        .replace(/\s*\)/g, ")");
    });

    try {
      const response = await fetch(
        "https://trackapi.nutritionix.com/v2/natural/nutrients",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-app-id": appId,
            "x-app-key": apiKey,
          },
          body: JSON.stringify({
            // @ts-ignore
            query: ingredients.join(","),
          }),
        },
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log(cleanAPI(data));
    } catch (error) {
      console.error("Error fetching nutritional information:", error);
    }

    console.log(ingredients);

    // return;
  }

  //health score algorithm
  let ingredients;
  onMount(async () => {
    ingredients = await getNutrition();
    console.log(ingredients);
  });
</script>

<!-- {#if ingredients}
  <HealthRating  ingredients={ingredients} />
{/if} -->

<style>
</style>
