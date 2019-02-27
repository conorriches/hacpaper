const escpos = require("escpos");
const path = require("path");
const svg2img = require("svg2img");
const fs = require("fs");

/**
 * Print function that prints out a receipt for a given design
 * @param {Number} token For the barcode
 * @param {String} shape For the user
 * @param {String} svgString To show te SVG
 */
const print = (token, shape, svgString) => {
  const device = new escpos.Serial("COM7", {
    baudRate: 19200
  });
  const options = { encoding: "GB18030" /* default */ };
  const printer = new escpos.Printer(device);

  const d = new Date();
  const n = d.toTimeString().split("+")[0];

  svg2img(svgString, function(error, buffer) {
    fs.writeFileSync("temp/foo.png", buffer);
    escpos.Image.load("temp/foo.png", function(image) {
      escpos.Image.load("public/logo.png", function(logo) {
        device.open(function() {
          printer
            .font("a")
            .align("ct")
            .text("")
            .text("You designed a " + shape + "!")
            .text("(shape subject to stock)")
            .text("");
          printer.image(image, "d24");
          printer
            .size(1, 1)
            .text("Take this ticket to the laser engraver")
            .text("when you're ready!")
            .text("")
            .size(1, 1)
            .barcode(token, "CODE39")
            .text("")
            .text(n)
            .text("")
            .text("")
            .cut();

          printer.image(logo, "d24");
          printer
            .font("a")
            .align("ct")
            .style("bu")
            .size(2, 2)
            .text("Hackspace Manchester")
            .size(2, 2)
            .text("Etch-A-Thing")
            .size(1, 1)
            .text("Makefest 2019!")
            .text("")
            .text("***********************************")
            .text("Open Evening every Wed 6pm-10pm")
            .text("Just come on by! :) ")
            .text("hacman.org.uk / M40 7FS")
            .text("***********************************")
            .text("");
          printer.close();
        });
      });
    });
  });
};

module.exports = print;
