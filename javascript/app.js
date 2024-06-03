const maxDays = 7;
const maxSeats = 25;
const sessionTimes = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
let sessions = {};

document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("date");
  const sessionsDiv = document.getElementById("sessions");
  const seatsDiv = document.getElementById("seats");
  const selectedInfoDiv = document.getElementById("selected-info");
  const dateRangeDiv = document.getElementById("date-range");

  dateRangeDiv.textContent = `Booking available from today until ${getMaxBookingDate()}`;

  dateInput.addEventListener("change", (event) => {
    const selectedDate = new Date(event.target.value);
    if (isDateValid(selectedDate)) {
      setCookie("selectedDate", selectedDate.toISOString(), maxDays);
      renderSessions(sessionsDiv, selectedDate);
      seatsDiv.classList.add("hidden");
      selectedInfoDiv.innerHTML = "";
      dateRangeDiv.textContent = `Booking available from today until ${getMaxBookingDate()}`;
    } else {
      sessionsDiv.innerHTML = "";
      seatsDiv.innerHTML = "";
      selectedInfoDiv.innerHTML = "";
      dateRangeDiv.textContent = `Invalid date. Booking available from today until ${getMaxBookingDate()}`;
    }
  });

  const savedDate = getCookie("selectedDate");
  if (savedDate) {
    const date = new Date(savedDate);
    if (isDateValid(date)) {
      dateInput.value = date.toISOString().split("T")[0];
      renderSessions(sessionsDiv, date);
    }
  }

  const savedSessions = getCookie("sessions");
  if (savedSessions) {
    sessions = JSON.parse(savedSessions);
  }
});

function renderSessions(container, date) {
  container.innerHTML = "";
  const today = new Date();
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  sessionTimes.forEach((time) => {
    const [hour, minute] = time.split(":").map(Number);
    const sessionDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    if (sessionDate.getTime() === currentDate.getTime()) {
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      if (
        hour > currentHour ||
        (hour === currentHour && minute >= currentMinute)
      ) {
        const button = document.createElement("button");
        button.textContent = time;
        button.addEventListener("click", (event) => {
          renderSeats(date, time);
          updateSelectedInfo(date, time, event.target);
          document.getElementById("seats").classList.remove("hidden");
        });
        container.appendChild(button);
      }
    } else {
      const button = document.createElement("button");
      button.textContent = time;
      button.addEventListener("click", (event) => {
        renderSeats(date, time);
        updateSelectedInfo(date, time, event.target);
        document.getElementById("seats").classList.remove("hidden");
      });
      container.appendChild(button);
    }
  });
}

function renderSeats(date, time) {
  const seatsDiv = document.getElementById("seats");
  seatsDiv.innerHTML = '<div class="screen">Screen</div>';
  const dateStr = date.toISOString().split("T")[0];
  if (!sessions[dateStr]) {
    sessions[dateStr] = {};
  }
  if (!sessions[dateStr][time]) {
    sessions[dateStr][time] = Array(maxSeats).fill(false);
  }
  const seats = sessions[dateStr][time];
  const rows = 5;
  const seatsPerRow = 5;
  for (let i = 1; i <= rows; i++) {
    const row = document.createElement("div");
    // row.textContent = 'row ' + i;
    row.classList.add("row");
    for (let j = 1; j <= seatsPerRow; j++) {
      const seatIndex = (i - 1) * seatsPerRow + j - 1;
      const seatNumber = seatIndex + 1;
      const reserved = seats[seatIndex];
      const button = document.createElement("button");
      button.textContent = "Seat " + seatNumber;
      button.disabled = reserved;
      button.addEventListener("click", () => {
        toggleSeat(dateStr, time, seatIndex, button);
      });
      row.appendChild(button);
    }
    seatsDiv.appendChild(row);
  }
}

function toggleSeat(dateStr, time, seatIndex, button) {
  sessions[dateStr][time][seatIndex] = !sessions[dateStr][time][seatIndex];
  button.textContent = sessions[dateStr][time][seatIndex]
    ? "Reserved"
    : "Available";
  button.disabled = sessions[dateStr][time][seatIndex];

  setCookie("sessions", JSON.stringify(sessions), maxDays);
}

function updateSelectedInfo(date, time, target) {
  const selectedInfoDiv = document.getElementById("selected-info");
  selectedInfoDiv.innerHTML = `Selected date: ${
    date.toISOString().split("T")[0]
  }, time: ${time}`;
  document.querySelectorAll(".sessions button").forEach((button) => {
    button.classList.remove("selected");
  });
  target.classList.add("selected");
}

function isDateValid(date) {
  const today = new Date();
  const selectedDate = new Date(date);
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const maxDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + maxDays
  );
  return selectedDate >= currentDate && selectedDate <= maxDate;
}

function getMaxBookingDate() {
  const today = new Date();
  const maxBookingDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + maxDays
  );
  const maxBookingDateFormat = maxBookingDate.toISOString().split("T")[0];
  return `${maxBookingDateFormat} ${sessionTimes[sessionTimes.length - 1]}`;
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    "; expires=" +
    expires +
    "; path=/";
}

function getCookie(name) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}
