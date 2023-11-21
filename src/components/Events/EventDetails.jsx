import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const eventId = params.id;

  const {
    data: eventDetails,
    isPending: eventDetailsPending,
    isError: isErrorEvent,
    error: eventError,
  } = useQuery({
    queryKey: ["events", eventId],
    queryFn: ({ signal }) => fetchEvent({ id: eventId, signal }),
  });

  const {
    isError: isErrorDeleting,
    error: deleteError,
    isPending: isPendingDeletion,
    mutate,
  } = useMutation({
    mutationKey: ["eventDelete"],
    mutationFn: deleteEvent,
    onSuccess: () => {
      setIsDeleting(false);
      navigate("/events");
    },
  });

  function handleEventDelete() {
    // because event was deleted, trigger refetch
    queryClient.invalidateQueries({
      queryKey: ["events"],
      refetchType: "none",
    }); // refetchType: 'none' => will not refetch existing queries until page is loaded again, so that right after deletion it would not try to fecth eventDetails again
    //window.alert("Do you really want to delete?");
    mutate({ id: eventId });
  }

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  let content;

  if (eventDetailsPending) {
    content = (
      <div className="center">
        <LoadingIndicator />;
      </div>
    );
  }

  if (isErrorEvent) {
    content = (
      <ErrorBlock
        title="Error occured!"
        message={eventError.info?.message || "Failed to get event details!"}
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
            <button onClick={handleStartDelete}>Delete</button>
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
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <div>
            <p>Are you sure?</p>
            <div className="form-actions">
              {isPendingDeletion && <p>Deleting... Please wait!</p>}
              {!isPendingDeletion && (
                <>
                  <button onClick={handleStopDelete} className="button-text">
                    Close
                  </button>
                  <button onClick={handleEventDelete} className="button">
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
          {isErrorDeleting && (
            <ErrorBlock
              title="Error deleting event!"
              message={deleteError.info?.message || "Failed to delete event!"}
            />
          )}
        </Modal>
      )}
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
