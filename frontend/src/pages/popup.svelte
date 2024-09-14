<script>
// @ts-nocheck

  const apiKey = "bfdba53f6987d0b08b5dda8cd3f33246";
  const appId = "e63fba5a"; // Replace with your Nutritionix App ID

  async function getCurrentIngredients() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["currentIngredients"], async function (result) {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(result["currentIngredients"])
        
      });
    });
  }
  function cleanAPI(obj) {
    let cleanArr =[];
    let foods = obj.foods;
    console.log(foods);
    foods.forEach(food => {
      cleanArr.push({
        name:food.food_name,
        qty:food.serving_qty,
        unit:food.serving_unit,
        wtg:food.serving_weight_grams,
        calor:food.nf_calories,
        fat:food.nf_total_fat,
        saturatedFat:food.nf_saturated_fat,
        cholestrol:food.nf_cholesterol,
        sodium:food.nf_sodium,
        carbs:food.nf_total_carbohydrate,
        fiber:food.nf_dietary_fiber,
        sugars:food.nf_sugars,
        protein:food.nf_protein
      })
    });

    const uniqueFoods = cleanArr.filter((obj, index, self) => {
      return index === self.findIndex((item) => item.name === obj.name);
    })
    return uniqueFoods;

  }
  async function getNutrition() {
    let ingredients = await getCurrentIngredients()
    // @ts-ignore
    

    if (!ingredients) {
      return;
    }

    console.log(ingredients);

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
  }


  getNutrition();


</script>

<style>
</style>
