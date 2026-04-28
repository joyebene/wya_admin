        let isRequesting = false;

        function setButtonLoading(button, state, text = "Loading...") {
            if (state) {
                button.disabled = true;
                button.dataset.originalText = button.innerText;
                button.innerText = text;
                button.classList.add("opacity-50", "cursor-not-allowed");
            } else {
                button.disabled = false;
                button.innerText = button.dataset.originalText;
                button.classList.remove("opacity-50", "cursor-not-allowed");
            }
        }

        document.addEventListener("DOMContentLoaded", () => {

            // =====================
            // LOAD PROFILE
            // =====================
            const loadProfile = async () => {
                try {
                    const admin = await api.get("/admin/me");

                    document.getElementById("admin-name").value = admin.name || "";
                    document.getElementById("admin-email").value = admin.email || "";
                    document.getElementById("admin-phone").value = admin.phone || "";

                } catch (err) {
                    console.error("Failed to load profile", err);
                }
            };

            // =====================
            // UPDATE PROFILE
            // =====================
            document.getElementById("save-profile-btn").addEventListener("click", async (e) => {
                const btn = e.target;

                if (isRequesting) return; //block double request
                isRequesting = true;

                setButtonLoading(btn, true, "Saving...");

                const name = document.getElementById("admin-name").value;
                const email = document.getElementById("admin-email").value;
                const phone = document.getElementById("admin-phone").value;

                if (!name || !email) {
                    return alert("Name and email are required");
                }

                try {
                    await api.put("/admin/me", {
                        name,
                        email,
                        phone,
                    });

                    alert("Profile updated");
                } catch (err) {
                    alert("Failed to update profile");
                } finally {
                    isRequesting = false;
                    setButtonLoading(btn, false);
                }
            });

            // =====================
            // CHANGE PASSWORD
            // =====================
            document.querySelectorAll(".card")[1]
                .querySelector("button")
                .addEventListener("click", async (e) => {
                    const btn = e.target;

                    if (isRequesting) return;
                    isRequesting = true;

                    const currentPassword = document.getElementById("current-password").value;
                    const newPassword = document.getElementById("new-password").value;
                    const confirmPassword = document.getElementById("confirm-password").value;

                    if (!currentPassword || !newPassword || !confirmPassword) {
                        return alert("All password fields are required");
                    }


                    if (newPassword !== confirmPassword) {
                        return alert("Passwords do not match");
                    }

                    setButtonLoading(btn, true, "Updating...");

                    try {
                        await api.put("/admin/change-password", {
                            currentPassword,
                            newPassword
                        });

                        alert("Password updated");
                    } catch (err) {
                        alert(err.message);
                    } finally {
                        isRequesting = false;
                        setButtonLoading(btn, false);
                    }
                });

            // =====================
            // CREATE ADMIN
            // =====================
            document.getElementById("create-admin-btn").addEventListener("click", async (e) => {

                const btn = e.target;

                if (isRequesting) return;
                isRequesting = true;



                const email = document.getElementById("new-admin-email").value;

                const password = document.getElementById("new-admin-password").value;

                if (!email || !password) {
                    return alert("Email and password fields are required");
                }

                setButtonLoading(btn, true, "Saving...");

                try {
                    await api.post("/admin/register", {
                        email,
                        password
                    });

                    alert("Admin created");
                } catch (err) {
                    alert("Failed to create admin");
                } finally {
                    isRequesting = false;
                    setButtonLoading(btn, false);
                }
            });

            // =====================
            // LOAD SETTINGS
            // =====================
            const loadSettings = async () => {
                try {
                    const settings = await api.get("/users/settings");


                    document.getElementById("site-title").value = settings.siteTitle || "";
                    document.getElementById("site-email").value = settings.contactEmail || "";
                    document.getElementById("site-phone").value = settings.phone || "";
                    document.getElementById("site-address").value = settings.address || "";

                } catch (err) {
                    console.error("Failed to load settings", err);
                }
            };

            // =====================
            // SAVE SETTINGS
            // =====================
            document.getElementById("save-settings-btn").addEventListener("click", async (e) => {
                const btn = e.target;

                if (isRequesting) return;
                isRequesting = true;


                const siteTitle = document.getElementById("site-title").value;
                const contactEmail = document.getElementById("site-email").value;

                if (!siteTitle || !contactEmail) {
                    return alert("Website title and email are required");
                }

                setButtonLoading(btn, true, "Saving...");


                try {
                    await api.put("/admin/settings", {
                        siteTitle,
                        contactEmail,
                        phone: document.getElementById("site-phone").value,
                        address: document.getElementById("site-address").value,
                    });

                    alert("Settings saved");
                } catch (err) {
                    console.error(err);
                    alert("Failed to save settings");
                } finally {
                    isRequesting = false;
                    setButtonLoading(btn, false);
                }
            });
            loadProfile();
            loadSettings();
        });
