import { useIsFetching } from "@tanstack/react-query";

export default function Header({ children }) {
  // to find out if react-query is sending req anywhere in this app and show progress bar
  const fetching = useIsFetching(); // 0-> false, anyHigherNumber-> true
  return (
    <>
      <div id="main-header-loading">{fetching > 0 && <progress />}</div>
      <header id="main-header">
        <div id="header-title">
          <h1>React Events</h1>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
