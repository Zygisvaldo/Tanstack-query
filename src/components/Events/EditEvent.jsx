import {
  Link,
  redirect,
  useNavigate,
  useParams,
  useSubmit,
  useNavigation,
} from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { updateEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";

export default function EditEvent() {
  const { state } = useNavigation();
  const navigate = useNavigate();
  const submit = useSubmit(); // for router to programmatically submit the <Form>

  const params = useParams();
  const eventId = params.id;

  // Instead of 'useLoaderData()' its better to 'useQuery()' so that data is cached when loader is executed

  // will execute after loader, and loader is already fetching the latest data, so 'staleTime' is great option here:
  const { data, isError, error } = useQuery({
    queryKey: ["events", eventId], // because its the same query with the same key as in eventsDetails page, it is cached and reused
    queryFn: ({ signal }) => fetchEvent({ id: eventId, signal }),
    staleTime: 10000, // 10s 
  });

  /* const { mutate } = useMutation({
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
  }); */

  function handleSubmit(formData) {
    // mutate({ id: eventId, event: formData });
    // navigate("../"); // optimisting updating, navigating away before success
    // Alternative way with router, not useMutation:
    submit(formData, { method: "PUT" }); // only NON GET methods will trigger 'action' to execute!
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  // Could use react-router Error handling instead of react-query
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
        {state === "idle" && (
          <button type="submit" className="button">
            Update
          </button>
        )}
        {state === "submitting" && <LoadingIndicator />}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
// Combining react-router with react-query
// react-router will execeture 'loader' fnc before the comp renders
export function loader({ params }) {
  // fetchQuery({ takes the same config as useQuery})
  return queryClient.fetchQuery({
    // Must return so that loader gets assigned a Promise
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });
}
// will not be a scenario when 'isPending', because react executes jsx after 'loader' return
// action fnc will be triggered when <Form> elem is submitted
export async function actions({ request, params }) {
  const formData = await request.formData(); // built in method to get form input data. <input name='MUST_HAVE_A_NAME'/>
  const updateEventData = Object.fromEntries(formData); // simple key: value pair obj
  await updateEvent({ id: params.id, event: updateEventData });
  await queryClient.invalidateQueries(["events"]);
  return redirect("../");
}
