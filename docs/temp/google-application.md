Use case description

We are Musiquiz, the owner of the Google Business Profile for <N> businesses in Google, mostly in France.

We are requesting access to the Business Profile APIs to display our own Google reviews on our website, musiquizlejeu.fr, and to manage our listing directly, to reply to customer reviews from our own tool.

Our team has the in-house development skills to build and maintain this integration ourselves, without relying on a third-party review platform.

We prefer a direct integration because our website is built with performance in mind. Third-party review widgets require loading additional JavaScript on every page, which affects page speed and our visitors’ privacy. With the API, reviews are fetched server-side and delivered as plain HTML, with no third-party scripts.

Regarding data handling and compliance:

Reviews are fetched from the API at request time. They are not stored in a database, and no copy is kept beyond a short-lived performance cache of a maximum of 24 hours, in line with the Content storage policy.

Review content is displayed as provided, with the required attribution and a link to our Business Profile on Google.

We follow French consumer law on online reviews (Article L111-7-2 of the Consumer Code). Any filtering on displayed reviews will be clearly disclosed to visitors, along with our real overall rating and total number of reviews.

Access is limited to our own places. The API project will not be shared with or used on behalf of third parties.

Expected usage is low: [one location, a few thousand requests per month / estimate].
