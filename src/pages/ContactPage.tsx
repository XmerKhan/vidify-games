import { useState } from 'react';
import { Mail, MessageSquare, CheckCircle2, Send } from 'lucide-react';
import { useSEO, SITE_ORIGIN, SITE_NAME } from '../lib/seo';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  useSEO({
    title: 'Contact Us | Vidify Games',
    description: 'Get in touch with the Vidify Games team. Send us your feedback, game ideas, or questions through our contact form.',
    canonicalPath: '/contact',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: `Contact Us | ${SITE_NAME}`,
      url: `${SITE_ORIGIN}/contact`,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_ORIGIN },
    },
  });

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Please enter your name';
    if (!form.email.trim()) errs.email = 'Please enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email';
    if (!form.message.trim()) errs.message = 'Please enter a message';
    else if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="container-content py-10 max-w-2xl">
      <nav className="flex items-center gap-2 text-sm text-ink-400 mb-6">
        <Link to="/" className="hover:text-ink-700">Home</Link>
        <span>/</span>
        <span className="text-ink-600">Contact</span>
      </nav>

      <h1 className="font-display font-extrabold text-3xl text-ink-900 mb-2">Contact Us</h1>
      <p className="text-ink-500 mb-8">
        Have a game idea, found a bug, or just want to say hello? We would love to hear from you.
      </p>

      {submitted ? (
        <div className="card p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-brand-600 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-ink-900 mb-2">Message Sent!</h2>
          <p className="text-sm text-ink-500 mb-6">
            Thanks for reaching out, {form.name}. We will get back to you at {form.email} as soon as we can.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ name: '', email: '', message: '' });
            }}
            className="btn-secondary"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="Your name"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="input min-h-[120px] resize-y"
              placeholder="Tell us what is on your mind..."
            />
            {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
          </div>
          <button type="submit" className="btn-primary w-full">
            <Send className="h-4 w-4" />
            Send Message
          </button>
        </form>
      )}

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <Mail className="h-5 w-5 text-brand-600 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Email</h3>
            <a href="mailto:hello@vidifygames.com" className="text-sm text-ink-500 hover:text-brand-700">hello@vidifygames.com</a>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-brand-600 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Feedback</h3>
            <p className="text-sm text-ink-500">Use the form above for any inquiry</p>
          </div>
        </div>
      </div>
    </div>
  );
}
