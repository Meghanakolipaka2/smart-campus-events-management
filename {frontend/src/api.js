const handleLogin = async () => {
  try {
    console.log("Login triggered");

    const response = await fetch(
      "https://your-actual-backend-url.onrender.com/api/auth/login", // ✅ FIXED
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      }
    );

    const data = await response.json();
    console.log("Response:", data);

    if (response.ok) {
      alert("Login successful ✅");

      // Save token
      localStorage.setItem("token", data.token);

      // Redirect
      window.location.href = "/dashboard";
    } else {
      alert(data.message || "Login failed ❌");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Server error ❌");
  }
};