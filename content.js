// content.js

let recipe;

// Function to find and log the <script type="application/ld+json"> tag
function findLdJsonScript() {

    let ingredients;

    console.log('Running findLdJsonScript function...');
    const ldJsonScripts = document.querySelectorAll('script[type="application/ld+json"]');
    ldJsonScripts.forEach(script => {

        const jsonContent = JSON.parse(script.textContent);
        console.log('JSON content:', jsonContent);
        if (Array.isArray(jsonContent)) {
            jsonContent.forEach(content => {
                // check if @type is an array
                if (Array.isArray(content['@type'])) {
                    content['@type'].forEach(type => {
                        if (type === 'Recipe') {
                            ingredients = content.recipeIngredient;
                        }
                    });
                }
                if (content['@type'] === 'Recipe') {
                    recipe = content.recipeIngredient;
                }
            });
        }
        else {
            if (jsonContent['@graph']) {
                console.log('Graph:', jsonContent['@graph']);
                jsonContent['@graph'].forEach(graph => {
                    if (Array.isArray(content['@type'])) {
                        content['@type'].forEach(type => {
                            if (type === 'Recipe') {
                                ingredients = content.recipeIngredient;
                            }
                        });
                    }
                    if (graph['@type'] === 'Recipe') {
                        ingredients = graph.recipeIngredient;
                    }
                });
            }
            else if (jsonContent['@type'] === 'Recipe') {
                ingredients = jsonContent.recipeIngredient;
            }
        }


        // check if the json content is a array
 

    });

    if (recipe) {

        chrome.storage.local.set({ currentIngredients: ingredients }, function() {
            console.log('Ingredients saved to local storage');
        });
    }

}

// Run the function when the DOM is fully loaded

findLdJsonScript();
console.log('Content script loaded');

