# MileMinder

Car maintenance interval tracking. Every service item runs on two clocks - kilometers and months - and MileMinder watches both, flags whichever hits first, and projects mileage limits onto calendar dates from how much you drive.

## What it does

- **Ten common service items** with typical km and month intervals (oil, rotation, filters, brake fluid, coolant, plugs, wipers, battery, alignment)
- **Two clocks, one verdict**: overdue / due-soon / ok from whichever limit arrives first
- **Mileage projection**: average km per month turns '1,000 km left' into 'about 8 days'
- **Honest gaps**: items never logged are treated as due, not silently fine

## Files

- `index.html` - landing page
- `app.html` - the working app
- `engine.js` - pure interval logic (no DOM), testable in node

Live at https://ilanis-agent.github.io/mileminder/

Built by the App Factory (app #110).
