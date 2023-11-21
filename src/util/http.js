import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export async function fetchEvents({ signal, searchTerm }) {
  console.log(searchTerm); // {queryKey: Array(1), meta: undefined} and actual input value. Its because react wraps queryFn with some data {}
  let url = "http://localhost:3000/events";

  if (searchTerm) {
    url += "?search=" + searchTerm;
  }
  // signal used by browser to abort fetch e.x. when leaving the page and fetch has not yet completed
  const response = await fetch(url, { signal });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the events");
    error.code = response.status;
    error.info = await response.json();
    throw error; // must be thrown so that useQuery could return {isError}
  }

  const { events } = await response.json();

  return events;
}

export async function createNewEvent(eventData) {
  console.log(eventData);
  let url = "http://localhost:3000/events";

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(eventData),
    headers: {
      "Content-Type": "Application/json",
    },
  });

  //console.log(response);

  if (!response.ok) {
    const error = new Error("An error creating event!");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { events } = await response.json();

  return events;
}

export async function fetchSelectableImages({ signal }) {
  const response = await fetch("http://localhost:3000/events/images", {
    signal,
  });

  if (!response.ok) {
    const error = new Error("Error fetching images!");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { images } = await response.json();
  return images;
}

export async function fetchEvent({ id, signal }) {
  const response = await fetch(`http://localhost:3000/events/${id}`, {
    signal,
  });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the event");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { event } = await response.json();

  return event;
}

export async function deleteEvent({ id }) {
  console.log(id);
  const response = await fetch(`http://localhost:3000/events/${id}`, {
    method: "DELETE",
  });

  console.log(response);

  if (!response.ok) {
    const error = new Error("An error occurred while deleting the event");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return response.json();
}
