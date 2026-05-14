# Optimistic Locking Conflict Handling

Backend entities use `@Version`. Every normal update request must send the version that the user
originally loaded from the API. If another user has already saved a newer version, the backend
returns `409 Conflict` instead of overwriting data silently.

## Normal Update Flow

1. Frontend loads an entity, for example `GET /api/suppliers/10`.
2. Response contains `version`.
3. Frontend sends the same version in the update request:

```json
{
  "name": "Updated supplier",
  "email": "supplier@example.com",
  "phone": "+37060000000",
  "version": 0
}
```

4. If the DB still has `version = 0`, the update succeeds.
5. If the DB has a newer version, the backend returns `409 Conflict`.

## 409 Response Shape

```json
{
  "entityType": "Supplier",
  "entityId": 10,
  "submittedVersion": 0,
  "currentVersion": 1,
  "currentState": {
    "id": 10,
    "name": "Value currently in DB",
    "version": 1
  },
  "submittedState": {
    "name": "User submitted value",
    "version": 0
  },
  "message": "Supplier was modified by another user"
}
```

`currentState` is the fresh DB value. `submittedState` is what the user tried to save.

## Suggested Frontend Dialog

When a `409` is received, show a conflict dialog with:

- A warning that another user modified the same record.
- Current saved values from `currentState`.
- User's unsaved values from `submittedState`.
- Actions:
  - **Refresh and edit again**: replace the local form state with `currentState`, including
    `currentVersion`, then let the user apply their changes again and send the normal `PUT`.
  - **Compare manually**: show current and submitted values side by side; after the user merges,
    send normal `PUT` with `version = currentVersion`.
  - **Overwrite anyway**: send the same update payload to the force endpoint with
    `"forceOverwrite": true`.

## Force Overwrite Endpoints

Force overwrite ignores the submitted version and saves over the current DB state. The endpoint still
requires `forceOverwrite: true` so accidental calls are rejected.

- `PUT /api/suppliers/{id}/force`
- `PUT /api/contracts/{id}/force`
- `PUT /api/services/{id}/force`
- `PUT /api/contacts/{id}/force`

Example:

```json
{
  "name": "Overwrite supplier",
  "email": "supplier@example.com",
  "phone": "+37060000000",
  "version": 0,
  "forceOverwrite": true
}
```

Use force overwrite only after explicit user confirmation.
