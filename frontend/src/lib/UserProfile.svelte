<script lang="ts">
  import { onMount } from "svelte";
  
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


  onMount(() => {
    // Fetch user data from the server here
    // and populate the form fields
    chrome.storage.local.get(["userProfile"], (result) => {
      const userProfile = result.userProfile;
      if (userProfile) {
        height = userProfile.height;
        weight = userProfile.weight;
        age = userProfile.age;
        sex = userProfile.sex;
        activityLevel = userProfile.activityLevel;
        healthCondition = userProfile.healthCondition;
        nutrientRanges = userProfile.nutrientRanges;
        mealsPerDay = userProfile.mealsPerDay;
      }
    });
  });

  let nutrientRanges = JSON.parse(JSON.stringify(defaultNutrientRanges));
  let perMealNutrientRanges = JSON.parse(JSON.stringify(nutrientRanges));
    
  
  perMealNutrientRanges = Object.fromEntries(
      Object.entries(nutrientRanges).map(
        ([key, value]: [string, { min: number; max: number }]) => [
          key,
          {
            min: Math.round(value.min / mealsPerDay),
            max: Math.round(value.max / mealsPerDay),
          },
        ],
      ),
    );

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
    nutrientRanges = JSON.parse(JSON.stringify(defaultNutrientRanges));

    console.log(condition);

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
    }

    perMealNutrientRanges = Object.fromEntries(
      Object.entries(nutrientRanges).map(
        ([key, value]: [string, { min: number; max: number }]) => [
          key,
          {
            min: Math.round(value.min / mealsPerDay),
            max: Math.round(value.max / mealsPerDay),
          },
        ],
      ),
    );
  }

  $: adjustNutrientRangesForHealthCondition(healthCondition);

  function handleSubmit() {
    const userProfile = {
      height,
      weight,
      age,
      sex,
      activityLevel,
      healthCondition,
      nutrientRanges,
      mealsPerDay,
    };
    chrome.storage.local.set({ userProfile });

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

    <hr>

    <h2>Recommended Nutrient Ranges per meal:</h2>


    <div class="label-per-meal-input">
      <p>Min Value</p>
      <p>Max Value</p>
    </div>

    <label for="proteinPerMealMin">Protein per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="proteinPerMealMin"
        bind:value={perMealNutrientRanges.proteins.min}
        placeholder="Min"
      />
      <input
        type="number"
        id="proteinPerMealMax"
        bind:value={perMealNutrientRanges.proteins.max}
        placeholder="Max"
      />
    </div>

    <label for="carbohydratesPerMealMin">Carbohydrates per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="carbohydratesPerMealMin"
        bind:value={perMealNutrientRanges.carbohydrates.min}
        placeholder="Min"
      />
      <input
        type="number"
        id="carbohydratesPerMealMax"
        bind:value={perMealNutrientRanges.carbohydrates.max}
        placeholder="Max"
      />
    </div>

    <label for="fatsPerMealMin">Fats per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="fatsPerMealMin"
        bind:value={perMealNutrientRanges.fats.min}
        placeholder="Min"
      />
      <input
        type="number"
        id="fatsPerMealMax"
        bind:value={perMealNutrientRanges.fats.max}
        placeholder="Max"
      />
    </div>

    <label for="fibrePerMealMin">Fibre per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="fibrePerMealMin"
        bind:value={perMealNutrientRanges.fiber.min}
        placeholder="Min"
      />
      <input
        type="number"
        id="fibrePerMealMax"
        bind:value={perMealNutrientRanges.fiber.max}
        placeholder="Max"
      />
    </div>

    <label for="sodiumPerMealMin">Sodium per Meal (mg):</label>
    <div class="input-group">
      <input
        type="number"
        id="sodiumPerMealMin"
        bind:value={perMealNutrientRanges.sodium.min}
        placeholder="Min"
      />
      <input
        type="number"
        id="sodiumPerMealMax"
        bind:value={perMealNutrientRanges.sodium.max}
        placeholder="Max"
      />
    </div>

    <label for="cholesterolPerMealMin">Cholesterol per Meal (mg):</label>
    <div class="input-group">
      <input
        type="number"
        id="cholesterolPerMealMin"
        bind:value={perMealNutrientRanges.cholesterol.min}
        placeholder="Min"
      />
      <input
        type="number"
        id="cholesterolPerMealMax"
        bind:value={perMealNutrientRanges.cholesterol.max}
        placeholder="Max"
      />
    </div>

    <label for="sugarPerMealMin">Sugar per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="sugarPerMealMin"
        bind:value={perMealNutrientRanges.sugar.min}
        placeholder="Min"
      />
      <input
        type="number"
        id="sugarPerMealMax"
        bind:value={perMealNutrientRanges.sugar.max}
        placeholder="Max"
      />
    </div>

    <button type="submit">Submit</button>
  </form>
</main>

<style lang="scss">
  
  
  h1 {
    text-align: center;
    margin-bottom: 1rem;
    // dark green color
  }

  h2 {
    text-align: center;
    font-size: 1.1em;
    font-weight: normal;
    margin-bottom: 1rem;
  }

  .label-per-meal-input {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 1rem;
    position: sticky;
    top: 0;
    background-color: white;
    height: 50px;
    z-index: 1;

    p {
      text-align: center;
      margin-bottom: 0;
    }
  }

  hr {
    margin: 1rem 0;
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, transparent, #cccccc, #cccccc, transparent);
  }


  button {
    width: 100%;
    height: 50px;
    border-radius: 7px;
    background-color: hsl(0, 0%, 90%);
    border: none;
    font-size: 1.1em;
    cursor: pointer;
  }

  main {
    max-width: 500px;
    margin: 0 auto;
    padding: 1rem;

    @media (max-width: 500px) {
      padding: 0.5rem;
    }

    margin-top: 2rem;
    margin-bottom: 2rem;


    border-radius: 16px;
    background-color: #c6f8a530;
    box-shadow: 0 10px 30px #c6f8a57c;
    backdrop-filter: blur(5px);
    border: 1px solid rgba( 255, 255, 255, 0.18 );

    



  }


  input {
    margin-bottom: 1rem;
    width: 100%;
    height: 50px;
    border-radius: 7px;
    background-color: transparent;
    border: 1px solid hsl(120, 100%, 10%);
    ;
    padding: 5px 10px;
    font-size: 1em;
    box-sizing: border-box;
  }
  select {
    margin-bottom: 1rem;
    width: 100%;
    height: 50px;
    border-radius: 7px;
    background-color: transparent;
    border: 1px solid hsl(120, 100%, 10%);
    padding: 5px 10px;
    font-size: 1em;
    box-sizing: border-box;
  }
  option {
    font-size: 1em;
    
  }
  .input-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;

    input{
      width: unset;
    }

  }

  label {
    margin-bottom: 1rem;
  }

</style>
