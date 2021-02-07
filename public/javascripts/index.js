class CalendarPicker {
    constructor(element, options) {
        this.element = element;
        this.options = options;
        this.date = new Date();
        this._formatDateToInit(this.date);

        this.day = this.date.getDay();
        this.month = this.date.getMonth();
        this.year = this.date.getFullYear();
        this.today = this.date;
        this.value = this.date;
        this.min = options.min;
        this.max = options.max;
        this._formatDateToInit(this.min);
        this._formatDateToInit(this.max);
        this.userElement = document.querySelector(element);

        this._setDateText();

        this.calendarWrapper = document.createElement("div");
        this.calendarElement = document.createElement("div");
        this.calendarHeader = document.createElement("header");
        this.calendarHeaderTitle = document.createElement("h4");
        this.navigationWrapper = document.createElement("section");
        this.previousMonthArrow = document.createElement("button");
        this.nextMonthArrow = document.createElement("button");
        this.calendarGridDays = document.createElement("section");
        this.calendarGrid = document.createElement("section");
        this.calendarDayElementType = "time";
        this.listOfAllDaysAsText = [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun",
        ];
        this.listOfAllMonthsAsText = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        this.calendarWrapper.id = "calendar-wrapper";
        this.calendarElement.id = "calendar";
        this.calendarGridDays.id = "calendar-days";
        this.calendarGrid.id = "calendar-grid";
        this.navigationWrapper.id = "navigation-wrapper";
        this.previousMonthArrow.id = "previous-month";
        this.nextMonthArrow.id = "next-month";

        this._insertHeaderIntoCalendarWrapper();
        this._insertCalendarGridDaysHeader();
        this._insertDaysIntoGrid();
        this._insertNavigationButtons();
        this._insertCalendarIntoWrapper();

        this.userElement.appendChild(this.calendarWrapper);
    }

    _getDaysInMonth = (month, year) => {
        if ((!month && month !== 0) || (!year && year !== 0)) return;

        let date = new Date(year, month, 1);
        let days = [];

        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    _formatDateToInit = (date) => {
        if (!date) return;
        date.setHours(0, 0, 0);
    };

    _setDateText = () => {
        let dateData = this.date.toString().split(" ");
        this.dayAsText = dateData[0];
        this.monthAsText = dateData[1];
        this.dateAsText = dateData[2];
        this.yearAsText = dateData[3];
    };

    _insertCalendarIntoWrapper = () => {
        this.calendarWrapper.appendChild(this.calendarElement);

        const handleSelectedElement = (event) => {
            if (
                event.target.nodeName.toLowerCase() ===
                this.calendarDayElementType
            ) {
                event.target.classList.toggle("colored");
                this.value = event.target.value;
                this.onValueChange(this.callback);
            }
        };

        this.calendarGrid.addEventListener(
            "click",
            handleSelectedElement,
            false
        );
    };

    _insertHeaderIntoCalendarWrapper = () => {
        this.calendarHeaderTitle.textContent =
            this.listOfAllMonthsAsText[this.month] + ", " + this.year;
        this.calendarHeader.appendChild(this.calendarHeaderTitle);
        this.calendarWrapper.appendChild(this.calendarHeader);
    };

    _insertCalendarGridDaysHeader = () => {
        this.listOfAllDaysAsText.forEach((day) => {
            let dayElement = document.createElement("span");
            dayElement.textContent = day;
            this.calendarGridDays.appendChild(dayElement);
        });

        this.calendarElement.appendChild(this.calendarGridDays);
    };

    _insertNavigationButtons = () => {
        let arrowSvg =
            '<svg enable-background="new 0 0 386.257 386.257" viewBox="0 0 386.257 386.257" xmlns="http://www.w3.org/2000/svg"><path d="m0 96.879 193.129 192.5 193.128-192.5z"/></svg>';

        this.previousMonthArrow.innerHTML = arrowSvg;
        this.nextMonthArrow.innerHTML = arrowSvg;

        this.previousMonthArrow.setAttribute(
            "aria-label",
            "Go to previous month"
        );
        this.nextMonthArrow.setAttribute("aria-label", "Go to next month");

        this.navigationWrapper.appendChild(this.previousMonthArrow);
        this.navigationWrapper.appendChild(this.nextMonthArrow);

        // Cannot use arrow-functions for IE support :(
        let that = this;
        this.navigationWrapper.addEventListener(
            "click",
            (clickEvent) => {
                if (
                    clickEvent.target.closest("#" + that.previousMonthArrow.id)
                ) {
                    if (that.month === 0) {
                        that.month = 11;
                        that.year -= 1;
                    } else {
                        that.month -= 1;
                    }
                    that._updateCalendar();
                }

                if (clickEvent.target.closest("#" + that.nextMonthArrow.id)) {
                    if (that.month === 11) {
                        that.month = 0;
                        that.year += 1;
                    } else {
                        that.month += 1;
                    }
                    that._updateCalendar();
                }
            },
            false
        );

        that.calendarElement.appendChild(that.navigationWrapper);
    };

    _insertDaysIntoGrid = async () => {
        this.calendarGrid.innerHTML = "";

        let arrayOfDays = this._getDaysInMonth(this.month, this.year);
        let firstDayOfMonth = arrayOfDays[0].getDay();

        firstDayOfMonth = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;

        if (1 < firstDayOfMonth) {
            arrayOfDays = Array(firstDayOfMonth - 1)
                .fill(false, 0)
                .concat(arrayOfDays);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get("habit");
        const arrayOutput = await fetch(`/get-date/?habit=${query}`)
            .then((res) => res.json())
            .then((data) => data.dates);

        const yearsArray = arrayOutput.map((row) => row.year);
        const monthsArray = arrayOutput.map((row) => row.month);
        const datesArray = arrayOutput.map((row) => row.date);

        arrayOfDays.forEach((date) => {
            const recurringYear = date.getFullYear();
            const recurringMonth = date.getMonth() + 1;
            const recurringDate = date.getDate();

            let dateElement = document.createElement(
                date ? this.calendarDayElementType : "span"
            );
            let Date = date.toString().split(" ")[2];
            let dateIsTheCurrentValue =
                this.value.toString() === date.toString();
            if (dateIsTheCurrentValue) this.activeDateElement = dateElement;
            let dateShouldBeColored =
                yearsArray.includes(recurringYear) &&
                monthsArray.includes(recurringMonth) &&
                datesArray.includes(recurringDate);

            if (dateShouldBeColored) dateElement.classList.add("colored");

            dateElement.tabIndex = 0;
            dateElement.value = date;

            dateElement.textContent = date ? Date : "";
            this.calendarGrid.appendChild(dateElement);
        });

        this.calendarElement.appendChild(this.calendarGrid);
        this.activeDateElement.classList.add("selected");
    };

    _updateCalendar = () => {
        this.date = new Date(this.year, this.month);

        this._setDateText();

        this.day = this.date.getDay();
        this.month = this.date.getMonth();
        this.year = this.date.getFullYear();

        const that = this;
        window.requestAnimationFrame(() => {
            that.calendarHeaderTitle.textContent =
                that.listOfAllMonthsAsText[that.month] + " - " + that.year;
            that._insertDaysIntoGrid();
        });
    };

    onValueChange = (callback) => {
        if (this.callback) return this.callback(this.value);
        this.callback = callback;
    };
}

const myFunction = () => {
    document.getElementById("myDropdown").classList.toggle("show");
};

window.onclick = (event) => {
    if (!event.target.matches(".dropbtn")) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        let i;
        for (i = 0; i < dropdowns.length; i++) {
            openDropdown = dropdowns[i];
            if (openDropdown.classList.contains("show")) {
                openDropdown.classList.remove("show");
            }
        }
    }
};

const deleteButton = document.getElementById("calendarDeleteButton");
if (deleteButton) {
    deleteButton.addEventListener("click", () => {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get("habit");
        const url = "/delete";
        const data = { query };

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((res) => res)
            .then((data) => {
                if (data.status === 200) {
                    window.location = "/";
                }
            })
            .catch((error) => {
                console.log("Delete Error:", error);
            });
    });
}

const changeButton = document.getElementById("calendarChangeButton");
if (changeButton) {
    changeButton.addEventListener("click", () => {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get("habit");
        const newHabitName = prompt("Update your habit name", query);
        const url = "/change";
        const data = { query, newHabitName };

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((res) => res)
            .then((data) => {
                if (data.status === 200) {
                    window.location = `/?habit=${newHabitName}`;
                }
            })
            .catch((error) => {
                console.log("Delete Error:", error);
            });
    });
}
