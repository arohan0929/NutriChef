<script>
  import { calculateHealthScore } from "../lib/healthRating";

  // @ts-nocheck

  import HealthRating from "../lib/healthRating.svelte";

  import { onMount } from "svelte";

  const apiKey = "c34b9168fcecd57dc0bd78537c33c8a4";
  const appId = "67c90523"; // Replace with your Nutritionix App ID

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
  async function getServings() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["servings"], async function (result) {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(result["servings"]);
      });
    });
  }

  function cleanNutritionixData(obj) {
    let cleanArr = [];
    let foods = obj.foods;
    foods.forEach((food) => {
      cleanArr.push({
        name: food.food_name,
        qty: food.serving_qty,
        unit: food.serving_unit,
        wtg: food.serving_weight_grams,
        calories: food.nf_calories,
        fat: food.nf_total_fat,
        saturatedFat: food.nf_saturated_fat,
        cholesterol: food.nf_cholesterol,
        sodium: food.nf_sodium,
        carbohydrates: food.nf_total_carbohydrate,
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

    // whenever there is a g like 100g make it into 100 grams 
    ingredients = ingredients.map((ingredient) => {
      return ingredient.replace(/\s*(\d+)\s*g/, "$1 grams of");
    });

    // do the same for lbs, kg, oz and ml
    ingredients = ingredients.map((ingredient) => {
      return ingredient.replace(/\s*(\d+)\s*lbs/, "$1 pounds");
    });

    ingredients = ingredients.map((ingredient) => {
      return ingredient.replace(/\s*(\d+)\s*kg/, "$1 kilograms");
    });

    ingredients = ingredients.map((ingredient) => {
      return ingredient.replace(/\s*(\d+)\s*oz/, "$1ounces");
    });

    ingredients = ingredients.map((ingredient) => {
      return ingredient.replace(/\s*(\d+)\s*ml/, "$1milliliters");
    });


    // whenever there is a comma put everything after it in parenthesis
    ingredients = ingredients.map((ingredient) => {
      return ingredient.replace(/\s*,\s*(.*)/, "($1)");
    });

    ingredients = ingredients.map((ingredient) => {
      return ingredient.replace(/\(\s*\)/, "");
    });

    ingredients = ingredients.map((ingredient) => {
      return ingredient
        .replace(/\s*\(\s*/g, " (") // Ensure a space before '(' and remove any spaces right after '('
        .replace(/\s*\)/g, ")");
    });

    console.log(ingredients);
    console.log(ingredients.join(","));


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
            query: ingredients.join(", "),
          }),
        },
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return cleanNutritionixData(data);
    } catch (error) {
      console.error("Error fetching nutritional information:", error);
    }

    // return;
  }

  //health score algorithm
  let nutrition;
  let score;
  onMount(async () => {
    nutrition = await getNutrition();
    let servings = await getServings();
    // if servings is an array, get the first element
    if (Array.isArray(servings)) {
      servings = servings[0];
    }
    console.log(nutrition);
    score = calculateHealthScore(nutrition, servings);
    console.log(score);
    chrome.storage.local.set({ nutrition });
  });
</script>

<!-- {#if ingredients}
  <HealthRating  ingredients={ingredients} />
{/if} -->

<header>
  <!-- get the day of the week with the shortned day like 9/13 -->
  <h2 class="current-date">
    {new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    })}
  </h2>
  <a
    href="options.html"
    target="_blank"
    aria-label="go to account"
    aria-hidden="true"
  >
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.11337 15.1C4.96337 14.45 5.91337 13.9375 6.96337 13.5625C8.01337 13.1875 9.11337 13 10.2634 13C11.4134 13 12.5134 13.1875 13.5634 13.5625C14.6134 13.9375 15.5634 14.45 16.4134 15.1C16.9967 14.4167 17.4509 13.6417 17.7759 12.775C18.1009 11.9083 18.2634 10.9833 18.2634 10C18.2634 7.78333 17.4842 5.89583 15.9259 4.3375C14.3675 2.77917 12.48 2 10.2634 2C8.0467 2 6.1592 2.77917 4.60087 4.3375C3.04253 5.89583 2.26337 7.78333 2.26337 10C2.26337 10.9833 2.42587 11.9083 2.75087 12.775C3.07587 13.6417 3.53003 14.4167 4.11337 15.1ZM10.2634 11C9.28003 11 8.45087 10.6625 7.77587 9.9875C7.10087 9.3125 6.76337 8.48333 6.76337 7.5C6.76337 6.51667 7.10087 5.6875 7.77587 5.0125C8.45087 4.3375 9.28003 4 10.2634 4C11.2467 4 12.0759 4.3375 12.7509 5.0125C13.4259 5.6875 13.7634 6.51667 13.7634 7.5C13.7634 8.48333 13.4259 9.3125 12.7509 9.9875C12.0759 10.6625 11.2467 11 10.2634 11ZM10.2634 20C8.88003 20 7.58003 19.7375 6.36337 19.2125C5.1467 18.6875 4.08837 17.975 3.18837 17.075C2.28837 16.175 1.57587 15.1167 1.05087 13.9C0.525867 12.6833 0.263367 11.3833 0.263367 10C0.263367 8.61667 0.525867 7.31667 1.05087 6.1C1.57587 4.88333 2.28837 3.825 3.18837 2.925C4.08837 2.025 5.1467 1.3125 6.36337 0.7875C7.58003 0.2625 8.88003 -1.19209e-07 10.2634 -1.19209e-07C11.6467 -1.19209e-07 12.9467 0.2625 14.1634 0.7875C15.38 1.3125 16.4384 2.025 17.3384 2.925C18.2384 3.825 18.9509 4.88333 19.4759 6.1C20.0009 7.31667 20.2634 8.61667 20.2634 10C20.2634 11.3833 20.0009 12.6833 19.4759 13.9C18.9509 15.1167 18.2384 16.175 17.3384 17.075C16.4384 17.975 15.38 18.6875 14.1634 19.2125C12.9467 19.7375 11.6467 20 10.2634 20ZM10.2634 18C11.1467 18 11.98 17.8708 12.7634 17.6125C13.5467 17.3542 14.2634 16.9833 14.9134 16.5C14.2634 16.0167 13.5467 15.6458 12.7634 15.3875C11.98 15.1292 11.1467 15 10.2634 15C9.38003 15 8.5467 15.1292 7.76337 15.3875C6.98003 15.6458 6.26337 16.0167 5.61337 16.5C6.26337 16.9833 6.98003 17.3542 7.76337 17.6125C8.5467 17.8708 9.38003 18 10.2634 18ZM10.2634 9C10.6967 9 11.055 8.85833 11.3384 8.575C11.6217 8.29167 11.7634 7.93333 11.7634 7.5C11.7634 7.06667 11.6217 6.70833 11.3384 6.425C11.055 6.14167 10.6967 6 10.2634 6C9.83003 6 9.4717 6.14167 9.18837 6.425C8.90503 6.70833 8.76337 7.06667 8.76337 7.5C8.76337 7.93333 8.90503 8.29167 9.18837 8.575C9.4717 8.85833 9.83003 9 10.2634 9Z"
        fill="#1C1B1F"
      />
    </svg>
  </a>
</header>
<main>
  {#if nutrition && score}
    <HealthRating score={score.averageScore} />
  {/if}

  <div class="detail-reports-btns">
    <a href="report.html" target="_blank"> View Full Report </a>
    <a href="report.html?improve=true" target="_blank"> Improve Health Score </a>
  </div>

  <div>
    <p>Add to calendar</p>
    <form>
      <!-- choose the day of the week -->

      <select>
        <option value="sunday">Sunday</option>
        <option value="monday">Monday</option>
        <option value="tuesday">Tuesday</option>
        <option value="wednesday">Wednesday</option>
        <option value="thursday">Thursday</option>
      </select>

      <!-- select option that goes from 1-6 -->
      <select id="time" name="time">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
      </select>
    </form>
  </div>
</main>

<style lang="scss">
  header {
    display: grid;
    grid-template-columns: 1fr max-content;
    width: 100%;
    gap: 10px;
    padding: 10px;
    align-items: center;
    font-size: 1.1em;
    box-sizing: border-box;
  }

  #score-text {
    font-size: 2em;
    font-weight: bold;
    fill: #4caf50;
    text-anchor: middle;
    dominant-baseline: middle;
    transform: translate(-50%, -50%);
  }

  .detail-reports-btns {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 0 15px;
    margin-top: 20px;

    a {
      padding: 15px 20px;
      border-radius: 7px;
      background-color: #4caf50;
      color: white;
      text-decoration: none;
      font-weight: bold;
      text-align: center;
      display: grid;
      place-items: center;
    }
  }

  .current-date {
    font-family: "Poppins", sans-serif;
    font-weight: 500;
    font-size: 1.5em;
  }

  .score-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    position: relative;
    margin-top: 20px;
  }

  .score-value {
    font-size: 24px;
    position: absolute;
    text-align: center;
  }
</style>
