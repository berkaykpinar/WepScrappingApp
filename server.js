const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
// const fetch = require("isomorphic-fetch");
const fetch = require("sync-fetch");
const cheerio = require("cheerio");
const app = express();

const apiKey = "*****************";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("index", { sonuc: null });
  // similar(null,null);
});

app.post("/", function (req, res) {
  let url1 = req.body.url1;
  let url2 = req.body.url2;

  url1Res = GetUrlAndCount(url1).slice(0, 5);
  url2Res = GetUrlAndCount(url2).slice(0, 5);

  var similarityRatio = similar(url1Res, url2Res);

  var sonuc = { url1Res, url2Res, similarityRatio };

  res.render("index", { sonuc: sonuc });
});

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});

function similar(link1, link2) {
  let totalWord1 = 400; //Your url total size
  let totalWord2 = 400; //Your url total size
  let results1 = [];
  let results2 = [];

  let k = 0;
  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < 5; j++) {
      if (link1[i].key == link2[j].key) {
        results1[k] = link1[i];
        results2[k] = link2[i];
        k++;
      }
    }
  }
  let total1 = 0;
  let total2 = 0;

  for (let i = 0; i < results1.length; i++) {
    total1 += results1[i].count;
    total2 += results2[i].count;
  }
  let skor1 = total1 / totalWord1;
  let skor2 = total2 / totalWord2;

  return { skor1, skor2 };
}

function GetUrlAndCount(url) {
  const description = getDescription(url);

  var array = description.toLowerCase().split(/[.\*+-/_ ]/);

  var result = array.filter((word) => word != "");

  return count(result);
}

function getDescription(url) {
  const text = fetch(url).text();
  const $ = cheerio.load(text, {
    xml: {
      xmlMode: true,
      decodeEntities: false,
      normalizeWhitespace: true,
    },
  });
  return $("html").text().trim();
}

function count(array_elements) {
  let words = [];
  array_elements.sort();

  var current = null;
  var cnt = 0;
  for (var i = 0; i < array_elements.length; i++) {
    if (array_elements[i].length < 3) {
      continue;
    }
    if (array_elements[i] != current) {
      if (cnt > 0) {
        words.push({ key: current, count: cnt });
      }
      current = array_elements[i];
      cnt = 1;
    } else {
      cnt++;
    }
  }

  if (cnt > 0) {
    words.push({ key: current, count: cnt });
  }
  return words.sort(compare);
}
function compare(a, b) {
  let comparison = 0;
  if (a.count > b.count) {
    comparison = -1;
  } else if (a.count < b.count) {
    comparison = 1;
  }
  return comparison;
}
