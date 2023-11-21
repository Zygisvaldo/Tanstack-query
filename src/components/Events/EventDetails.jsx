import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";

export default function EventDetails() {
  const navigate = useNavigate();
  const params = useParams();
  const eventId = params.id;

  const {
    data: eventDetails,
    isPending: eventDetailsPending,
    isError: eventDetailsError,
    error: eventError,
  } = useQuery({
    queryKey: ["events", eventId],
    queryFn: ({ signal }) => fetchEvent({ id: eventId, signal }),
  });

  const {
    isError: deleteEventError,
    error: deleteError,
    mutate,
  } = useMutation({
    mutationKey: ["eventDelete"],
    mutationFn: deleteEvent,
    onSuccess: () => {
      navigate("/events");
    },
  });

  function handleEventDelete() {
    // because event was deleted, trigger refetch
    queryClient.invalidateQueries({ queryKey: ["events"] });
    //window.alert("Do you really want to delete?");
    mutate({ id: eventId });
  }

  let content;

  if (eventDetailsPending) {
    content = (
      <div className="center">
        <LoadingIndicator />;
      </div>
    );
  }

  if (eventDetailsError) {
    content = (
      <ErrorBlock
        title="Error occured!"
        message={eventError.info?.message || "Failed to get event details!"}
      />
    );
  }

  if (deleteEventError) {
    content = (
      <ErrorBlock
        title="Error occured!"
        message={deleteError.info?.message || "Failed to get event details!"}
      />
    );
  }

  if (eventDetails) {
    const formatedDate = new Date(eventDetails.date).toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
    content = (
      <>
        <header>
          <h1>{eventDetails.title}</h1>
          <nav>
            <button onClick={handleEventDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img
            src={`http://localhost:3000/${eventDetails.image}`}
            alt={eventDetails.title}
          />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{eventDetails.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formatedDate} @ {eventDetails.time}
              </time>
            </div>
            <p id="event-details-description">{eventDetails.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
