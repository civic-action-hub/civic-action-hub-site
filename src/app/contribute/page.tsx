export default function ContributePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-display font-semibold text-4xl text-gray-900 mb-4">
        Help build the picture
      </h1>
      <p className="text-gray-700 font-sans leading-relaxed mb-6">
        Civic Action Hub is built by people spotting petitions, events, and
        legal matters worth knowing about — in a newsletter, on social media,
        from a friend — and logging them here so others can find them too.
        Every campaign on this site started as someone&rsquo;s two-minute
        submission.
      </p>

      <a
        href="https://civic-hub-intake.pages.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-full px-6 py-3 text-white font-sans font-medium mb-8"
        style={{ backgroundColor: "#df1278" }}
      >
        Log something you found →
      </a>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="font-display font-semibold text-xl text-gray-900 mb-3">
          What happens after you submit
        </h2>
        <p className="text-gray-700 font-sans leading-relaxed mb-3">
          Nothing goes live automatically. Every submission sits in a review
          queue first — and before it&rsquo;s approved, the actual page you
          linked is checked against what you entered: is it really a
          petition or an event, which state does it apply to, is it virtual
          or in-person. Anything unclear gets flagged for a closer look
          rather than guessed at.
        </p>
        <p className="text-gray-700 font-sans leading-relaxed">
          Only once that&rsquo;s settled does it appear publicly. This is
          slower than auto-publishing everything, on purpose — the goal is a
          list you can actually trust, not just a big one.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-display font-semibold text-xl text-gray-900 mb-3">
          What&rsquo;s worth submitting
        </h2>
        <ul className="text-gray-700 font-sans leading-relaxed list-disc pl-5 space-y-1">
          <li>A real, currently-open petition with a working link</li>
          <li>A civic event — a rally, a community meeting, a hearing</li>
          <li>A legal matter worth tracking or following</li>
        </ul>
        <p className="text-gray-500 font-sans text-sm mt-4">
          General feedback about the site itself isn&rsquo;t a fit for this
          form —{" "}
          <a href="/contact" className="underline">
            talk to us
          </a>{" "}
          instead.
        </p>
      </div>
    </div>
  );
}
