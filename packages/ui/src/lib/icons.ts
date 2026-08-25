// imported one by one rather than through `import.meta.glob` so that
// `keyof typeof` is a literal union: vite types a glob as `Record<string,string>`
// which would make every `name` a valid one and push typos to runtime

import angleDown from "../icons/angle-down.svg?raw";
import angleLeft from "../icons/angle-left.svg?raw";
import angleRight from "../icons/angle-right.svg?raw";
import angleUp from "../icons/angle-up.svg?raw";
import arrowDown from "../icons/arrow-down.svg?raw";
import arrowLeft from "../icons/arrow-left.svg?raw";
import arrowRight from "../icons/arrow-right.svg?raw";
import arrowUp from "../icons/arrow-up.svg?raw";
import calendar from "../icons/calendar.svg?raw";
import camera from "../icons/camera.svg?raw";
import checkCircle from "../icons/check-circle.svg?raw";
import circle from "../icons/circle.svg?raw";
import clock from "../icons/clock.svg?raw";
import cocktail from "../icons/cocktail.svg?raw";
import coins from "../icons/coins.svg?raw";
import cross from "../icons/cross.svg?raw";
import cube from "../icons/cube.svg?raw";
import die1 from "../icons/die-1.svg?raw";
import die2 from "../icons/die-2.svg?raw";
import disc from "../icons/disc.svg?raw";
import facebook from "../icons/facebook.svg?raw";
import flagFrance from "../icons/flag-france.svg?raw";
import flagUK from "../icons/flag-uk.svg?raw";
import game from "../icons/game.svg?raw";
import google from "../icons/google.svg?raw";
import hourglass from "../icons/hourglass.svg?raw";
import house from "../icons/house.svg?raw";
import instagram from "../icons/instagram.svg?raw";
import linkedin from "../icons/linkedin.svg?raw";
import lock from "../icons/lock.svg?raw";
import mail from "../icons/mail.svg?raw";
import medal from "../icons/medal.svg?raw";
import menu from "../icons/menu.svg?raw";
import minus from "../icons/minus.svg?raw";
import musicNote from "../icons/music-note.svg?raw";
import phone from "../icons/phone.svg?raw";
import pin from "../icons/pin.svg?raw";
import plus from "../icons/plus.svg?raw";
import question from "../icons/question.svg?raw";
import rosette from "../icons/rosette.svg?raw";
import search from "../icons/search.svg?raw";
import sparkles from "../icons/sparkles.svg?raw";
import star from "../icons/star.svg?raw";
import tiktok from "../icons/tiktok.svg?raw";
import user from "../icons/user.svg?raw";
import users2 from "../icons/users-2.svg?raw";
import users3 from "../icons/users-3.svg?raw";
import users4 from "../icons/users-4.svg?raw";
import youtube from "../icons/youtube.svg?raw";

export const icons = {
  "angle-down": angleDown,
  "angle-left": angleLeft,
  "angle-right": angleRight,
  "angle-up": angleUp,
  "arrow-down": arrowDown,
  "arrow-left": arrowLeft,
  "arrow-right": arrowRight,
  "arrow-up": arrowUp,
  calendar,
  camera,
  "check-circle": checkCircle,
  circle,
  clock,
  cocktail,
  coins,
  cross,
  cube,
  "die-1": die1,
  "die-2": die2,
  disc,
  facebook,
  "flag-france": flagFrance,
  "flag-uk": flagUK,
  game,
  google,
  hourglass,
  house,
  instagram,
  linkedin,
  lock,
  mail,
  medal,
  menu,
  minus,
  "music-note": musicNote,
  phone,
  pin,
  plus,
  question,
  rosette,
  search,
  sparkles,
  star,
  tiktok,
  user,
  "users-2": users2,
  "users-3": users3,
  "users-4": users4,
  youtube,
} as const;

export type IconName = keyof typeof icons;

export type FlagIconName = Extract<IconName, "flag-france" | "flag-uk">;
