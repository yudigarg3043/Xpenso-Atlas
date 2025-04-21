const form = document.querySelector("form");
const toggleBtn = document.getElementById("toggle-mode");
const inputs = document.querySelectorAll("input");
const textareas = document.querySelectorAll("textarea");
const allFields = [...inputs, ...textareas];
const illustrationImg = document.querySelector(".illustration img");

const lightImage = "https://media.istockphoto.com/id/1241789584/vector/customer-service-online-assistant-or-call-center-concept-woman-operator-with-headset.jpg?s=612x612&w=0&k=20&c=KeJInv0bQHil6JpXazAmhYKB-5HYfDpxvrsZxl2AMt8=";
const darkImage = "https://sdmntprwestus.oaiusercontent.com/files/00000000-a688-6230-8bcb-5acce1d5539a/raw?se=2025-04-21T13%3A22%3A46Z&sp=r&sv=2024-08-04&sr=b&scid=cf9c3dea-188f-5e23-a264-cd1627f11df6&skoid=e872f19f-7b7f-4feb-9998-20052dec61d6&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-04-20T16%3A33%3A40Z&ske=2025-04-21T16%3A33%3A40Z&sks=b&skv=2024-08-04&sig=kEA2G6LUKZDT3aeYpmel98WL3GUqME2JQ1GpcYR5lgU%3D";

const updateIllustration = (isDark) => {
    illustrationImg.src = isDark ? darkImage : lightImage;
};

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
    const isDark = savedTheme === "dark";

    if (isDark) {
        document.body.classList.add("dark");
        toggleBtn.textContent = "☀️";
    } else {
        toggleBtn.textContent = "🌙";
    }

    updateIllustration(isDark);
});

toggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");

    toggleBtn.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateIllustration(isDark);
});

document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateForm(form)) return;

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const contactDetails = document.getElementById('contactDetails').value;
    const message = document.getElementById('message').value;

    const contactData = { name, email, contactDetails, message };

    try {
        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });

        const result = await res.json();

        if (res.status === 201) {
            alert('Message sent successfully!');
            document.getElementById('contactForm').reset();
        } else {
            alert(result.message || 'Failed to send message.');
        }
    } catch (err) {
        console.error('Error:', err);
        alert('An error occurred while sending the message.');
    }
});