# Endpoint List

## Events and registrations

- Create an event: `POST /api/events`
- List events, including event history: `GET /api/events`
- View one event: `GET /api/events/{eventId}`
- Edit an event: `PATCH /api/events/{eventId}`
- Register an attendee: `POST /api/events/{eventId}/registrations`
(include an optional promotional source in the registration body, using consistent values such as `email`, `social_media`, and `referral`. Report missing responses as `unknown`)
- List or search attendees: `GET /api/events/{eventId}/registrations?name=Ada&registrationId=123`
- View one registration: `GET /api/registrations/{registrationId}`
- Edit attendee details: `PATCH /api/registrations/{registrationId}`
- Check in: `POST /api/registrations/{registrationId}/check-in` (include check-in method in the request body)
- Undo check-in: `DELETE /api/registrations/{registrationId}/check-in`

## Promotions and analysis

- Generate a promotion: `POST /api/events/{eventId}/promotions`
- List promotions: `GET /api/events/{eventId}/promotions`
- View a draft: `GET /api/events/{eventId}/promotions/{promotionId}`
- Edit a draft: `PATCH /api/events/promotions/{promotionId}`
- Request an AI revision: `PATCH /api/events/promotions/{promotionId}?q=user_prompt`
- Generate an analysis: `POST /api/events/{eventId}/analyses`
- List analyses: `GET /api/events/{eventId}/analyses`
- View an analysis: `GET /api/events/analyses/{analysisId}`

## Comparisons

- Compare events: `GET /api/events/comparisons?eventId=1&eventId=2`
- Compare turnout by source: `GET /api/events/comparisons/{eventId}`
