const express = require("express");
const router = express.Router();
const query = require("../db");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Habit Tracker" });
});

router.post("/add-habit", function (req, res, next) {
  const {
    body: { habit },
  } = req;
  try {
    const queryString = `insert into habits (habit, created_at) values (?, now())`;
    query(async (connection) => {
      const [rows] = await connection.query(queryString, [habit]);
      return rows.insertId;
    });
  } catch (err) {
    console.log(err);
  }
  res.render("index", { title: "Habit Tracker" });
});

module.exports = router;
