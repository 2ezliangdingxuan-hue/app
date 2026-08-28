import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("events", "routes/events.tsx"),
    route("createEvent", "routes/createEvents.tsx"),
    route("scanner", "routes/scanner.tsx"),
    route("view/:eventId", "routes/viewEvent.tsx"),
    route("rsvp/:eventId/:guestId", "routes/rsvpResponse.tsx"),
    //route("scanner/:eventId", "routes/scanner.tsx"),
    route("sign-in", "routes/sign-in.tsx"),
    route("sign-up", "routes/sign-up.tsx"),
    route("page", "routes/page.tsx"),
    route("form/:eventId", "routes/form.tsx"),
    route("events/:eventId", "routes/event.tsx",[
        index("events/eventDetails.tsx"),
        route("invite", "events/invite.tsx"),
        route("guestList", "events/guestList.tsx"),
        route("activities", "events/activities.tsx"),
        route("gifts", "events/gifts.tsx"),
        route("ratings", "events/ratings.tsx"),
        route("edit", "events/edit.tsx"),
        route("rsvp", "events/rsvp.tsx"),
        route("collaborators", "events/collaborators.tsx")
    ]),
] satisfies RouteConfig;
