import * as utils from "../weblogic/utils";


export function moveToXY(game, sprite, x, y, speed, maxTime, callback, callbackContext) {
    speed = speed || 60;
    maxTime = maxTime || 0;

    let angle = Math.atan2(y - sprite.y, x - sprite.x);

    if (maxTime > 0)
    {
        //  We know how many pixels we need to move, but how fast?
        speed = utils.distanceToXY(sprite, x, y) / (maxTime / 1000);
    }

    sprite.body.velocity.setToPolar(angle, speed);

    let te = game.time.events.loop(game.time.physicsElapsedMS, function () {
        if ( Math.abs(sprite.x - x) <= 1 && Math.abs(sprite.y - y) <= 1) {
            te.loop = false;
            sprite.body.velocity.x = 0;
            sprite.body.acceleration.x = 0;
            sprite.body.velocity.y = 0;
            sprite.body.acceleration.y = 0;
            if (callback) {
                callback(sprite);
            }
            delete this;
        }
    }, callbackContext);
}

export function randSpriteFrame(sprite, frames) {
    let index = utils.getRandomInt(0, frames.length - 1);
    sprite.frameName = frames[index];
}

export function randSpriteFrameAndName(sprite, frames, names) {
    let index = utils.getRandomInt(0, frames.length - 1);
    sprite.name = names[index];
    sprite.frameName = frames[index];
}
