export default class ChatHelper {
  static getContents(obj) {
    if (!obj.msg) {
      return obj.translation;
    }

    return obj.msg;
  }

  static elementName(id) {
    return `chat-entry-${id}`;
  }
}
