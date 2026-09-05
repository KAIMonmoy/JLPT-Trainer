# Adopt Tailwind CSS for styling

The app's original UI was hand-written semantic HTML with a small plain CSS file, sized for a
1126px desktop layout — usable on desktop but effectively unstyled and unusable on mobile, which
is now the primary device. A full mobile-first restyle touches every screen (Lesson, Review,
Exam, Known, Schedule) and the shared `Session` component, and the person doing the review
explicitly does not want to be involved in individual styling choices. We chose Tailwind CSS
over continuing with hand-written CSS so a consistent, mobile-first visual language (spacing,
typography, tap-target sizing, light/dark palettes) can be applied across all screens quickly and
uniformly, rather than hand-tuning CSS per component. The trade-off: reverting to plain CSS later
would mean rewriting styling across every component, since Tailwind utility classes replace the
previous stylesheet rather than layering on top of it.
