import { useQuery } from "@tanstack/react-query";

import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { fetchEvents } from "../../util/http.js";

export default function NewEventsSection() {
  // useQuery, will send http req, and return data, info about loading or errors
  const { data, isPending, isError, error } = useQuery({
    // [] array of values that React stores internaly, so that it sees when using similar array and can reuse data
    queryKey: ["events"], // must be set so that React can cache data
    // if no cutom data needs to be passed than queryFn can simply point at the funtion that will be executed
    queryFn: fetchEvents, // aqual http req code. It wants a fnc that return a Promise
    staleTime: 5000, // 5000ms before sending another req. Going to another page and comming back in 5s will trigger another http req
    gcTime: 30000, // garbage collection time, when to clean cache
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || "Failed to fetch events!"}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
