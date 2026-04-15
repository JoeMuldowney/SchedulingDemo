
async function bookSlot(slotId) {
    try {
        const res = await fetch(`/book/${slotId}`, {
            method: "POST"
        });

        const data = await res.json();
        console.log("Booked!");

    } catch (err) {
        console.error("Booking failed:", err);
    }
}
document.addEventListener("DOMContentLoaded", () => {

    fetch("/appointments")
        .then(res => res.json())
        .then(data => {
            console.log("Slots:", data);

        });

});

document.addEventListener("DOMContentLoaded", () => {

    const popup = document.getElementById("popup");
    const title = document.getElementById("popup-title");

    document.querySelectorAll(".book-btn").forEach(btn => {
        btn.addEventListener("click", async () => {

            const className = btn.dataset.class;

            title.textContent = className;

            popup.style.display = "flex";

            await loadSlots(); // 👈 load backend data
        });
    });

});

let slotsData = [];
let dates = [];
let currentIndex = 0;

async function loadSlots() {

    const res = await fetch("/appointments");
    slotsData = await res.json();

    // extract unique dates
    dates = [...new Set(slotsData.map(s => s.date))];

    currentIndex = 0;

    renderDay();
}

let selectedSlot = null;

function renderDay() {

    const date = dates[currentIndex];

    document.getElementById("current-date").innerText = formatDate(date);

    const container = document.getElementById("time-slots");
    container.innerHTML = "";

    const daySlots = slotsData.filter(s => s.date === date);

    daySlots.forEach(slot => {

        const btn = document.createElement("button");
        btn.className = "time-btn";

        btn.textContent = `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`;

        btn.onclick = () => {

            selectedSlot = slot;

            document.getElementById("selected-slot").innerText =
                `Selected: ${formatDate(slot.date)} at ${formatTime(slot.start_time)}`;

            document.getElementById("confirm-btn").disabled = false;
        };

        container.appendChild(btn);
    });
}
function closePopup() {
    document.getElementById("popup").style.display = "none";
}

document.getElementById("prev-day").addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        renderDay();
    }
});

document.getElementById("next-day").addEventListener("click", () => {
    if (currentIndex < dates.length - 1) {
        currentIndex++;
        renderDay();
    }
});

document.getElementById("confirm-btn").addEventListener("click", () => {

    if (!selectedSlot) return;
    bookSlot(selectedSlot.id);
    // hide booking UI
    document.querySelector(".popup-nav").style.display = "none";
    document.getElementById("time-slots").style.display = "none";
    document.querySelector(".popup-footer").style.display = "none";

    // show success message
    document.getElementById("success-message").style.display = "block";

    // optional: auto close after 2 seconds
    setTimeout(() => {
        closePopup();
        resetPopup();
    }, 2000);
});

function resetPopup() {

    document.querySelector(".popup-nav").style.display = "flex";
    document.getElementById("time-slots").style.display = "block";
    document.querySelector(".popup-footer").style.display = "flex";

    document.getElementById("success-message").style.display = "none";

    selectedSlot = null;
}

const words = ["Strength", "Flexibility", "Mindfulness"];
let index = 0;


// changing word animation
const el = document.getElementById("changing-word");

function changeWord() {
  el.classList.remove("show");
  el.classList.add("fade");

  setTimeout(() => {
    index = (index + 1) % words.length;
    el.textContent = words[index];

    el.classList.remove("fade");
    el.classList.add("show");
  }, 500);
}

// start visible
el.classList.add("show");

setInterval(changeWord, 2500);


// close sidebar
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", closeSidebar);
  });
});

// date format
function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

// time format
function formatTime(timeString) {
    const [hour, minute] = timeString.split(":");

    const date = new Date();
    date.setHours(hour, minute);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}