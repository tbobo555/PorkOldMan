import MobileDetect from "mobile-detect";
import Game from "./src/objects/game";
import  "../../public/assets/css/downstairs/middle.css";
import Dict from "./src/dicts/us";


var md = new MobileDetect(window.navigator.userAgent);
if (md.mobile()) {
    document.write(Dict.NoSupportMobileText);
} else {
    window.game = new Game();
}
