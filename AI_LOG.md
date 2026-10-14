# AI Log

## Entry 1
- What I asked for: I asked Claude Code to scaffold my Haunted House Tours project with Vite and React, create a houses.json file with 6 houses, build HouseCard and HouseGrid components, add a scare-level dropdown filter with useState, and add a booking form that only renders.
- What it produced: A client folder with a Vite React app, houses.json, HouseCard and HouseGrid components, a working dropdown filter, a non-saving booking form, and a first commit.
- What I fixed or rejected: [write one real thing here, like a change you made or something you rejected. If nothing, write "Nothing needed fixing."]
- How I verified it:

## Entry 2
- What I asked for: I asked Claude Code to add routing with react-router-dom (Home, /houses, /book) and a Nav with Link tags, pass all house data to HouseCard through props, keep the scare-level filter, and add a "My Tour" list kept in useState in App with add and remove buttons, a "My Tour (N)" count in the nav, and a "No houses added yet" message when empty.
- What it produced: BrowserRouter in main.jsx; Nav, TourList, HomePage and HousesPage components; Routes in App.jsx; HouseCard now uses only props (name, scare, description, onAdd); tourList state in App updated with spread to add and filter to remove (no push); a live "My Tour (N)" count in the nav; comments on props and state; and a commit "routing, props, state".
- What I fixed or rejected:
- How I verified it:
