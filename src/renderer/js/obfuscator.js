export default class Obfuscator {
  static animId;

  static els;

  static construct() {
    if (!Obfuscator.animId && !Obfuscator.els) {
      Obfuscator.animId = window.requestAnimationFrame(Obfuscator.animationUpdate);
      Obfuscator.els = [...document.getElementsByClassName('obfuscated')];
    } else {
      throw new Error('An Obfuscator class has already been initialized!');
    }
  }

  static animationUpdate() {
    Obfuscator.animId = window.requestAnimationFrame(Obfuscator.animationUpdate);

    Obfuscator.els = [...document.getElementsByClassName('obfuscated')];

    if (!Obfuscator.els || Obfuscator.els.length === 0) {
      return;
    }

    Obfuscator.els.forEach((el) => {
      let newStr = '';

      [...el.innerText].forEach(() => {
        newStr += String.fromCharCode(Obfuscator.randomInRange(64, 95));
      });

      el.innerText = newStr;
    });
  }

  static cancelAllUpdates() {
    Obfuscator.els = [];

    window.cancelAnimationFrame(Obfuscator.animId);
  }

  static get animationRequestId() {
    return Obfuscator.animId;
  }

  static get obfuscatedEls() {
    return Obfuscator.els;
  }

  static randomInRange(from, to) {
    return Math.floor(Math.random() * (to - from + 1)) + from;
  }
}
