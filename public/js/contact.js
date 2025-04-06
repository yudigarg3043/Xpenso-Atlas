const form = document.querySelector("form");
const toggleBtn = document.getElementById("toggle-mode");
const inputs = document.querySelectorAll("input");
const textareas = document.querySelectorAll("textarea");
const allFields = [...inputs, ...textareas];

form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    alert("Message successfully sent");
    form.reset();
    setTimeout(() => {
        location.reload();
    }, 100);
});

const validateForm = (form) => {
    let valid = true;

    const name = form.querySelector(".name");
    const message = form.querySelector(".message");
    const email = form.querySelector(".email");

    if (name.value.trim() === "") {
        giveError(name, "Please enter your name");
        valid = false;
    }

    if (message.value.trim() === "") {
        giveError(message, "Please enter your message");
        valid = false;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.value.trim())) {
        giveError(email, "Please enter a valid email");
        valid = false;
    }

    return valid;
};

const giveError = (field, message) => {
    const parent = field.parentElement;
    parent.classList.add("error");

    const existingError = parent.querySelector(".err-msg");
    if (existingError) existingError.remove();

    const error = document.createElement("span");
    error.textContent = message;
    error.classList.add("err-msg");
    parent.appendChild(error);
};

const removeError = (field) => {
    const parent = field.parentElement;
    parent.classList.remove("error");

    const error = parent.querySelector(".err-msg");
    if (error) error.remove();
};

allFields.forEach((field) => {
    field.addEventListener("input", () => removeError(field));
});

window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        toggleBtn.textContent = "☀️";
    } else {
        toggleBtn.textContent = "🌙";
    }
});

toggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");

    toggleBtn.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
});
