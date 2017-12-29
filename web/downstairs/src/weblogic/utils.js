import * as Config from "../config";

export function autoAdjustGameScreenSize(divName) {
    let divgame = document.getElementById(divName);
    divgame.style.width = (window.innerWidth * Config.AutoWidthPercent) + "px";
    divgame.style.height = (window.innerHeight * Config.AutoHeightPercent) + "px";
}

export function pushElementToArray(arr, element, times) {
    times = times || 1;
    if (times <= 0) {
        return arr;
    }
    for (let n = 0; n < times; n++) {
        arr.push(element);
    }
    return arr;
}

export function removeArrayElementByValue(arr) {
    let what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
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

export function loadDownstairsGameSetting() {
    if (checkCookie(Config.GameSettingCookieName) === false) {
        setCookie(
            Config.GameSettingCookieName,
            JSON.stringify(Config.DefaultGameSetting),
            Config.GameSettingCookieExpiredDay
        );
        return Config.DefaultGameSetting;
    } else {
        let validSetting = Config.DefaultGameSetting;
        let data = null;
        try {
            data = JSON.parse(getCookie(Config.GameSettingCookieName));
        } catch(err) {
            setCookie(
                Config.GameSettingCookieName,
                JSON.stringify(validSetting),
                Config.GameSettingCookieExpiredDay
            );
            return validSetting;
        }
        if(data.hasOwnProperty("Sounds") && typeof(data.Sounds) === "boolean") {
            validSetting.Sounds = data.Sounds;
        }
        if(data.hasOwnProperty("SandLedge") && typeof(data.SandLedge) === "boolean") {
            validSetting.SandLedge = data.SandLedge;
        }
        if(data.hasOwnProperty("JumpLedge") && typeof(data.JumpLedge) === "boolean") {
            validSetting.JumpLedge = data.JumpLedge;
        }
        if(data.hasOwnProperty("RollLedge") && typeof(data.RollLedge) === "boolean") {
            validSetting.RollLedge = data.RollLedge;
        }
        setCookie(
            Config.GameSettingCookieName,
            JSON.stringify(validSetting),
            Config.GameSettingCookieExpiredDay
        );
        return validSetting;
    }
}
