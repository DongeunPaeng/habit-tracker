const express = require("express");
const router = express.Router();
const query = require("../db");
const dotenv = require("dotenv");

dotenv.config();

router.get("/register", function (req, res, next) {
  res.render("register", { title: "Habit Tracker" });
});

router.get("/login", function (req, res, next) {
  res.render("login", { title: "Habit Tracker" });
});

router.post("/register", function (req, res) {
  const {
    body: { id, password, password2 },
  } = req;
  if (!id || !password || !password2) {
    res.render("register", {
      title: "Habit Tracker",
      message: "Please fill out all forms",
    });
    return;
  }
  if (password !== password2) {
    res.render("register", {
      title: "Habit Tracker",
      message: "Passwords don't match",
    });
    return;
  }
  try {
    const postQuery = `insert into users (username, password, created_at) values (?, ?, now())`;
    query(async (connection) => {
      const [rows] = await connection.query(postQuery, [id, password]);
      return rows;
    })
      .then((results) => {
        if (!results) {
          console.log("r:", results);
          res.render("register", {
            title: "Habit Tracker",
            message: "Oops, Your ID is already taken.",
          });
          return;
        }
        req.session.user = id;
        req.session.save(() => {
          res.redirect("/");
        });
      })
      .catch((err) => {
        res.render("register", { title: "Habit Tracker", message: err });
        return;
      });
  } catch (err) {
    res.render("register", { title: "Habit Tracker", message: err });
    return;
  }
});

router.post("/login", function (req, res) {
  const {
    body: { id, password },
  } = req;
  try {
    const getQuery = `select * from users where username = ? and password = ?`;
    query(async (connection) => {
      const [rows] = await connection.query(getQuery, [id, password]);
      return rows;
    }).then((results) => {
      if (results[0]) {
        req.session.user = id;
        req.session.save(() => {
          res.redirect("/");
        });
        return;
      }
      res.render("login", {
        title: "Habit Tracker",
        message: "ID or password is wrong.",
      });
    });
  } catch (err) {
    res.render("login", {
      title: "Habit Tracker",
      message: "Sorry... it is our fault.",
    });
  }
});

router.get("/", function (req, res, next) {
  const {
    query: { habit },
    session: { user },
  } = req;
  try {
    if (user) {
      console.log("found a user in session:", user);
      const getQuery = `select * from habits where user_id = ? order by created_at desc`;
      query(async (connection) => {
        const [rows] = await connection.query(getQuery, user);
        return rows;
      }).then((results) => {
        res.render("index", {
          title: "Habit Tracker",
          user,
          results,
          habit,
        });
      });
    } else {
      console.log("can't find a user object in session.");
      res.redirect("/login");
    }
  } catch (err) {
    console.log("DB err:", err);
    res.status(500).send({ status: 500 });
  }
});

router.get("/get-date", function (req, res, next) {
  const {
    query: { habit },
    session: { user },
  } = req;
  try {
    const getQuery = `select * from habits where habit = ? and user_id = ?`;
    const getDatesQuery = `select * from habit_dates where (user_id = ?) and (habit_id = ?) and (deleted = 0 or deleted is null)`;
    query(async (connection) => {
      const [getResults] = await connection.query(getQuery, [habit, user]);
      const habitId = getResults[0].id;
      const [dates] = await connection.query(getDatesQuery, [user, habitId]);
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
    session: { user },
  } = req;
  if (habit === "") {
    res.redirect("/");
    return;
  }
  try {
    const getQuery = `select * from habits where habit = ? and user_id = ?`;
    const postQuery = `insert into habits (habit, created_at, user_id) values (?, (now() + interval 9 hour), ?)`;
    query(async (connection) => {
      const [rows] = await connection.query(getQuery, [habit, user]);
      if (rows[0]) {
        res.render("index", {
          title: "Habit Tracker",
          message: "Duplicate!",
        });
      }
      await connection.query(postQuery, [habit, user]);
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
    session: { user },
  } = req;
  try {
    const getQuery = `select * from habits where habit = ? and user_id = ?`;
    const checkQuery = `select * from habit_dates where habit_id = ? and year = ? and month = ? and date = ? and user_id = ?`;
    const postQuery = `insert into habit_dates (habit_id, year, month, date, user_id) values (?, ?, ?, ?, ?)`;
    const cancelQuery = `update habit_dates set deleted = 1 where habit_id = ? and year = ? and month = ? and date = ? and user_id = ?`;
    const recoverQuery = `update habit_dates set deleted = 0 where habit_id = ? and year = ? and month = ? and date = ? and user_id = ?`;
    query(async (connection) => {
      const [getResults] = await connection.query(getQuery, [habit, user]);
      const habit_id = getResults[0].id;
      const [checkResults] = await connection.query(checkQuery, [
        habit_id,
        year,
        month,
        date,
        user,
      ]);
      const isChecked = checkResults[0];
      if (isChecked) {
        if (isChecked.deleted != 1) {
          await connection.query(cancelQuery, [
            habit_id,
            year,
            month,
            date,
            user,
          ]);
          return;
        }
        await connection.query(recoverQuery, [
          habit_id,
          year,
          month,
          date,
          user,
        ]);
        return;
      }
      await connection.query(postQuery, [habit_id, year, month, date, user]);
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
    session: { user },
  } = req;
  try {
    const postQuery = `delete from habits where user_id = ? and habit = ?`;
    query((connection) => {
      connection.query(postQuery, [user, habit]);
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
    session: { user },
  } = req;
  if (newHabitName === null) {
    res.redirect("/");
    return;
  }
  try {
    const postQuery = `update habits set habit = ? where user_id = ? and habit = ?`;
    query((connection) => {
      connection.query(postQuery, [newHabitName, user, habit]);
    }).then(() => {
      res.sendStatus(200);
    });
  } catch (err) {
    console.log("DB err:", err);
    res.sendStatus(500);
  }
});

router.get("/logout", function (req, res, next) {
  req.session.destroy((err) => {
    res.redirect("/");
  });
});

module.exports = router;
