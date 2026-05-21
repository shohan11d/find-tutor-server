const appEl = document.getElementById("app");
const spinner = document.getElementById("spinner");
const toastContainer = document.getElementById("toast-container");

const routes = {
  "/": {
    title: "Find Tutor • Home",
    render: renderHome,
  },
  "/tutors": {
    title: "Find Tutor • Tutors",
    render: renderTutors,
  },
  "/bookings": {
    title: "Find Tutor • Bookings",
    render: renderBookings,
  },
  "/create-tutor": {
    title: "Find Tutor • Add Tutor",
    render: renderCreateTutor,
  },
  "/create-booking": {
    title: "Find Tutor • Book Tutor",
    render: renderCreateBooking,
  },
};

function showSpinner(show) {
  spinner.classList.toggle("hidden", !show);
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

async function fetchJson(path, options = {}) {
  showSpinner(true);
  try {
    const response = await fetch(path, options);
    const body = await response.json().catch(() => null);
    showSpinner(false);

    if (!response.ok) {
      throw body || { message: response.statusText };
    }
    return body;
  } catch (error) {
    showSpinner(false);
    const message = error?.message || error?.error || "Network error. Please try again.";
    throw new Error(message);
  }
}

function updateActiveLink(path) {
  document.querySelectorAll("nav a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${path}`);
  });
}

function router() {
  const path = window.location.hash.slice(1) || "/";
  const route = routes[path] || {
    title: "Find Tutor • Page Not Found",
    render: renderNotFound,
  };
  document.title = route.title;
  updateActiveLink(path);
  route.render();
}

function renderHome() {
  appEl.innerHTML = `
    <section class="card">
      <h1>Welcome to Find Tutor</h1>
      <p>Use the navigation links to browse tutors, view bookings, and create new entries.</p>
      <div class="actions">
        <a class="button" href="#/tutors">Browse Tutors</a>
        <a class="button secondary" href="#/bookings">See Bookings</a>
      </div>
    </section>
    <section class="card">
      <h2>Helpful Features</h2>
      <ul>
        <li>Dynamic title updates on each route change.</li>
        <li>404 page for unknown routes.</li>
        <li>Loading spinner while API requests run.</li>
        <li>Toast notifications for every CRUD operation.</li>
      </ul>
    </section>
  `;
}

function renderNotFound() {
  appEl.innerHTML = `
    <section class="card">
      <h1>404 — Page Not Found</h1>
      <p>The route you requested does not exist. Try one of the links below.</p>
      <div class="actions">
        <a class="button" href="#/">Home</a>
        <a class="button secondary" href="#/tutors">Tutors</a>
      </div>
    </section>
  `;
}

function renderTutors() {
  appEl.innerHTML = `
    <section class="card">
      <div class="actions">
        <h1>Tutor Directory</h1>
        <button class="button" id="refresh-tutors">Refresh</button>
      </div>
      <div id="tutor-list"></div>
    </section>
  `;
  document.getElementById("refresh-tutors").addEventListener("click", loadTutors);
  loadTutors();
}

function renderBookings() {
  appEl.innerHTML = `
    <section class="card">
      <div class="actions">
        <h1>Bookings</h1>
        <button class="button" id="refresh-bookings">Refresh</button>
      </div>
      <div id="booking-list"></div>
    </section>
  `;
  document.getElementById("refresh-bookings").addEventListener("click", loadBookings);
  loadBookings();
}

function renderCreateTutor() {
  appEl.innerHTML = `
    <section class="card">
      <h1>Create a New Tutor</h1>
      <form id="create-tutor-form">
        <div class="field-group">
          <label class="label" for="name">Name</label>
          <input id="name" name="name" required placeholder="Tutor name" />
        </div>
        <div class="field-group">
          <label class="label" for="subject">Subject</label>
          <input id="subject" name="subject" required placeholder="Subject taught" />
        </div>
        <div class="field-group">
          <label class="label" for="rate">Hourly Rate</label>
          <input id="rate" name="rate" required type="number" min="1" placeholder="Rate in USD" />
        </div>
        <button class="button" type="submit">Save Tutor</button>
      </form>
    </section>
  `;
  document.getElementById("create-tutor-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = {
      name: event.target.name.value.trim(),
      subject: event.target.subject.value.trim(),
      rate: Number(event.target.rate.value),
    };
    try {
      const result = await fetchJson("/api/tutors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      showToast(result.message);
      window.location.hash = "#/tutors";
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

function renderCreateBooking() {
  appEl.innerHTML = `
    <section class="card">
      <h1>Create a New Booking</h1>
      <form id="create-booking-form">
        <div class="field-group">
          <label class="label" for="tutor">Tutor</label>
          <select id="tutor" name="tutor" required></select>
        </div>
        <div class="field-group">
          <label class="label" for="student">Student Name</label>
          <input id="student" name="student" required placeholder="Student name" />
        </div>
        <div class="field-group">
          <label class="label" for="time">Session Time</label>
          <input id="time" name="time" required placeholder="e.g. Monday 5pm" />
        </div>
        <button class="button" type="submit">Create Booking</button>
      </form>
    </section>
  `;

  loadTutorOptions();
  document.getElementById("create-booking-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = {
      tutorId: event.target.tutor.value,
      student: event.target.student.value.trim(),
      time: event.target.time.value.trim(),
    };
    try {
      const result = await fetchJson("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      showToast(result.message);
      window.location.hash = "#/bookings";
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

async function loadTutorOptions() {
  const select = document.getElementById("tutor");
  try {
    const response = await fetchJson("/api/tutors");
    select.innerHTML = response.data
      .map((tutor) => `<option value="${tutor._id}">${tutor.name} — ${tutor.subject}</option>`)
      .join("");
    if (!response.data.length) {
      select.innerHTML = "<option value=''>No tutors available</option>";
    }
  } catch (error) {
    showToast(error.message, "error");
    select.innerHTML = "<option value=''>Unable to load tutors</option>";
  }
}

async function loadTutors() {
  try {
    const response = await fetchJson("/api/tutors");
    const list = document.getElementById("tutor-list");
    list.innerHTML = response.data.length
      ? response.data
          .map(
            (tutor) => `
          <div class="card">
            <h2>${tutor.name}</h2>
            <p><strong>Subject:</strong> ${tutor.subject}</p>
            <p><strong>Rate:</strong> $${tutor.rate}/hr</p>
            <form data-tutor-id="${tutor._id}" class="update-tutor-form">
              <div class="field-group">
                <label class="label">Update Subject</label>
                <input name="subject" value="${tutor.subject}" />
              </div>
              <div class="field-group">
                <label class="label">Update Rate</label>
                <input name="rate" type="number" value="${tutor.rate}" />
              </div>
              <div class="actions">
                <button class="button" type="submit">Save</button>
                <button class="button secondary" type="button" data-delete="${tutor._id}">Delete</button>
              </div>
            </form>
          </div>
        `,
          )
          .join("")
      : `<div class="card"><p>No tutors found. Use “Add Tutor” to create one.</p></div>`;
    attachTutorActions();
  } catch (error) {
    showToast(error.message, "error");
    document.getElementById("tutor-list").innerHTML = `<div class="card"><p>Unable to load tutors.</p></div>`;
  }
}

function attachTutorActions() {
  document.querySelectorAll(".update-tutor-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const id = form.dataset.tutorId;
      const body = {
        subject: form.subject.value.trim(),
        rate: Number(form.rate.value),
      };
      try {
        const result = await fetchJson(`/api/tutors/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        showToast(result.message);
        loadTutors();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });

  document.querySelectorAll("button[data-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.delete;
      try {
        const result = await fetchJson(`/api/tutors/${id}`, {
          method: "DELETE",
        });
        showToast(result.message);
        loadTutors();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });
}

async function loadBookings() {
  try {
    const response = await fetchJson("/api/bookings");
    const list = document.getElementById("booking-list");
    list.innerHTML = response.data.length
      ? response.data
          .map(
            (booking) => `
          <div class="card">
            <h2>Booking for ${booking.student}</h2>
            <p><strong>Tutor ID:</strong> ${booking.tutorId}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
          </div>
        `,
          )
          .join("")
      : `<div class="card"><p>No bookings yet. Create one from the Book Tutor page.</p></div>`;
  } catch (error) {
    showToast(error.message, "error");
    document.getElementById("booking-list").innerHTML = `<div class="card"><p>Unable to load bookings.</p></div>`;
  }
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);
