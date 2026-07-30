export function Header() {
  return (
    <header className="flex flex-col items-center gap-9 p-8 bg-black text-white">
      <div className="flex w-full justify-between items-center align-middle gap-3">
        <h1>
          <span className="text-4xl font-semibold  dark:text-gray-100">
            <a href="/">App1</a>
          </span>
        </h1>
        <ul className="flex flex-row gap-4 items-center justify-center font-normal">
            <li>
                <a href="/events" className="">Events</a>
            </li>
            <li>
                <a href="/create-event">Create Event</a>
            </li>
            <li>
              <a href="/scanner">Scanner</a>
            </li>
            <li>
                <a href="/sign-in">Sign in</a>
            </li>
        </ul>
      </div>
    </header>
  );
}

