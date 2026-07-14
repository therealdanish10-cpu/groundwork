'use client';

export default function ContactForm() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Phase 2: wire up real form submission here.
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Business name"
        required
        aria-label="Business name"
      />
      <input
        type="email"
        placeholder="Email"
        required
        aria-label="Email address"
      />
      <input
        type="text"
        placeholder="Trade (electrician, plumber, roofer…)"
        required
        aria-label="Your trade"
      />
      <textarea
        placeholder="Anything else we should know?"
        aria-label="Additional information"
      />
      <button type="submit" className="btn">Send</button>
    </form>
  );
}
