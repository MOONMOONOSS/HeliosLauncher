export default class Obfuscator {
  static animId;

  static els;

  constructor() {
    if (!Obfuscator.animId && !Obfuscator.els) {
      Obfuscator.animId = window.requestAnimationFrame(Obfuscator.animationUpdate);
      Obfuscator.els = document.getElementsByClassName('obfuscated');

      return;
    }

    throw new Error('An Obfuscator class has already been initialized!');
  }

  static animationUpdate() {
    if (!Obfuscator.els || Obfuscator.els.length === 0) {
      return;
    }

    Obfuscator.els.forEach((el) => {
      const str = el.innerHtml;
      let newStr = '';

      [...str].forEach(() => {
        newStr += String.fromCharCode(Obfuscator.randomInRange(64, 95));
      });

      el.innerHtml = newStr;
    });
  }

  static cancelAllUpdates() {
    Obfuscator.els = [];

    window.cancelAnimationFrame(Obfuscator.animId);
  }

  static updateElementList() {
    Obfuscator.els = document.getElementsByClassName('obfuscated');
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
