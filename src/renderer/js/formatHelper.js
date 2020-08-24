export default class FormatHelper {
  static SEARCH_REGEX = /(§\w{1})/g;

  static BLACK = '§0';

  static DARK_BLUE = '§1';

  static DARK_GREEN = '§2';

  static DARK_AQUA = '§3';

  static DARK_RED = '§4';

  static DARK_PURPLE = '§5';

  static GOLD = '§6';

  static GRAY = '§7';

  static DARK_GRAY = '§8';

  static BLUE = '§9';

  static GREEN = '§a';

  static AQUA = '§b';

  static RED = '§c';

  static LIGHT_PURPLE = '§d';

  static YELLOW = '§e';

  static WHITE = '§f';

  static OBFUSCATED = '§k';

  static BOLD = '§l';

  static STRIKETHROUGH = '§m';

  static UNDERLINE = '§n';

  static ITALIC = '§o';

  static RESET = '§r';

  static enumToMarkdown(enumType) {
    switch (enumType) {
      case FormatHelper.BOLD:
        return '**';
      case FormatHelper.STRIKETHROUGH:
        return '~~';
      case FormatHelper.UNDERLINE:
        return '++';
      case FormatHelper.ITALIC:
        return '*';
      default:
        return false;
    }
  }

  static enumToHex(enumType) {
    switch (enumType) {
      case FormatHelper.OBFUSCATED:
      case FormatHelper.BOLD:
      case FormatHelper.UNDERLINE:
      case FormatHelper.ITALIC:
      case FormatHelper.RESET:
        return false;
      case FormatHelper.BLACK:
        return '#000000';
      case FormatHelper.DARK_BLUE:
        return '#0000AA';
      case FormatHelper.DARK_GREEN:
        return '#00AA00';
      case FormatHelper.DARK_AQUA:
        return '#00AAAA';
      case FormatHelper.DARK_RED:
        return '#AA0000';
      case FormatHelper.DARK_PURPLE:
        return '#AA00AA';
      case FormatHelper.GOLD:
        return '#FFAA00';
      case FormatHelper.GRAY:
        return '#AAAAAA';
      case FormatHelper.DARK_GRAY:
        return '#555555';
      case FormatHelper.BLUE:
        return '#5555FF';
      case FormatHelper.GREEN:
        return '#55FF55';
      case FormatHelper.AQUA:
        return '#55FFFF';
      case FormatHelper.RED:
        return '#FF5555';
      case FormatHelper.LIGHT_PURPLE:
        return '#FF55FF';
      case FormatHelper.YELLOW:
        return '#FFFF55';
      case FormatHelper.WHITE:
        return '#FFFFFF';
      default:
        throw new Error(`Passed value not a valid color code: ${enumType}`);
    }
  }

  static parseTextFormatters(val) {
    val = val.trim();
    val = val.replace(new RegExp(/\(P\)/, 'g'), '§');
    const matches = val.match(FormatHelper.SEARCH_REGEX);

    if (!matches) return val;

    const activeFormatters = new Set();

    matches.forEach((match) => {
      const pattern = new RegExp(match);

      // Reset all formatting and colors
      if (match === FormatHelper.RESET) {
        let formattedString = '';

        activeFormatters.forEach((formatter) => {
          formattedString = `${formattedString}${formatter}`;
        });

        val = val.replace(pattern, formattedString);
      }

      const formatMatch = FormatHelper.enumToMarkdown(match);

      if (formatMatch) {
        val = val.replace(pattern, formatMatch);

        activeFormatters.add(formatMatch);
      }
    });

    // Sanity checking formatters in case they don't use a reset
    activeFormatters.forEach((formatter) => {
      val = `${val}${formatter}`;
    });

    return val;
  }

  static parseColorFormatters(val) {
    val = val.trim();
    const matches = val.match(FormatHelper.SEARCH_REGEX);

    let spanCnt = 0;

    if (!matches) return val;

    matches.forEach((match) => {
      const pattern = new RegExp(match);

      // Reset all formatting and colors
      if (match === FormatHelper.RESET) {
        let formattedString = '';

        while (spanCnt > 0) {
          formattedString = `${formattedString}</span>`;

          spanCnt -= 1;
        }

        val = val.replace(pattern, formattedString);

        spanCnt -= 1;
      }

      const colorMatch = FormatHelper.enumToHex(match);

      if (colorMatch) {
        val = val.replace(pattern, `<span style="color: ${colorMatch};">`);

        spanCnt += 1;
      }
    });

    // Sanity checking inputs in case they don't use a reset
    while (spanCnt > 0) {
      val = `${val}</span>`;

      spanCnt -= 1;
    }

    return val;
  }
}
