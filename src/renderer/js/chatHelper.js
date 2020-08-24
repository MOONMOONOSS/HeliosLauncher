export default class ChatHelper {
  static getContents(obj) {
    if (!obj.msg) {
      return obj.translation;
    }

    if (obj.msg && obj.player) {
      return `<${obj.player}> ${obj.msg}`;
    }

    return 'Probably a bug! (probably)';
  }

  static elementName(id) {
    return `chat-entry-${id}`;
  }
}
