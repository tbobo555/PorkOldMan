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

export function setCookie(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(";");
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function checkCookie(cname) {
    let result = getCookie(cname);
    return result !== "";
}

export function checkMouseInObject(mouse, object) {
    let mouseX = mouse.x;
    let mouseY = mouse.y;
    let minX = object.left;
    let minY = object.top;
    let maxX = object.right;
    let maxY = object.bottom;
    return !(mouseX < minX || mouseY < minY || mouseX > maxX || mouseY > maxY);
}
