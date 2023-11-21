import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { createNewEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function NewEvent() {
  const navigate = useNavigate();

  // mutationKey is not needed, because we dont cache the POST req
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    // wait for req to finish
    onSuccess: () => {
      // after success req, the NewEventSection 'events' query will not be reexecuted until swithing tabs. But we can invalidate that query and hence trigger new req
      queryClient.invalidateQueries({ queryKey: ["events"] }); // marks as stale and refetches. All querys that include ['events'] if not 'exact: true '. Best practise to iclude all queries that depend on events data

      navigate("/events");
    },
  });

  function handleSubmit(formData) {
    mutate({ event: formData }); // mutate calls a mutationFn, so when we register we dont need to call it to pass args, we call it with 'mutate'
    // cannot navigate away here, because no matter if req success or fail, it would leave current page
    //navigate('/events')
  }

  return (
    <Modal onClose={() => navigate("../")}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && "Submitting..."}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title="Failed to create event"
          message={error.info?.message || "Try again later!"}
        />
      )}
    </Modal>
  );
}
