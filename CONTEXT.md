# JLPT Dojo

A personal study tool for JLPT kanji and grammar (N5 through N3), combining a
spaced-repetition review engine with content sourced from jlptbenkyo.com and
WaniKani.

## Language

**Item**:
A single unit of study content — one kanji or one grammar point. Items carry their
own SRS state independently.
_Avoid_: Card, entry (reserve "card" for the on-screen presentation of an item during a session)

**Level**:
The JLPT level an Item belongs to: N5, N4, or N3 (N2/N1 are not yet modeled).
The schedule works through one Level's items at a time, in order N5 → N4 → N3.
_Avoid_: Stage, tier (Stage is reserved for SRS Stage — a Level is a fixed
property of an Item, not a position it moves through)

**Introduced**:
An item that has been moved into the SRS pool for the first time, via a Lesson.
An Introduced item has SRS state (starting at Apprentice 1) even before any
Review has happened to it. The complement — an item with no SRS state yet — has
not been introduced, and its content has never been shown. Introduction happens
per Lesson Group, as soon as that group's own quiz completes — it is not held
back until the rest of the Batch finishes.
_Avoid_: Covered, started, seen

**SRS Stage**:
An item's position in the review-interval ladder: Apprentice 1 (4h) → Apprentice 2
(8h) → Apprentice 3 (1d) → Apprentice 4 (3d) → Guru 1 (1wk) → Guru 2 (2wk) →
Master (2wk, plateau — repeats indefinitely). A correct answer advances one
stage; there is no automatic exit past Master except a user-triggered Burn.
_Avoid_: Level, box (Leitner-box terminology doesn't apply here)

**Mature**:
An item at Guru 1 or higher. Mature items are eligible for Exam.
_Avoid_: Learned, ready

**Lesson**:
The study mode that introduces new items for the day, moving them into the SRS
pool for the first time. A Lesson's Batch is worked through one Lesson Group
at a time.
_Avoid_: New content, intro

**Lesson Group**:
A chunk of up to 4 items from a Lesson's Batch. Each item's full content is
shown once (kanji: character plus meaning and onyomi; grammar: the unblanked
example sentence plus pattern), then all items in the group are tested, before
the next group starts. The Batch's final group may hold fewer than 4 items as
a remainder. Scoped to Lesson only — Review and Exam still test one item at a
time with no content step.
_Avoid_: Chunk, batch (Batch already names the whole day's item set)

**Review**:
The study mode that presents items already in the SRS pool whose interval has
come due. A wrong answer drops the item back one SRS Stage.
_Avoid_: Practice, drill

**Exam**:
A study mode the user triggers on demand (not scheduled), presenting every
currently Mature item. A wrong answer resets the item fully to Apprentice 1
(a deliberate, self-triggered failure here is treated as a stronger signal
than a routine Review miss). A correct answer offers the option to Burn the
item.
_Avoid_: Test, quiz

**Answer Format**:
How an item is tested, fixed per item type across all three study modes
(Lesson/Review/Exam):
- **Kanji**: typed recall. The learner types the meaning and the onyomi
  reading for the shown character. Onyomi must match exactly; meaning passes
  at ~90% fuzzy match.
- **Grammar**: JLPT-style multiple choice, always — a real example sentence
  for the pattern with the pattern blanked out, plus 4 choices (the correct
  pattern and 3 hand-curated confusable distractors from known JLPT
  confusion pairs).
_Avoid_: Question type, card type

**Reveal**:
A button shown after answering any item that opens the item's source link
(jlptbenkyo.com, and for kanji also WaniKani) without blocking progress —
the learner can move to the next item immediately whether or not they pressed
it.
_Avoid_: Details, info panel

**Reference**:
An always-visible link to an item's source page (jlptbenkyo.com, and for
kanji also WaniKani) shown during a Lesson Group's content step, before any
answering has happened. Distinct from Reveal: not gated by an answer, and
not labeled with a verb — just the site name.
_Avoid_: Reveal (Reveal is specifically the post-answer quiz-phase link),
source link

**Burn**:
Permanently retiring an item from all future Lesson/Review/Exam pools. Offered
only as a choice in Exam mode on a correct answer, when the user judges the
item fully learned and no longer wants to see it. Never automatic.
_Avoid_: Archive, delete, mastered (mastered describes reaching Master stage; Burn is the action of exiting the system entirely)

**Known (flag)**:
A per-item flag the user sets to indicate prior mastery from outside this
system. Setting it inserts the item directly at Guru 1 (Mature), skipping
Lesson and the Apprentice grind. From there it behaves exactly like any other
item — normal Review inclusion, normal Exam eligibility, normal demotion on
a wrong answer.
_Avoid_: Mastered, skipped

**Interleaving**:
Kanji and grammar items are mixed within the same Lesson, Review, and Exam
session rather than studied as separate decks per content type. Within
Lesson specifically, this mixing goes down to Lesson Group granularity —
a Batch's items are proportionally interleaved by type before being split
into Lesson Groups, so no single Lesson Group (and no run of early or late
Lesson Groups) is all-kanji or all-grammar just because the Batch happened
to contain a long run of one type.
_Avoid_: Mixed mode, combined deck

**Name**:
A display label the user sets on first use of the app, shown as a greeting.
Purely cosmetic — no account, login, or sync is tied to it. Editable at any
time by tapping the greeting.
_Avoid_: Username (implies an account system), display name
