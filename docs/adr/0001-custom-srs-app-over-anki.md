# Custom web SRS app instead of Anki

Anki is the obvious, battle-tested choice for spaced-repetition review, but it
doesn't natively support the session shape this project needs: three distinct
modes (Lesson/Review/Exam) with mode-specific behavior (Exam demotes on
failure and offers a one-off Burn on success), a user-settable Known flag that
reroutes an item to a weekend-only cadence, and kanji/grammar interleaved in
every session rather than studied as separate decks. Building this in Anki
would mean fighting its add-on model and card-type system for custom control
flow it wasn't designed for. We're building a small custom web app instead,
using a simple SRS algorithm (exact stage scheme TBD), trading Anki's maturity
and mobile app for direct control over session logic.
