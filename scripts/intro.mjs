// The canvas uses the original horse; only its existing silhouette becomes transparent.
export const brandIntro = `
<div class="brand-intro" hidden>
  <div class="intro-art" aria-hidden="true">
    <canvas class="intro-scene"></canvas>
    <div class="intro-horizon"></div>
    <div class="intro-title">
      <p class="intro-name">Der Wirtschaftsbund</p>
      <p class="intro-motto">Eigene Ideen. Gemeinsame Arbeit.</p>
    </div>
    <p class="intro-location">Hamburg</p>
    <div class="intro-progress"></div>
  </div>
  <button class="intro-skip" type="button" aria-label="Intro überspringen">
    Überspringen <span aria-hidden="true">↗</span>
  </button>
</div>
<script src="./assets/intro.js"></script>`;
