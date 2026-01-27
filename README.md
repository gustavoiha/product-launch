# product-launch

Manage waitlist and beta launches for a new product.

## Overview

The user-facing application lets founders log in, register a product, build a custom waitlist form, and publish a shareable URL for signups. It also includes a public waitlist page and an internal dashboard for reviewing submissions.

## Folder structure

`app/` contains the user-facing web application. It's where users create their product launches and manage their wishlists.
`management-app/` contains a web application for managers of this application. It's where developers with a manager permission can take action on the platform's usage.
`infrastructure/` contains the AWS CDK scripts to deploy the application on the AWS cloud.

## Getting started

1. `cd app`
2. `npm install`
3. `npm run dev`

## Verification

* `npm run test`
* `npm run typecheck`
* `npm run lint`
