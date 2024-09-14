// content.js

let recipe;

// Function to find and log the <script type="application/ld+json"> tag
function findLdJsonScript() {
    console.log('Running findLdJsonScript function...');
    const ldJsonScripts = document.querySelectorAll('script[type="application/ld+json"]');
    ldJsonScripts.forEach(script => {

        const jsonContent = JSON.parse(script.textContent);
        console.log('JSON content:', jsonContent);
        // check if there is a @graph or @ recipe if there is a @graph then check inside that for @recipe
        if (jsonContent['@graph']) {
            console.log('Graph:', jsonContent['@graph']);
            jsonContent['@graph'].forEach(graph => {
                if (graph['@type'] === 'Recipe') {
                    recipe = graph;
                }
            });
        } else if (jsonContent['@type'] === 'Recipe') {
            recipe = jsonContent;
        }

    });

    if (recipe) {

        let ingredients = recipe.recipeIngredient;

        chrome.storage.local.set({ currentIngredients: ingredients }, function() {
            console.log('Ingredients saved to local storage');
        });
    }

}

// Run the function when the DOM is fully loaded

findLdJsonScript();
console.log('Content script loaded');

