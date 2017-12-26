import config from "../config";

export function autoAdjustGameScreenSize(divName) {
    let divgame = document.getElementById(divName);
    divgame.style.width = (window.innerWidth * config.AutoWidthPercent) + "px";
    divgame.style.height = (window.innerHeight * config.AutoHeightPercent) + "px";
}

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function distanceToXY(sprite, x, y, world) {
    if (world === undefined) { world = false; }

    let dx = (world) ? sprite.world.x - x : sprite.x - x;
    let dy = (world) ? sprite.world.y - y : sprite.y - y;

    return Math.sqrt(dx * dx + dy * dy);
}
