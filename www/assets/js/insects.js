import { Collectibles } from "./collectibles.js";

class Insects extends Collectibles {
    constructor() {
        super("insects");
    }
}

window.addEventListener("load", () => new Insects());