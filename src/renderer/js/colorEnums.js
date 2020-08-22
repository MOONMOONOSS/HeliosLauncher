export default class ColorEnum {
  static BLACK = 'black';

  static DARK_BLUE = 'dark_blue';

  static DARK_GREEN = 'dark_green';

  static DARK_AQUA = 'dark_aqua';

  static DARK_RED = 'dark_red';

  static DARK_PURPLE = 'dark_purple';

  static GOLD = 'gold';

  static GRAY = 'gray';

  static DARK_GRAY = 'dark_gray';

  static BLUE = 'blue';

  static GREEN = 'green';

  static AQUA = 'aqua';

  static RED = 'red';

  static LIGHT_PURPLE = 'light_purple';

  static YELLOW = 'yellow';

  static WHITE = 'white';

  static enumToHex(enumType) {
    switch (enumType) {
      case ColorEnum.BLACK:
        return '#000000';
      case ColorEnum.DARK_BLUE:
        return '#0000AA';
      case ColorEnum.DARK_GREEN:
        return '#00AA00';
      case ColorEnum.DARK_AQUA:
        return '#00AAAA';
      case ColorEnum.DARK_RED:
        return '#AA0000';
      case ColorEnum.DARK_PURPLE:
        return '#AA00AA';
      case ColorEnum.GOLD:
        return '#FFAA00';
      case ColorEnum.GRAY:
        return '#AAAAAA';
      case ColorEnum.DARK_GRAY:
        return '#555555';
      case ColorEnum.BLUE:
        return '#5555FF';
      case ColorEnum.GREEN:
        return '#55FF55';
      case ColorEnum.AQUA:
        return '#55FFFF';
      case ColorEnum.RED:
        return '#FF5555';
      case ColorEnum.LIGHT_PURPLE:
        return '#FF55FF';
      case ColorEnum.YELLOW:
        return '#FFFF55';
      case ColorEnum.WHITE:
        return '#FFFFFF';
      default:
        throw new Error('Passed value not a valid color code');
    }
  }
}
