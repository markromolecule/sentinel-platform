# Issue & Goal

- I notice that you created different mutation & query for the calendar.

For e.g
@app/sentinel-support/src/hooks/mutations/calendar
@app/sentinel-support/src/hooks/query/calendar
@app/sentinel-web/src/hooks/query/calendar
@app/sentinel-core/src/hooks/mutations/calendar
@app/sentinel-core/src/hooks/query/calendar

You can just use the @packages/hooks/src/query and put the query and you can use the @packages/services/src/api for the api instead of separating them for each application; we can maximize the shared packages

@app/sentinel-support/src/data/api/calendar
