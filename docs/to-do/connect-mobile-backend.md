# Goal

- To connect the [sentinel-mobile] to supabase and [sentinel-api]
- Ensure that it uses the same backend as the [sentinel-web] in that way it shared the same connection and [mutation] that needed to the system since we are using a monorepo structure.
  For e.g:
  For authentication we need the
  @packages/hooks/src/query/auth

- After connnection, establish the [auth] pages as first goal
- Next, the classroom pages wherein, it should fetch the classroom assigned to the student similar on the [sentinel-web]

Take note:

- We just need to mirror the [sentinel-web] and [sentinel-mobile] in terms of

1. Functionality
2. Purpose
3. Features

Since it will just be the native app for sentinel-web / student
