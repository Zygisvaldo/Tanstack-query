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
