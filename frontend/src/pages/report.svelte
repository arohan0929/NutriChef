<script>
    import { onMount } from "svelte";

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

    let ingredients;

    onMount(async () => {
        ingredients = await getCurrentIngredients();
        console.log(
            "ingredients",
            ingredients,
        );
        
    });

    // function displayIngredients() {

    // chrome.storage.local.get(['recipeIngredients'], function(result) {
    //   const ingredients = result.recipeIngredients || [];

    //   // Get the container where ingredients will be displayed
    //   const ingredientsContainer = document.getElementById('current-recipe');

    //   // Clear the container before adding new elements
    //   ingredientsContainer.innerHTML = '';

    //   // Iterate over the ingredients and display them
    //   ingredients.forEach(ingredient => {
    //     // Create a new div for each ingredient
    //     const ingredientDiv = document.createElement('div');
    //     ingredientDiv.className = 'ingredient';

    //     // Assuming ingredient has a 'qty', 'unit', and 'name' (like "1 tsp ghee")
    //     ingredientDiv.textContent = `${ingredient.qty} ${ingredient.unit} ${ingredient.name}`;

    //     // Append the ingredient div to the container
    //     ingredientsContainer.appendChild(ingredientDiv);
    //   });
    // });
    // }

    // // Call the function to display ingredients when the page loads
    // displayIngredients();
</script>

<main>
    <h1>Detailed Report</h1>

    <div class="split">
        <div id="current-recipe">
            {#if ingredients}
                
            {#each ingredients as ingredient}
                <div class="ingredient">
                    {ingredient}
                </div>
            {/each}
            {:else}
                <p>No ingredients found</p>
            {/if}
        

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
    }

    .split {
        display: grid;
        grid-template-columns: 1fr 1fr;
        @media screen and (max-width: 768px) {
            grid-template-columns: 1fr;
        }
        gap: 5px;
    }
</style>
