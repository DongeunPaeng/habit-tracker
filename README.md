# Habit Tracker
A super-simple habit tracker for minimalists.

## How to use
* Register your ID/PW.
* Log in.
* Add habits.
* Click 'my habits' to see your habits.
* Click one of your habit to see the calendar.
  - You can toggle on any date to mark whether you've done the habit on that day.
* Change a habit's name or Delete the habit with buttons at the top-right side of the calendar.

## If you want more...
Please contact me at [GitHub](https://github.com/DongeunPaeng) or email me at dongeun.paeng@gmail.com.

You can also clone this repository and customize easily, with steps below:
```bash
# Clone this repository
$ git clone

# Go into the repository
$ cd habit-tracker

# Create Environment Variables
$ touch .env

// You have to create 4 environment variables:
// DB_HOST_PROD, DB_USER, DB_PASSWORD_PROD, DB_NAME, SESSION_SECRET.

# Install dependencies
$ npm install

# Run the app on the local server
$ npm dev
```

## Credits

This software uses the following open source packages and free services:
- [Node.js](https://nodejs.org/)
- [Heroku](https://heroku.com/)
- [Pug](https://pugjs.org/)
- [MySQL](https://www.mysql.com/)
