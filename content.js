// content.js


function findLdJsonScript() {

    let ingredients;
    let servings;
    let image;
    let name;
    let link;
    let description;
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
                            servings = content['recipeYield'];
                            image = content['image'][0];
                            name = content['name'];
                            link = content['@id'];
                            description = content['description'];
                        }
                    });
                }
                if (content['@type'] === 'Recipe') {
                    console.log("type is recipe");
                    ingredients = content['recipeIngredient'];
                    servings = content['recipeYield'];
                    image = content['image'][0];
                    name = content['name'];
                    link = content['@id'];
                    description = content['description'];

                }
            });
        } else {
            console.log('Single content');
            if (jsonContent['@type'] === 'Recipe') {
                ingredients = jsonContent['recipeIngredient'];   
                servings = jsonContent['recipeYield'];
                image = jsonContent['image'][0];
                name = jsonContent['name'];
                link = jsonContent['@id'];
                description = jsonContent['description'];

            }
            else if (jsonContent['@graph']) {
                jsonContent['@graph'].forEach(content => {
                    if (content['@type'] === 'Recipe') {
                        ingredients = content['recipeIngredient'];
                        servings = content['recipeYield'];
                        image = content['image'][0];
                        name = content['name'];
                        link = content['@id'];
                        description = content['description'];
                    }
                });
            }
        }
        
    });


    if (ingredients && servings) {
        

        chrome.storage.local.set({currentIngredients: ingredients, servings: servings}, function() {
            console.log('Ingredients are set to: ', ingredients);
            console.log('Servings are set to: ', servings);
        });

        
    } else if (ingredients) {
        chrome.storage.local.set({currentIngredients: ingredients, servings: 1}, function() {
            console.log('Ingredients are set to: ', ingredients);
            console.log('Servings are set to: ', servings);
        });
    } else {    
        console.log('Ingredients not found');
    }
    
}




findLdJsonScript();