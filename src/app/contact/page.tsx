"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("sending");
    setErrorMsg("");

    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim() || null,
      email: email.trim() || null,
      category: category || null,
      message: message.trim(),
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("success");
    setName("");
    setEmail("");
    setCategory("");
    setMessage("");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-display font-semibold text-4xl text-gray-900 mb-4">
        Talk to us
      </h1>
      <p className="text-gray-700 font-sans leading-relaxed mb-8">
        Questions, partnership ideas, a correction on something we&rsquo;ve
        listed, or just general feedback — this is the place for it. If
        you&rsquo;re logging a petition, event, or legal matter to appear on
        the site, use the{" "}
        <a href="/contribute" className="underline">
          contribute page
        </a>{" "}
        instead.
      </p>

      {status === "success" ? (
        <div
          className="rounded-xl p-6 font-sans"
          style={{ backgroundColor: "#e6f1fb", color: "#0c447c" }}
        >
          <p className="font-medium">Thanks — that&rsquo;s been sent.</p>
          <p className="text-sm mt-1">We&rsquo;ll get back to you if you left an email.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
              Your name <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-sans"
            />
          </div>

          <div>
            <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
              Your email <span className="text-gray-400">(optional, if you want a reply)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-sans"
            />
          </div>

          <div>
            <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
              What's this about?
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-sans"
            >
              <option value="">— Select one —</option>
              <option value="general_inquiry">General inquiry</option>
              <option value="partnership">Partnership idea</option>
              <option value="correction">Correction to something listed</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-sans"
            />
          </div>

          {status === "error" && (
            <p className="text-sm font-sans" style={{ color: "#A83A2A" }}>
              Couldn&rsquo;t send that — {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-full px-6 py-3 text-white font-sans font-medium disabled:opacity-60"
            style={{ backgroundColor: "#df1278" }}
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
        </form>
      )}
    </div>
  );
}
