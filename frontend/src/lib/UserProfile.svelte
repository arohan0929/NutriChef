<script lang="ts">
  const defaultNutrientRanges = {
    carbohydrates: { min: 225, max: 325 }, // grams
    proteins: { min: 50, max: 175 }, // grams
    fats: { min: 44, max: 77 }, // grams
    fiber: { min: 25, max: 38 }, // grams
    sodium: { min: 1500, max: 2300 }, // mg
    cholesterol: { min: 0, max: 300 }, // mg
    sugar: { min: 0, max: 37.5 }, // grams
  };

  let height: number;
  let weight: number;
  let age: number;
  let sex: string = "Male"; // default value
  let activityLevel: string = "moderate"; // default value
  let healthCondition: string = "None"; // default value
  let mealsPerDay: number = 3; // default value

  let nutrientRanges = { ...defaultNutrientRanges };
  let perMealNutrientRanges = { ...defaultNutrientRanges };

  $: {
    const { proteins, carbohydrates, fats, fiber, sodium, cholesterol, sugar } = nutrientRanges;
    perMealNutrientRanges = {
      proteins: {
        min: proteins.min / mealsPerDay,
        max: proteins.max / mealsPerDay,
      },
      carbohydrates: {
        min: carbohydrates.min / mealsPerDay,
        max: carbohydrates.max / mealsPerDay,
      },
      fats: {
        min: fats.min / mealsPerDay,
        max: fats.max / mealsPerDay,
      },
      fiber: {
        min: fiber.min / mealsPerDay,
        max: fiber.max / mealsPerDay,
      },
      sodium: {
        min: sodium.min / mealsPerDay,
        max: sodium.max / mealsPerDay,
      },
      cholesterol: {
        min: cholesterol.min / mealsPerDay,
        max: cholesterol.max / mealsPerDay,
      },
      sugar: {
        min: sugar.min / mealsPerDay,
        max: sugar.max / mealsPerDay,
      },
    };
  }

  const activityLevels = [
    "sedentary",
    "light",
    "moderate",
    "active",
    "very active",
  ];

  const availableHealthConditions = [
    "Diabetes",
    "High Cholesterol",
    "Hypertension",
    "Obesity",
    "Heart disease",
    "Thyroid disorders",
    "None",
  ];

  const sexes = ["Male", "Female", "Non-Binary"];
  const mealOptions = [1, 2, 3, 4, 5, 6];

  function adjustNutrientRangesForHealthCondition(condition: string) {
    if (condition === "Diabetes") {
      nutrientRanges.carbohydrates.min = 130; // minimum needed for brain function
      nutrientRanges.carbohydrates.max = 180; // controlled max for blood glucose management
      nutrientRanges.fiber.min = 30; // Increase fiber for glucose control
      nutrientRanges.sugar.max = 25; // Reduce sugar intake
    } else if (condition === "High Cholesterol") {
      nutrientRanges.fats.max = 60; // Lower fat intake
      nutrientRanges.cholesterol.max = 150; // Strict cholesterol limit
      nutrientRanges.fiber.min = 30; // Increase fiber to reduce LDL cholesterol
    } else if (condition === "Hypertension") {
      nutrientRanges.sodium.max = 1500; // Recommended sodium limit for hypertension
      nutrientRanges.fats.max = 70; // Limit fats, focusing on unsaturated fats
      nutrientRanges.fiber.min = 30; // Fiber helps in blood pressure regulation
    } else if (condition === "Obesity") {
      nutrientRanges.fats.max = 55; // Reduce fats to control caloric intake
      nutrientRanges.carbohydrates.min = 150; // Lower carbs for calorie reduction
      nutrientRanges.fiber.min = 30; // High fiber intake to increase satiety
    } else if (condition === "Heart Disease") {
      nutrientRanges.cholesterol.max = 150; // Strict cholesterol control
      nutrientRanges.fats.max = 60; // Limit unhealthy fats
      nutrientRanges.fiber.min = 30; // Increase fiber for heart health
    } else if (condition === "Thyroid Disorders") {
      nutrientRanges.proteins.min = 60; // Increase protein for metabolism support
      nutrientRanges.fiber.min = 30; // Support digestion with fiber
    } else if (condition === "None") {
      nutrientRanges = { ...defaultNutrientRanges };
    }

    nutrientRanges = { ...nutrientRanges };
  }

  $: adjustNutrientRangesForHealthCondition(healthCondition);

  function handleSubmit() {
    // Process form data here
    console.log({
      height,
      weight,
      age,
      sex,
      activityLevel,
      healthCondition,
      mealsPerDay,
    });
  }
</script>

<main>
  <h1>Create Your Health Profile</h1>
  <form on:submit|preventDefault={handleSubmit}>
    <label for="height">Height (cm):</label>
    <input
      type="number"
      id="height"
      bind:value={height}
      required
      min="50"
      max="300"
    />

    <label for="weight">Weight (kg):</label>
    <input
      type="number"
      id="weight"
      bind:value={weight}
      required
      min="10"
      max="300"
    />

    <label for="age">Age:</label>
    <input type="number" id="age" bind:value={age} required min="1" max="120" />

    <label for="sex">Sex:</label>
    <select id="sex" bind:value={sex} required>
      {#each sexes as sexOption}
        <option value={sexOption}>{sexOption}</option>
      {/each}
    </select>

    <label for="activityLevel">Activity Level:</label>
    <select id="activityLevel" bind:value={activityLevel} required>
      {#each activityLevels as level}
        <option value={level}>{level}</option>
      {/each}
    </select>

    <label for="healthCondition">Health Condition:</label>
    <select id="healthCondition" bind:value={healthCondition} required>
      {#each availableHealthConditions as condition}
        <option value={condition}>{condition}</option>
      {/each}
    </select>

    <label for="mealsPerDay">Number of Meals per Day:</label>
    <select id="mealsPerDay" bind:value={mealsPerDay} required>
      {#each mealOptions as option}
        <option value={option}>{option}</option>
      {/each}
    </select>

    <label for="proteinPerMealMin">Protein per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="proteinPerMealMin"
        bind:value={perMealNutrientRanges.proteins.min}
        min="0"
        max="100"
        placeholder="Min"
      />
      <input
        type="number"
        id="proteinPerMealMax"
        bind:value={perMealNutrientRanges.proteins.max}
        min="0"
        max="100"
        placeholder="Max"
      />
    </div>

    <label for="carbohydratesPerMealMin">Carbohydrates per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="carbohydratesPerMealMin"
        bind:value={perMealNutrientRanges.carbohydrates.min}
        min="0"
        max="100"
        placeholder="Min"
      />
      <input
        type="number"
        id="carbohydratesPerMealMax"
        bind:value={perMealNutrientRanges.carbohydrates.max}
        min="0"
        max="100"
        placeholder="Max"
      />
    </div>

    <label for="fatsPerMealMin">Fats per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="fatsPerMealMin"
        bind:value={perMealNutrientRanges.fats.min}
        min="0"
        max="100"
        placeholder="Min"
      />
      <input
        type="number"
        id="fatsPerMealMax"
        bind:value={perMealNutrientRanges.fats.max}
        min="0"
        max="100"
        placeholder="Max"
      />
    </div>

    <label for="fibrePerMealMin">Fibre per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="fibrePerMealMin"
        bind:value={perMealNutrientRanges.fiber.min}
        min="0"
        max="100"
        placeholder="Min"
      />
      <input
        type="number"
        id="fibrePerMealMax"
        bind:value={perMealNutrientRanges.fiber.max}
        min="0"
        max="100"
        placeholder="Max"
      />
    </div>

    <label for="sodiumPerMealMin">Sodium per Meal (mg):</label>
    <div class="input-group">
      <input
        type="number"
        id="sodiumPerMealMin"
        bind:value={perMealNutrientRanges.sodium.min}
        min="0"
        max="5000"
        placeholder="Min"
      />
      <input
        type="number"
        id="sodiumPerMealMax"
        bind:value={perMealNutrientRanges.sodium.max}
        min="0"
        max="5000"
        placeholder="Max"
      />
    </div>

    <label for="cholesterolPerMealMin">Cholesterol per Meal (mg):</label>
    <div class="input-group">
      <input
        type="number"
        id="cholesterolPerMealMin"
        bind:value={perMealNutrientRanges.cholesterol.min}
        min="0"
        max="500"
        placeholder="Min"
      />
      <input
        type="number"
        id="cholesterolPerMealMax"
        bind:value={perMealNutrientRanges.cholesterol.max}
        min="0"
        max="500"
        placeholder="Max"
      />
    </div>

    <label for="sugarPerMealMin">Sugar per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="sugarPerMealMin"
        bind:value={perMealNutrientRanges.sugar.min}
        min="0"
        max="100"
        placeholder="Min"
      />
      <input
        type="number"
        id="sugarPerMealMax"
        bind:value={perMealNutrientRanges.sugar.max}
        min="0"
        max="100"
        placeholder="Max"
      />
    </div>

    <button type="submit">Submit</button>
  </form>
</main>

<style lang="scss">
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
    margin: auto;
  }

  label {
    font-weight: bold;
  }

  input,
  select {
    padding: 0.5rem;
    font-size: 1rem;
  }

  .input-group {
    display: flex;
    gap: 0.5rem;
  }

  button {
    padding: 0.5rem;
    font-size: 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
</style>
