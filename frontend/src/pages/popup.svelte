
<script>
  import ""
  const apiKey = 'abdfnn'
  const appId = 'sflke';   // Replace with your Nutritionix App ID

  async function getNutrition() {
    try {
      const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': appId,
          'x-app-key': apiKey
        },
        body: JSON.stringify({
        "query": "grape"
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error fetching nutritional information:', error);
    }
  }

getNutrition();

</script>

<style>

</style>