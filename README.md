# API & UI Test Automation Suite

*Keith Florence Martin*

This is a focused test automation suite covering a public web UI (Swag Labs) and a public REST API (restful-api.dev), built with Playwright and TypeScript. I've split the tests across two layers: API tests handle data operations, UI tests cover the end-to-end user journey.

## Structure

```
tests/
  api/    → CRUD + negative cases against restful-api.dev
  ui/     → end-to-end checkout flow + an unhappy path against Swag Labs
```

## Tools: Playwright + TypeScript

I picked Playwright with TypeScript for this task. I chose it based on both what the task asks for and the kind of work the role involves, and Playwright stood out for the following reasons:

- The task asks for both a UI suite and an API suite, and Playwright can test both in one framework. Some things are better checked by going through the website, and others by calling the API directly, and Playwright lets me do both without adding a second tool.
- The role works on a JavaScript/TypeScript stack, so using TypeScript here keeps the tests in the same language the role uses.
- Playwright is designed to wait for elements to be ready before clicking or typing, which helps reduce flaky failures.

Selenium is the other well-known option, but since the role centers on TypeScript and I wanted one tool covering both the UI and the API, Playwright was the best choice for me.

## What I tested at the UI layer vs the API layer

I split the tests based on what each layer is best at checking.

**API layer (restful-api.dev):** I put the CRUD operations here - create, read, update, and delete, plus negative cases. These are data operations, and testing them directly against the API is faster and more stable than doing it through a browser. Each operation is its own test, so if one breaks, I know exactly which one, and they can run in any order.

**UI layer (Swag Labs):** I tested the checkout as one full flow - log in, add an item, check out, and confirm the order. A checkout makes sense as a complete journey, since each step depends on the one before it, so I kept it as a single end-to-end test rather than splitting it up. I kept this at the UI level because it catches things the API can't - like whether the buttons work, the pages load, and the form actually accepts input. I also added an unhappy path, where a locked-out user is correctly stopped from logging in.

The two layers answer different questions: the API tests check that the logic works, and the UI tests check that a real user can reach and use that logic through the interface. That's also why I didn't put the CRUD tests through the UI - the API already checks that, and doing it through the browser would just be slower and more fragile.

## How to install and run

**Prerequisites:** Node.js (v18 or newer) and Git

1. Clone the repository and move into the folder:
```
git clone https://github.com/kfcmartin/qa-test_automation_suite.git
cd qa-executive-assist-co
```
2. Install dependencies:
```
npm install
```
3. Install the Playwright browser (Chromium). This step is separate from `npm install`. Playwright needs its own browser binary to run the UI tests, and `npm install` doesn't download it:
```
npx playwright install chromium
```

**Running the tests:**
```
npm test          # run the whole suite (API + UI)
npm run test:api  # run only the API tests
npm run test:ui   # run only the UI tests
npm run report    # open the HTML report from the last run
```

**Notes:**
- The UI tests run against Swag Labs (https://www.saucedemo.com) and the API tests against restful-api.dev, so an internet connection is required.
- The suite is scoped to Chromium. Testing here is about application behavior and API responses, not cross-browser rendering, so a single engine keeps runs fast and avoids extra setup on the reviewer's machine.
- restful-api.dev's public API has a daily request limit (50 requests per 24 hours). The API test setup creates objects, which uses several requests per run, so a burst of repeated runs can briefly hit that limit.

## What I'd add or change with more time

**API (restful-api.dev)**
- **PATCH (partial update) test.** The API supports it. I'd check that updating one field leaves the others intact.
- **Decouple the tests from the public API's rate limit.** The public tier caps at 50 requests per 24 hours, and the setup step creates an object per test, so runs add up quickly. I'd use an API key to raise the limit, or mock the API so the tests don't depend on a shared public quota.

**UI (Swag Labs)**
- **Extract the checkout steps into reusable functions (Page Object Model).** Right now the flow is written inline. Pulling steps like login into named helpers would make the tests cleaner and easier to reuse as they grow.
- **Add an unhappy-path test for empty-cart checkout.** While exploring I found checkout completes with an empty cart (a $0 order goes through). I would add a test asserting an empty cart can't reach checkout, which would flag that behavior.
- **Cover more of the special accounts.** Each models a different kind of bug - problem_user (a form field wired wrong), error_user (checkout won't complete), performance_glitch_user (slow load), visual_user (layout issues). I would add targeted tests for these.

## Where I used AI, what I accepted, and what I corrected

I'm more experienced with API testing than with UI automation, so I split my AI use along those lines. For the API tests, I relied more on my own knowledge and used AI mainly to speed up writing. For the UI tests, which use Playwright and browser automation that I'm newer to, I leaned on AI to explain concepts (like how Playwright waits for elements, and how its fixtures work) and to draft the test structure.

What I kept my hands on and verified myself:

- I inspected the actual pages in the browser to confirm the selectors, instead of trusting suggested ones.
- I checked the API directly in Postman before writing tests, to confirm the real responses and status codes rather than assuming them from documentation.
- I explored Swag Labs manually and found behaviors on my own, like checkout completing with an empty cart and the different broken test accounts.

What I corrected or rewrote:

- I caught a missing step in my UI test by reading the error output, and fixed the flow myself.
- I used AI to help draft parts of my writing, but rewrote wording that sounded generic, reused phrasing from the job description, or referred to tools I don't have experience with, so everything reflects what I actually did and how I'd say it.

Overall I used AI to move faster and to help me learn the parts that are newer to me, but I checked the important things against the real site and API myself, and made the testing decisions rather than just accepting suggestions.
