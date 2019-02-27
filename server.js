const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const print = require("./server/print");
const svgToDataURL = require("svg-to-dataurl");

const app = express();
const port = 3000;

const URI = "mongodb://localhost:27017";
let db, collection;

MongoClient.connect(URI, { useNewUrlParser: true, poolSize: 10 })
  .then(client => {
    db = client.db("makefest2019");
    collection = db.collection("designs");
  })
  .catch(error => {
    console.error(error);
  });

app.use(express.static("public"));
app.use("/scripts", express.static(__dirname + "/node_modules/"));
app.disable("etag");

// ROUTES
app.get("/", (req, res) => res.sendFile("index.html", { root: __dirname }));
app.get("/admin", (req, res) =>
  res.sendFile("admin.html", { root: __dirname + "/public" })
);

// USER INTERFACE
app.post("/save/:shape", (req, res) => {
  let allowedShapes = ["circle", "hexagon", "robot"];
  if (
    !req.query.svg ||
    !req.params.shape ||
    allowedShapes.indexOf(req.params.shape) == -1
  ) {
    res.status(400).send();
  } else {
    print("123123132", req.params.shape, req.query.svg);
    collection
      .insertOne({ svg: req.query.svg, shape: req.params.shape })
      .then((err, docsInserted) => {
        res.send({
          err,
          docsInserted
        });
      });
  }
});

app.get("/svg", (req, res) => {
  if (!req.query.code) {
    res.status(400).send();
  } else {
    collection.findOne({ code: req.query.code }).then(function(result, err) {
      if (err) {
        res.send({
          error: true
        });
      } else {
        if (result) {
          res.send({
            error: false,
            success: true,
            result
          });
        } else {
          res.send({
            error: false,
            success: false
          });
        }
      }
    });
  }
});

app.get("/rawsvg", (req, res) => {
  if (!req.query.code) {
    res.status(400).send();
  } else {
    collection.findOne({ code: req.query.code }).then(function(result, err) {
      if (err) {
        res.send({
          error: true
        });
      } else {
        if (result) {
          res.send("data:image/svg+xml;utf8," + encodeURIComponent(result.svg));
        } else {
          res.send({});
        }
      }
    });
  }
});

// ADMIN

app.get("/verify-code", (req, res) => {
  if (!req.query.code) {
    res.status(400).send();
  } else {
    collection.find({ code: req.query.code }).toArray(function(err, result) {
      if (err) {
        res.send({
          error: true
        });
      }

      res.send({
        valid: result.length > 0,
        error: false
      });
    });
  }
});

// LISTEN
app.listen(port, () =>
  console.log(`Listening on port ${port}! Env is ${process.env.NODE_ENV}`)
);
