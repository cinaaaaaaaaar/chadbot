const letters = require("../../assets/json/flipped");
const { CommandInteraction } = require("discord.js");

CommandInteraction.prototype.error = async function (error) {
  const content = {
    embeds: [
      {
        title: "Wrong Usage",
        description: "```" + error + "```",
        color: "e84d3f",
      },
    ],
  };
  if (this.deferred) return this.editReply(content);
  else return this.reply(content);
};

String.prototype.wrap = function (width) {
  return this.replace(
    new RegExp(`(?![^\\n]{1,${width}}$)([^\\n]{1,${width}})\\s`, "g"),
    "$1\n"
  );
};

String.prototype.toNumber = function () {
  const regex = /[.,\s]/g;
  const result = this.replace(regex, "");
  let number = result.replace("k", "000");
  number = parseInt(number.replace("m", "000000"));
  return number;
};

String.prototype.shuffle = function () {
  let splitted = this.split(""),
    length = splitted.length;

  for (var i = length - 1; i > 0; i--) {
    let chance = Math.floor(Math.random() * i + 1);
    let tmp = splitted[i];
    splitted[i] = splitted[chance];
    splitted[chance] = tmp;
  }

  splitted = splitted.join("") == this ? this.shuffle(this) : splitted;
  return Array.isArray(splitted) ? splitted.join("") : splitted;
};

String.prototype.flip = function () {
  let newStr = "";
  for (let i = this.length - 1; i >= 0; i--) {
    if (this[i] === " ") newStr += " ";
    for (const letter of Object.keys(letters)) {
      var flipped = letters[letter];
      if (this[i] === letter) newStr += flipped;
    }
  }
  return newStr;
};

String.prototype.upperFirstChar = function () {
  return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

Array.prototype.pagify = function (limit) {
  newArray = [];

  for (let i = 0; i < this.length; i++) {
    if (i % limit === 0) {
      newArray.push([]);
    }
    let index = Math.floor(i / limit);
    newArray[index].push(this[i]);
  }
  return newArray;
};

Array.prototype.remove = function (value) {
  this.filter((x) => x != value);
};

String.prototype.isURL = function () {
  const regex = new RegExp(
    /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
  );
  return regex.test(this);
};

String.prototype.isImageURL = function () {
  const regex = new RegExp(
    /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+(?:png|jpg|jpeg)+$/
  );
  return regex.test(this);
};

Object.filter = function (obj, callback) {
  return Object.fromEntries(Object.entries(obj).filter(callback));
};

String.prototype.isAscii = function () {
  return /^[\x00-\x7F]*$/.test(this);
};

module.exports = [String, Object, CommandInteraction, Array, Number];
