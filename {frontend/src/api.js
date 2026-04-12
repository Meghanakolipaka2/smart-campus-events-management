const API_URL = "https://smart-campus-events-management.onrender.com";

export const getEvents = async () => {
  const res = await fetch(`${BASE_URL}/events`);
  return res.json();
};

export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
};