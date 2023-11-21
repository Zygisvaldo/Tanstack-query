import { Link, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { updateEvent, fetchEvent, queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();

  const params = useParams();
  const eventId = params.id;

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", eventId], // because its the same query with the same key as in eventsDetails page, it is cached and reused
    queryFn: ({ signal }) => fetchEvent({ id: eventId, signal }),
  });

  const { mutate } = useMutation({
    mutationKey: ["events", eventId],
    mutationFn: updateEvent,
    // onMutate will be executed before mutationFn
    // onMutate(data) => data is passed by mutationFn mutate({ id: eventId, event: formData });
    onMutate: async (data) => {
      const newEvent = data.event;
      // First MUST cancel current req for given queryKey, to avoid clashing. Only cancels queries not mutations!
      await queryClient.cancelQueries({ queryKey: ["events", eventId] });
      // to get old data so we can rollback if error on updating
      const prevEvent = queryClient.getQueryData(["events", eventId]);
      // Manipulating cached data behind the scene without waiting for a response (optimistinc upd)
      queryClient.setQueryData(["events", eventId], newEvent);

      return { prevEvent }; // this obejct is the 'context' arg for 'onError'
    },
    // onError will be executed if mutationFn fails, rolling back
    onError: (error, data, context) => {
      queryClient.setQueryData(["events", eventId], context.prevEvent);
    },
    // onSettled will be called after mutation is done, no matter success or fail
    onSettled: () => {
      queryClient.invalidateQueries(["events", eventId]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id: eventId, event: formData });
    navigate("../"); // optimisting updating, navigating away before success
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Error occured!"
          message={error.info?.message || "Failed to load edit details!"}
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay!
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
