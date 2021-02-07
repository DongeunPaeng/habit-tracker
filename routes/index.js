const express = require("express");
const router = express.Router();
const query = require("../db");

router.get("/", function (req, res, next) {
  const {
    query: { habit },
  } = req;
  try {
    const getQuery = `select * from habits order by created_at desc`;
    query(async (connection) => {
      const [rows] = await connection.query(getQuery);
      return rows;
    }).then((results) => {
      res.render("index", { title: "Habit Tracker", results, habit });
    });
  } catch (err) {
    console.log("DB err:", err);
    res.redirect("/");
  }
});

router.get("/get-date", function (req, res, next) {
  const {
    query: { habit },
  } = req;
  try {
    const getQuery = `select * from habits where habit = ?`;
    const getDatesQuery = `select * from habit_dates where (habit_id = ?) and (deleted = 0 or deleted is null)`;
    query(async (connection) => {
      const [getResults] = await connection.query(getQuery, [habit]);
      const habitId = getResults[0].id;
      const [dates] = await connection.query(getDatesQuery, [habitId]);
      res.send({ dates }).status(200);
    });
  } catch (err) {
    console.log("DB err:", err);
    res.redirect("/");
  }
});

router.post("/add-habit", function (req, res, next) {
  const {
    body: { habit },
  } = req;
  if (habit === "") {
    res.redirect("https://www.google.com");
    return;
  }
  try {
    const getQuery = `select * from habits where habit = ?`;
    const postQuery = `insert into habits (habit, created_at) values (?, now())`;
    query(async (connection) => {
      const [rows] = await connection.query(getQuery, [habit]);
      if (rows[0]) {
        res.render("index", {
          title: "Habit Tracker",
          message: "Duplicate!",
        });
      }
      await connection.query(postQuery, [habit]);
    })
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log("DB err:", err);
    res.redirect("/");
  }
});

router.post("/add-date", function (req, res, next) {
  const {
    body: { year, month, date, habit },
  } = req;
  try {
    const getQuery = `select * from habits where habit = ?`;
    const checkQuery = `select * from habit_dates where habit_id = ? and year = ? and month = ? and date = ?`;
    const postQuery = `insert into habit_dates (habit_id, year, month, date) values (?, ?, ?, ?)`;
    const cancelQuery = `update habit_dates set deleted = 1 where habit_id = ? and year = ? and month = ? and date = ?`;
    const recoverQuery = `update habit_dates set deleted = 0 where habit_id = ? and year = ? and month = ? and date = ?`;
    query(async (connection) => {
      const [getResults] = await connection.query(getQuery, [habit]);
      const habit_id = getResults[0].id;
      const [checkResults] = await connection.query(checkQuery, [
        habit_id,
        year,
        month,
        date,
      ]);
      const isChecked = checkResults[0];
      if (isChecked) {
        if (isChecked.deleted != 1) {
          await connection.query(cancelQuery, [habit_id, year, month, date]);
          return;
        }
        await connection.query(recoverQuery, [habit_id, year, month, date]);
        return;
      }
      await connection.query(postQuery, [habit_id, year, month, date]);
    }).then(() => {
      res.sendStatus(200);
    });
  } catch (err) {
    console.log("DB err:", err);
    res.sendStatus(500);
  }
});

router.post("/delete", function (req, res, next) {
  const {
    body: { query: habit },
  } = req;
  try {
    const postQuery = `delete from habits where habit = ?`;
    query((connection) => {
      connection.query(postQuery, [habit]);
    }).then(() => {
      res.sendStatus(200);
    });
  } catch (err) {
    console.log("DB err:", err);
    res.sendStatus(500);
  }
});

router.post("/change", function (req, res, next) {
  const {
    body: { query: habit, newHabitName },
  } = req;
  try {
    const postQuery = `update habits set habit = ? where habit = ?`;
    query((connection) => {
      connection.query(postQuery, [newHabitName, habit]);
    }).then(() => {
      res.sendStatus(200);
    });
  } catch (err) {
    console.log("DB err:", err);
    res.sendStatus(500);
  }
});

module.exports = router;
