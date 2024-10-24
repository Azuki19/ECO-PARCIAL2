import { router, socket } from "../routes.js";

export default function renderScreen2() {
  const app = document.getElementById("app");
  app.innerHTML = `
<div id="result-screen">
  <h1>¡Tenemos un ganador!</h1>
  <ul id="ranking-list">
    <!-- Aquí se insertarán los jugadores con sus puntuaciones -->
  </ul>
</div>

    `;
}