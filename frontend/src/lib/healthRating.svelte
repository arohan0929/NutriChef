<script>
// @ts-nocheck

  export let score;
  

  // for animation
  let currentScore = 0;

  // const interval = setInterval(() => {
  //   if (currentScore <= score) {
  //     updateHorseshoe(currentScore);
  //     currentScore++;
  //   } else {
  //     clearInterval(interval);
  //   }
  // }, 10); // Updates every 50ms
 

  function updateScore() {
    const interval = setInterval(() => {
      if (currentScore <= score) {
        updateHorseshoe(currentScore);
        currentScore++;
      } else {
        clearInterval(interval);
      }
    }, 10);
  }

  updateScore();

  let horseshoe;
  let scoreText;
  function updateHorseshoe(score) {
    const scoreDisplay = scoreText;

    // Update the color of the horseshoe based on the score
    horseshoe.style.stroke = getColorForScore(score);

    // Max stroke-dasharray length for the arc is 300 (calculated manually based on the SVG)
    const maxDashOffset = 300;
    const offset = maxDashOffset - (score / 100) * maxDashOffset;

    // Update the stroke-dashoffset to control the horseshoe progress
    horseshoe.style.strokeDashoffset = offset;

    // Update the score display
    scoreDisplay.textContent = score + "%";
  }

  function getColorForScore(score) {
    const r = Math.round(255 - (score / 100) * 255); // Red decreases from 255 to 0
    const g = Math.round((score / 100) * 255); // Green increases from 0 to 255
    return `rgb(${r},${g},0)`; // Return the interpolated color as an RGB string
  }
</script>

<div class="healthScore">

  
  <div class="main-score">
    <div class="score-container">
      <!-- SVG Horseshoe with text inside -->
      <svg width="200" height="150" viewBox="0 0 200 150">
        <!-- Horseshoe Background -->
        <path
          id="horseshoe-bg"
          d="M 10 100 A 90 90 0 1 1 190 100"
          fill="none"
          stroke="#ffffff"
          stroke-width="20"
        />
        <!-- Progressing Horseshoe Arc -->
        <path
          bind:this={horseshoe}
          d="M 10 100 A 90 90 0 1 1 190 100"
          fill="none"
          stroke="#4caf50"
          stroke-width="20"
          stroke-dasharray="300"
          stroke-dashoffset="300"
        />

        <!-- Score Text in the Center -->
        <text x="100%" y="100%" class="score-text"  bind:this={scoreText}>0</text>
      </svg>
    </div>
  </div>
</div>

<style lang="scss">
  .score-text {
    font-size: 2em;
    font-weight: bold;
    fill: #4caf50;
    text-anchor: middle;
    dominant-baseline: middle;
    transform: translate(-50%, -50%);
  }


  .score-value {
    font-size: 24px;
    position: absolute;
    text-align: center;
  }

  .score-container, .main-score, .healthScore {
    width: max-content;
  }

  

</style>
