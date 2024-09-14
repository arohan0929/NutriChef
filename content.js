// content.js


function findLdJsonScript() {

    let ingredients;

    const ldJsonScripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    ldJsonScripts.forEach(script => {

        const jsonContent = JSON.parse(script.textContent);
        console.log('JSON content:', jsonContent);

        // if json content is a array
        if (Array.isArray(jsonContent)) {
            jsonContent.forEach(content => {
                // if content['@type']  is an array
                if (Array.isArray(content['@type'])) {
                    console.log("array of types");
                    
                    content['@type'].forEach(type => {
                        if (type === 'Recipe') {
                            ingredients = content['recipeIngredient'];
                        }
                    });
                }
                if (content['@type'] === 'Recipe') {
                    console.log("type is recipe");
                    ingredients = content['recipeIngredient'];
                }
            });
        } else {
            console.log('Single content');
            if (jsonContent['@type'] === 'Recipe') {
                ingredients = jsonContent['recipeIngredient'];   
            }
            else if (jsonContent['@graph']) {
                jsonContent['@graph'].forEach(content => {
                    if (content['@type'] === 'Recipe') {
                        ingredients = content['recipeIngredient'];
                    }
                });
            }
        }
        
    });


    if (ingredients) {
        
        chrome.storage.local.set({currentIngredients: ingredients}, () => {
            console.log('Ingredients set to storage');
        });
        
    } else {
        console.log('No ingredients found');
        
    }
    
}




findLdJsonScript();