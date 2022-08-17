import { Collectibles } from './collectibles.js';

class Fishes extends Collectibles {
    constructor() {
        super("fishes");
    }

    postTableGeneration() {
        super.postTableGeneration();
        this.tableBody.querySelector('td[collectible="Celacanto"][data-type="period"]').innerText += " 🌧"
    }
}

window.addEventListener("load", () => new Fishes());