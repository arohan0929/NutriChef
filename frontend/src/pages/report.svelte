<script>
    import { onMount } from "svelte";
    import { calculateHealthScore } from "../lib/healthRating";
    import HealthRating from "../lib/healthRating.svelte";

    let isIngridentsImproved = false;

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
            chrome.storage.local.get(["nutrition"], async function (result) {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(result["servings"]);
            });
        });
    }
    let ingredients;
    let nutrition;
    let servings;
    let healthScore;

    onMount(async () => {
        ingredients = await getCurrentIngredients();
        nutrition = await getCurrentNutrition();
        servings = await getCurrentServings();

        healthScore = calculateHealthScore(nutrition, servings);
        console.log("score", healthScore);

        console.log("score", healthScore);

        console.log("ingredients", ingredients);
    });
</script>

<main>
    <h1>Detailed Report</h1>

    <div class="split">
        <div id="current-recipe">
            
            <section class="average-health-score">
                {#if healthScore}
                    <h2>Average Health Score</h2>
                    <HealthRating score={healthScore.averageScore} />
                {/if}    
            </section>
            
            <section class="macro-ratings">
                
                
                {#if healthScore}
                    
                    <div>
                        <h2>Carbohydrates</h2>
                        <HealthRating score={healthScore.score.carbohydrates} />
                    </div> 
                    
                    <div>
                        <h2>Protein</h2>
                        <HealthRating score={healthScore.score.protein} />
                    </div>

                    <div>
                        <h2>Fat</h2>
                        <HealthRating score={healthScore.score.fat} />
                    </div>

                    <div>
                        <h2>SaturatedFat</h2>
                        <HealthRating score={healthScore.score.saturatedFat} />
                    </div>


                    <div>
                        <h2>Fiber</h2>
                        <HealthRating score={healthScore.score.fiber} />
                    </div>

                    <div>
                        <h2>Sodium</h2>
                        <HealthRating score={healthScore.score.sodium} />
                    </div>

                    <div>
                        <h2>Cholesterol</h2>
                        <HealthRating score={healthScore.score.cholesterol} />
                    </div>

                    <div>
                        <h2>Sugar</h2>
                        <HealthRating score={healthScore.score.sugar} />
                    </div>

                    
                {/if}
            </section>

            <section>
                {#if ingredients}
                    {#each ingredients as ingredient}
                        <div class="ingredient">
                            {ingredient}
                        </div>
                    {/each}
                {:else}
                    <p>No ingredients found</p>
                {/if}
            </section>
        </div>

        <div id="new-recipe">
            {#if !isIngridentsImproved}
                <button>Improve Recipe</button>
            {:else}
                <p>u</p>
            {/if}
        </div>
    </div>
</main>

<style lang="scss">
    main {
        padding: 20px;
        h1 {
            text-align: center;
        }
    }

    .split {
        display: grid;
        grid-template-columns: 1fr 1fr;
        @media screen and (max-width: 768px) {
            grid-template-columns: 1fr;
        }
        gap: 5px;
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
        h2 {
            text-align: center;
        }

    }

    .average-health-score {
        display: grid;
        place-items: center;
    }

</style>
