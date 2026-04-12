import React, { useEffect } from "react";
import React, { useEffect, useState } from "react";
import { getEvents } from "./api";

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEvents().then((data) => {
      setEvents(data);
    });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎓 Smart Campus Events</h1>

      {events.length === 0 ? (
        <p>No events found</p>
      ) : (
        events.map((event) => (
          <div key={event.id} style={{
            border: "1px solid #ccc",
            padding: "10px",
            margin: "10px",
            borderRadius: "10px"
          }}>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>📍 {event.venue}</p>
            <p>📅 {event.date} | ⏰ {event.time}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;