## Supabase code components

This repo, currently being developed by Callum Boase, extends the basic plasmic starter repo (next.js bootstrapped with create-plasmic-app) by adding code components for interacting with Supabase via it's API.

My current plan is to try to use Supabase Auth without plasmic auth

I'm working on this on my own, and am open to collaborating with our devs.


This is a Next.js project bootstrapped with [`create-plasmic-app`](https://www.npmjs.com/package/create-plasmic-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open your browser to see the result.

You can start editing your project in Plasmic Studio. The page auto-updates as you edit the project.


## What this repo contains so far

* /components: contains
  * SupabaseAddRowProvider: a code component allowing ability to add a row to supabase (for standalone use to wrap an "add" form in, for example)
  * SupabaseProvider: a code component allowing CRUD to a supabase table and optimistic UI updates while waiting for data to save
  * SupabaseUserProvider: the component loaded as global context that exposes $ctx about logged in user, along with sign in and sign out methods that can be called from plasmic. Also adds global context settings so you can simulate a logged in user from studio (since the app runs in an iframe when viewing it in the studio, and didn't seem to be able to access cookies or localstorage as a result)
* /plasmic-init.ts: the initialisation to register those components in plasmic studio
* /types/supabase-js-filter-ops: a types file used in building SupabaseProvider. It helps meet Typescript requirements for the filtering functionality available when configuring an instance of SupabaseProvider in plasmic studio
* /utils: some helpers that allow the components to work.

## Demo of these code components in action
See video [here](https://drive.google.com/open?id=1CflwiJsyrdlkvtlgf1y-IzP7xlp1XjVP&usp=drive_fs)

## More info coming soon.....

## Want to collaborate?
contact me on the plasmic slack (@Callum Boase) or callum.boase@gmail.com
