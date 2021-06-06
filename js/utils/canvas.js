let canvas = null;

let lockMouse = window.requestPointerLock || window.mozRequestPointerLock;
let unlockMouse = document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;