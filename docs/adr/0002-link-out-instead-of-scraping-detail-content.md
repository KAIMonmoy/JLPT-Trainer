# Link out to source sites instead of scraping full detail content

We considered scraping jlptbenkyo.com's detail pages (stroke order, word
examples, full example sentences) and WaniKani's mnemonics via its API, and
storing that content locally so items would be fully self-contained. Instead,
each item stores only the fields needed to drive SRS review (kanji: character
+ onyomi + kunyomi + short meaning; grammar: pattern + reading + short
meaning), plus constructed URLs to the jlptbenkyo.com detail page and, for
kanji, the WaniKani kanji page. The user clicks through for the rich content
(examples, mnemonics, stroke order) rather than having it rendered inline.
This was chosen for simplicity and to avoid reproducing WaniKani's mnemonic
text (gated behind login, not reliably scrapable) or duplicating jlptbenkyo's
detail content wholesale. The trade-off is an extra click per item and a
dependency on both sites staying up and keeping their URL patterns stable.

## Amendment: one example sentence per grammar point

Grammar items are tested via JLPT-style multiple choice (a real example
sentence with the pattern blanked out, plus distractor choices — see
`CONTEXT.md`'s Answer Format entry). That format needs an actual sentence
containing the pattern, which only exists on jlptbenkyo's grammar detail
pages. We scrape one example sentence per grammar point as a narrow,
justified exception to the link-out policy above — still not the full detail
page (definition, formation notes, remaining ~9 example sentences stay
link-out only).
