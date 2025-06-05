// === Tab Switch Helper ===
function switchTab(tabId) {
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => tab.classList.remove("active"));
    contents.forEach(content => content.classList.add("hidden"));

    document.getElementById(tabId).classList.remove("hidden");
    document.querySelector(`.tab[onclick="switchTab('${tabId}')"]`).classList.add("active");
}

// === DOM Logic ===
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const saveBtn = document.getElementById("save-btn");

    const name = document.getElementById("name");
    const phone = document.getElementById("phone");
    const email = document.getElementById("email");
    const job = document.getElementById("job");
    const location = document.getElementById("location");

    const fields = [name, phone, email, job, location];

    // === Disable save button initially ===
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.classList.add("opacity-50", "cursor-not-allowed");
    }

    function validateField() {
        let isValid = true;

        // Name
        if (name.value.trim() === "") isValid = false;

        // Phone
        if (!/^\d{6,15}$/.test(phone.value.trim())) isValid = false;

        // Email
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) isValid = false;

        // Job
        if (job.value === "select") isValid = false;

        // Location
        if (location.value.trim() === "") isValid = false;

        // Toggle Save button
        if (saveBtn) {
            saveBtn.disabled = !isValid;
            if (isValid) {
                saveBtn.classList.remove("opacity-50", "cursor-not-allowed");
            } else {
                saveBtn.classList.add("opacity-50", "cursor-not-allowed");
            }
        }
    }

    // === Attach listeners to fields for real-time validation ===
    fields.forEach(field => {
        field.addEventListener("input", validateField);
        field.addEventListener("change", validateField);
    });

    // === Form Submission ===
    if (form && saveBtn) {
        saveBtn.addEventListener("click", function (e) {
            e.preventDefault();
            document.querySelectorAll(".error").forEach(err => err.textContent = "");
            let hasError = false;

            if (name.value.trim() === "") {
                document.getElementById("nameError").textContent = "Name is required";
                hasError = true;
            }

            if (!/^\d{6,15}$/.test(phone.value.trim())) {
                document.getElementById("phoneError").textContent = "Enter a valid phone number";
                hasError = true;
            }

            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) {
                document.getElementById("emailError").textContent = "Enter a valid email";
                hasError = true;
            }

            if (job.value === "select") {
                document.getElementById("jobError").textContent = "Please select a job";
                hasError = true;
            }

            if (location.value.trim() === "") {
                document.getElementById("locationError").textContent = "Location is required";
                hasError = true;
            }

            if (!hasError) {
                alert("Profile updated successfully!");
            }
        });
    }

    // === Appointment delete logic ===
    document.querySelectorAll(".delete-button").forEach(button => {
        button.addEventListener("click", function () {
            const appointment = this.closest(".appointment");
            if (appointment) {
                appointment.remove();
            }
        });
    });
});
