import './style.css'
import logo from '/logo.svg'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="#" target="_blank">
      <img src="${logo}" class="logo" alt="Rappn logo" />
    </a>
    <h1>Rappn Campaign Tracker</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the logo to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
