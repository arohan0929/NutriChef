<script>
  // Nutrient object with hardcoded values
let recipeNutrients = {
    calories: 250,
    fat: 10,          // in grams
    saturatedFat: 4,  // in grams
    cholesterol: 25,  // in milligrams
    sodium: 150,      // in milligrams
    carbohydrates: 30, // in grams
    fiber: 5,         // in grams
    sugar: 12,        // in grams
    protein: 7        // in grams
  };

export let nutrients;

Object.keys(nutrients).forEach(key => {
  nutrients[key] = Math.round(nutrients[key]);
});

console.log(nutrients);


</script>

<style>
  .nutrition-label {
    width: 320px;
    border: 2px solid black;
    padding: 10px;
    font-family: Arial, sans-serif;
    background-color: white;
  }

  .nutrition-label h1 {
    font-size: 1.5rem;
    text-align: center;
    border-bottom: 2px solid black;
    margin-bottom: 10px;
  }

  .nutrition-label .section {
    border-bottom: 1px solid black;
    margin-bottom: 5px;
  }

  .nutrition-label .section p {
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
  }

  .nutrition-label .bold {
    font-weight: bold;
  }
</style>

<div class="nutrition-label">
  <h1>Nutrition Facts</h1>
  <div class="section">
    <p class="bold">Serving Size<span> <span>{nutrients.servings}</span></p>
  </div>
  <div class="section">
    <p><span class="bold">Calories</span> <span>{nutrients.calories}</span></p>
  </div>
  <div class="section">
    <p><span class="bold">Total Fat</span> <span>{nutrients.fat}g</span></p>
    <p><span>Saturated Fat</span> <span>{nutrients.saturatedFat}g</span></p>
  </div>
  <div class="section">
    <p><span class="bold">Cholesterol</span> <span>{nutrients.cholesterol}mg</span></p>
    <p><span class="bold">Sodium</span> <span>{nutrients.sodium}mg</span></p>
  </div>
  <div class="section">
    <p><span class="bold">Total Carbohydrates</span> <span>{nutrients.carbohydrates}g</span></p>
    <p><span>Dietary Fiber</span> <span>{nutrients.fiber}g</span></p>
    <p><span>Sugars</span> <span>{nutrients.sugar}g</span></p>
  </div>
  <div class="section">
    <p><span class="bold">Protein</span> <span>{nutrients.protein}g</span></p>
  </div>
</div>
