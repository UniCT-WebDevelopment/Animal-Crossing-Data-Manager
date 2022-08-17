import { Collectibles } from "./collectibles.js";

class SeaCreatures extends Collectibles {
    constructor() {
        super("sea_creatures");
    }
}

window.addEventListener("load", () => new SeaCreatures());