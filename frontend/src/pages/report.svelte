<script>
    import { onMount } from "svelte";
    import { calculateHealthScore } from "../lib/healthRating";
    import HealthRating from "../lib/healthRating.svelte";
    import NutritionalLabel from "../lib/NutritionalLabel.svelte";

    let isIngridentsImproved = false;
    const apiKey = "1cb6ec5a4168615114405fbb801f9bf3";
    const appId = "67c90523"; // Replace with your Nutritionix App ID

    async function getCurrentIngredients() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(
                ["currentIngredients"],
                async function (result) {
                    if (chrome.runtime.lastError) {
                        return reject(chrome.runtime.lastError);
                    }
                    resolve(result["currentIngredients"]);
                },
            );
        });
    }

    async function getCurrentNutrition() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(["nutrition"], async function (result) {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(result["nutrition"]);
            });
        });
    }

    async function getCurrentServings() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(["servings"], async function (result) {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(result["servings"]);
            });
        });
    }

    async function getCurrentName() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(["name"], async function (result) {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(result["name"]);
            });
        });
    }

    async function getCurrentUserProfile() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(["userProfile"], async function (result) {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(result["userProfile"]);
            });
        });
    }

    let ingredients;
    let nutrition;
    let recipeNutrients;
    let servings;
    let healthScore;
    let ranges;
    let healthCondition;
    let name;

    onMount(async () => {
        // check the ?improve=true query param

        ingredients = await getCurrentIngredients();
        servings = (await getCurrentServings()) || 1;

        if (Array.isArray(servings)) {
            servings = servings[0];
        }

        nutrition = await getCurrentNutrition();
        recipeNutrients = totalNutrients(nutrition, servings);

        name = await getCurrentName();
        let userProfile = await getCurrentUserProfile();

        ranges = userProfile.nutrientRanges;
        healthCondition = userProfile.healthCondition;

        healthScore = await calculateHealthScore(nutrition, servings);

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("improve")) {
            improveRecipe();
        }
    });

    function totalNutrients(nutrition, servings) {
        let recipeNutrients = {
            calories: 0,
            fat: 0,
            saturatedFat: 0,
            cholesterol: 0,
            sodium: 0,
            carbohydrates: 0,
            fiber: 0,
            sugar: 0,
            protein: 0,
        };

        nutrition.forEach((element) => {
            recipeNutrients.calories += element.calories;
            recipeNutrients.fat += element.fat;
            recipeNutrients.saturatedFat += element.saturatedFat;
            recipeNutrients.cholesterol += element.cholesterol;
            recipeNutrients.sodium += element.sodium;
            recipeNutrients.carbohydrates += element.carbohydrates;
            recipeNutrients.fiber += element.fiber;
            recipeNutrients.sugar += element.sugars;
            recipeNutrients.protein += element.protein;
        });

        // divide by servings using a loop and make sure it is anumber

        if (!servings) {
            servings = 1;
        }

        console.log(recipeNutrients);
        console.log(servings);

        for (const key in recipeNutrients) {
            recipeNutrients[key] = recipeNutrients[key] / servings;
        }

        return recipeNutrients;
    }

    let updatedNutrition;
    let updatedRecipeNutrients;
    let updatedHealthScore;
    let updatedIngredients;

    async function improveRecipe() {
        // find out what are the using the healthScore variable. make a bunch of if statments to fix it

        let scores = healthScore.score;
        // make it sorted lowest score to highest score
        let sortedScores = Object.keys(scores).sort(
            (a, b) => scores[a] - scores[b],
        );
        // get the two lowest scores
        let lowestScores = sortedScores.slice(0, 2);
        // if any of the scores are above 90, then delte that score
        lowestScores = lowestScores.filter((score) => scores[score] < 90);
        // so now get the name of the lowest scores

        // total nutrition base

        let lowestScoresNames = lowestScores.map((score) => {
            if (score === "carbohydrates") {
                if (recipeNutrients.carbohydrates < ranges.carbohydrates.min) {
                    return `Carbohydrates are too low increase it`;
                }
                if (recipeNutrients.carbohydrates > ranges.carbohydrates.max) {
                    return `Carbohydrates are too high decrease it`;
                }
            } else if (score === "protein") {
                return "Protein is too low increase it";
            } else if (score === "fat") {
                return "Fat is too high decrease it";
            } else if (score === "saturatedFat") {
                return "Saturated Fat is too high decrease it";
            } else if (score === "fiber") {
                return "Fiber is too low increase it";
            } else if (score === "sodium") {
                return "Sodium is too high decrease it";
            } else if (score === "cholesterol") {
                return "Cholesterol is too high decrease it";
            } else if (score === "sugar") {
                return "Sugar is too high decrease it";
            }
        });

        let promptsString = lowestScoresNames.join(", ");

        let queryParams = new URLSearchParams({
            ingredients: JSON.stringify(ingredients),
            name: name,
            prompts: promptsString,
        });

        let response = await fetch(`http://localhost:3000/api/get-suggested-ingredients?${queryParams.toString()}`);

        let newIngredients = await response.json();
        // let newIngredients = [
        //     "0.5 cup blanched slivered almonds",
        //     "0.5 cup mayonnaise",
        //     "1 tablespoon lemon juice",
        //     "0.25 teaspoon ground black pepper",
        //     "2 cups chopped, cooked chicken meat",
        //     "1 stalk celery, chopped",
        //     "1 cup cooked quinoa",
        //     "1 cup chopped kale",
        // ];

        updatedNutrition = await dataForNewRecipe(newIngredients);

        updatedRecipeNutrients = totalNutrients(updatedNutrition, servings);

        updatedHealthScore = await calculateHealthScore(updatedNutrition, servings);
        updatedIngredients = newIngredients;

        isIngridentsImproved = true;
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

    async function dataForNewRecipe(ingredients) {
        ingredients = ingredients.map((ingredient) => {
            // find / and take the value before and after and divide to nearest 2 decimal
            let fraction = ingredient.match(/\d+\/\d+/g);
            if (fraction) {
                fraction.forEach((frac) => {
                    let [num, den] = frac.split("/");
                    ingredient = ingredient.replace(
                        frac,
                        (num / den).toFixed(2),
                    );
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
    }
</script>

<main>
    <h1>Detailed Report</h1>

    <div class="split">
        <div id="current-recipe">
            <section class="average-health-score">
                {#if healthScore}
                    <h3>Average Health Score</h3>
                    <HealthRating score={healthScore.averageScore} />
                {/if}
            </section>

            <section class="macro-ratings">
                {#if healthScore}
                    <div>
                        <h3>Carbohydrates</h3>
                        <HealthRating score={healthScore.score.carbohydrates} />
                    </div>

                    <div>
                        <h3>Protein</h3>
                        <HealthRating score={healthScore.score.protein} />
                    </div>

                    <div>
                        <h3>Fat</h3>
                        <HealthRating score={healthScore.score.fat} />
                    </div>

                    <div>
                        <h3>SaturatedFat</h3>
                        <HealthRating score={healthScore.score.saturatedFat} />
                    </div>

                    <div>
                        <h3>Fiber</h3>
                        <HealthRating score={healthScore.score.fiber} />
                    </div>

                    <div>
                        <h3>Sodium</h3>
                        <HealthRating score={healthScore.score.sodium} />
                    </div>

                    <div>
                        <h3>Cholesterol</h3>
                        <HealthRating score={healthScore.score.cholesterol} />
                    </div>

                    <div>
                        <h3>Sugar</h3>
                        <HealthRating score={healthScore.score.sugar} />
                    </div>
                {/if}
            </section>

            <section class="nutritional-label">
                {#if nutrition}
                    <NutritionalLabel
                        nutrients={{ ...recipeNutrients, servings }}
                    />
                {:else}
                    <p>No nutrition found</p>
                {/if}
            </section>

            <section class="ingredients-section">
                {#if ingredients}
                    <h2>Ingredients</h2>
                    <ol>
                        {#each ingredients as ingredient}
                            <li class="ingredient">
                                {ingredient}
                            </li>
                        {/each}
                    </ol>
                {/if}
            </section>
        </div>

        <div id="new-recipe">
            {#if !isIngridentsImproved}
                <button on:click={improveRecipe}>Improve Recipe</button>
            {:else}
                <section class="average-health-score">
                    <h3>Average Health Score</h3>
                    <HealthRating score={updatedHealthScore.averageScore} />
                </section>

                <section class="macro-ratings">
                    <div>
                        <h3>Carbohydrates Score</h3>
                        <HealthRating
                            score={updatedHealthScore.score.carbohydrates}
                        />
                    </div>

                    <div>
                        <h3>Protein Score</h3>
                        <HealthRating
                            score={updatedHealthScore.score.protein}
                        />
                    </div>

                    <div>
                        <h3>Fat Score</h3>
                        <HealthRating score={updatedHealthScore.score.fat} />
                    </div>

                    <div>
                        <h3>SaturatedFat Score</h3>
                        <HealthRating
                            score={updatedHealthScore.score.saturatedFat}
                        />
                    </div>

                    <div>
                        <h3>Fiber Score</h3>
                        <HealthRating score={updatedHealthScore.score.fiber} />
                    </div>

                    <div>
                        <h3>Sodium Score</h3>
                        <HealthRating score={updatedHealthScore.score.sodium} />
                    </div>

                    <div>
                        <h3>Cholesterol Score</h3>
                        <HealthRating
                            score={updatedHealthScore.score.cholesterol}
                        />
                    </div>

                    <div>
                        <h3>Sugar Score</h3>
                        <HealthRating score={updatedHealthScore.score.sugar} />
                    </div>
                </section>

                <section class="nutritional-label">
                    {#if updatedNutrition}
                        <NutritionalLabel
                            nutrients={{ ...updatedRecipeNutrients, servings }}
                        />
                    {:else}
                        <p>No nutrition found</p>
                    {/if}
                </section>

                <section class="ingredients-section">
                    {#if updatedIngredients}
                        <h2>Ingredients</h2>
                        <ol>
                            {#each updatedIngredients as ingredient}
                                <li class="ingredient">
                                    {ingredient}
                                </li>
                            {/each}
                        </ol>
                    {:else}
                        <p>No ingredients found</p>
                    {/if}
                </section>
            {/if}
        </div>
    </div>
</main>

<style lang="scss">
    main {
        padding: 20px;
        h1 {
            text-align: center;
            z-index: 100;
        }
    }

    .split {
        display: grid;
        grid-template-columns: 1fr 1fr;
        @media screen and (max-width: 768px) {
            grid-template-columns: 1fr;
        }
        gap: 20px;

        // make a line in the middle that only comes on its position do not make it go all the way to the top or bottom
        @media screen and (min-width: 768px) {
            position: relative;
            &:before {
                content: "";
                position: absolute;
                top: 0;
                left: 50%;
                width: 2px;
                height: 100%;
                background-color: rgb(137, 137, 137);
                transform: translateX(-50%);
                border-radius: 9px;
            }
        }
    }

    .macro-ratings > svg {
        scale: 0.5;
    }

    .macro-ratings {
        // make it a grid to how much ever we can fit
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
        place-items: center;
        h3 {
            text-align: center;
        }
    }
    .nutritional-label {
        display: grid;
        place-items: center;
    }

    .average-health-score {
        display: grid;
        place-items: center;
    }

    #new-recipe {
        
        button {
            padding: 20px;
            width: 100%;
            box-sizing: border-box;
            background-color: #bcf4b3;
            border: none;
            border-radius: 5px;
            font-size: 1em;
            cursor: pointer;
        }
    }

</style>
