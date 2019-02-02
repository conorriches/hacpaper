const express = require("express");
const MongoClient = require("mongodb").MongoClient;

const app = express();
const port = 3000;

const URI = "mongodb://localhost:27017";
let db, collection;

MongoClient.connect(
  URI,
  { useNewUrlParser: true, poolSize: 10 }
)
  .then(client => {
    db = client.db("makefest2019");
    collection = db.collection("codes");
  })
  .catch(error => {
    console.error(error);
  });

app.use(express.static("public"));
app.use("/scripts", express.static(__dirname + "/node_modules/"));
app.get("/", (req, res) => res.sendFile("index.html", { root: __dirname }));

app.get("/populate", (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    res.status(403).send({
      env: process.env.NODE_ENV
    });
  } else {
    var genCodes = () => {
      var codes = require("./codes.json");
      return codes;
    };

    collection
      .insertMany(genCodes())
      .then(results => {
        collection.createIndex({ code: 1 }, { unique: true });
        res.send({
          results
        });
      })
      .catch(e => {
        res.status(500).send();
      });
  }
});

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

app.post("/save/:code", (req, res) => {
  if (!req.params.code) {
    res.status(400).send();
  } else {
    collection
      .update(
        { code: req.params.code },
        {
          $set: {
            svg: req.query.svg
          }
        }
      )
      .then((row, err) => {
        console.log(res);
        res.send({
          row
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

app.listen(port, () =>
  console.log(`Listening on port ${port}! Env is ${process.env.NODE_ENV}`)
);
