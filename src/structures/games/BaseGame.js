class BaseGame {
  /**
   * @typedef {Object} size
   * @property {number} x
   * @property {number} y
   */
  /**
   * @typedef {Object[]} blocks
   * @property {string} emoji
   * @property {number} rarity Must be between 0 and 1 and the sum of probabilities must be equal to 1
   */
  /**
   * @typedef {Object} emojis
   * @property {string} character
   * @property {blocks} blocks
   */
  /**
   *
   * @param {size} mapSize
   * @param {size} viewSize
   * @param {emojis} emojis
   */
  constructor(mapSize, viewSize, emojis, client) {
    this.startedAt = new Date().getTime();
    this.mapSize = mapSize;
    this.viewSize = viewSize;
    this.emojis = emojis;
    this.client = client;
    this.charLocation = {
      x: 2,
      y: 2,
    };
    this.viewLocation = {
      x: this.mapSize.x / 2,
      y: this.mapSize.y / 2,
    };
    this.rendered = Array(this.viewSize.y)
      .fill(-1)
      .map(() => Array(this.viewSize.x).fill(-1));
    this.canceled = false;
    this.init();
  }
  init() {
    let map = Array(this.mapSize.y)
      .fill(-1)
      .map(() => Array(this.mapSize.x).fill(-1));
    let view = Array(this.viewSize.y)
      .fill(-1)
      .map(() => Array(this.viewSize.x).fill(-1));

    const odds = this.emojis.blocks.map((x) => x.rarity);
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const value = this.client.utils.getWeightedProbability(odds);
        map[y][x] = value;
      }
    }
    this.map = map;
    this.view = view;
    this.moveView(this.viewLocation);
  }
  /**
   *
   * @param {integer} x
   * @param {integer} y
   */
  moveView(location) {
    for (let ny = 0; ny < this.viewSize.y; ny++) {
      for (let nx = 0; nx < this.viewSize.x; nx++) {
        this.view[ny][nx] = this.map[location.y + ny][location.x + nx];
      }
    }
    return this.view;
  }
  moveChar(x, y) {
    this.charLocation.x += x;
    this.charLocation.y += y;
    if (this.charLocation.x < 0) {
      this.charLocation.x = 4;
      this.viewLocation.x -= 5;
      this.moveView(this.viewLocation);
    }
    if (this.charLocation.x > 4) {
      this.charLocation.x = 0;
      this.viewLocation.x += 5;
      this.moveView(this.viewLocation);
    }
    if (this.charLocation.y < 0) {
      this.charLocation.y = 4;
      this.viewLocation.y -= 5;
      this.moveView(this.viewLocation);
    }
    if (this.charLocation.y > 4) {
      this.charLocation.y = 0;
      this.viewLocation.y += 5;
      this.moveView(this.viewLocation);
    }
    return this.view;
  }
  render() {
    const blocks = this.emojis.blocks;
    for (let y = 0; y < this.rendered.length; y++) {
      for (let x = 0; x < this.rendered[y].length; x++) {
        this.rendered[y][x] = blocks.find((_, i) => i == this.view[y][x]).emoji;
      }
    }
    this.rendered[this.charLocation.y][this.charLocation.x] = this.emojis.character;
    return this.rendered.map((x) => x.map((y) => y).join("")).join("\n");
  }
}
module.exports = BaseGame;
