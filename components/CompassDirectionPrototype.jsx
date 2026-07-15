import { useMemo, useState } from "react";
import { buildCompassPlan } from "../lib/compassEngine.js";
import { DEMO_PROFILE } from "../data/demoProfile.js";
import "../styles/compass-direction.css";

const emptyProfile = {
  name: "",
  age: "",
  country: "",
  interests: "",
  favouriteSubjects: "",
  activities: "",
  strengths: "",
  certificates: "",
  projects: "",
  englishLevel: "",
  dream: "",
  uncertainty: "",
  budget: "",
};

export default function CompassDirectionPrototype() {
  const [profile, setProfile] = useState(emptyProfile);
  const [submitted, setSubmitted] = useState(false);
  const [buddyQuestion, setBuddyQuestion] = useState("");
  const [buddyAnswer, setBuddyAnswer] = useState("");
  const [buddyLoading, setBuddyLoading] = useState(false);

  const plan = useMemo(() => buildCompassPlan(profile), [profile]);

  const update = (key, value) => setProfile((current) => ({ ...current, [key]: value }));

  const loadDemo = () => {
    setProfile(DEMO_PROFILE);
    setSubmitted(true);
  };

  const askBuddy = async () => {
    if (!buddyQuestion.trim()) return;
    setBuddyLoading(true);
    setBuddyAnswer("");
    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: buddyQuestion, profile, context: plan }),
      });
      const data = await response.json();
      setBuddyAnswer(data.text || "Compass Buddy could not answer right now.");
    } catch {
      setBuddyAnswer("Compass Buddy is temporarily unavailable. Continue with one small experiment and record what you learn.");
    } finally {
      setBuddyLoading(false);
    }
  };

  return (
    <main className="direction-app">
      <section className="direction-hero">
        <div>
          <span className="eyebrow">COMPASS DIRECTION SYSTEM</span>
          <h1>Build your direction before choosing your destination.</h1>
          <p>Understand yourself, explore possible futures, test them in real life, and build evidence over time.</p>
        </div>
        <button className="direction-secondary" onClick={loadDemo}>Load Samira demo</button>
      </section>

      <section className="direction-panel">
        <div className="direction-panel-heading">
          <span>01</span>
          <div><h2>My Mind</h2><p>Compass does not decide your future from one quiz.</p></div>
        </div>
        <div className="direction-form-grid">
          {[
            ["name", "Name"], ["age", "Age"], ["country", "Country"],
            ["interests", "Current interests"], ["favouriteSubjects", "Favourite subjects"],
            ["strengths", "Strengths"], ["activities", "Activities you have actually done"],
            ["certificates", "Certificates or learning"], ["projects", "Projects and applied evidence"],
            ["englishLevel", "English level"], ["dream", "Current dream or possible direction"],
            ["uncertainty", "What are you most unsure about?"], ["budget", "What has your family discussed about future costs?"],
          ].map(([key, label]) => (
            <label key={key} className={key === "activities" || key === "projects" || key === "dream" || key === "uncertainty" ? "wide" : ""}>
              <span>{label}</span>
              <textarea
                rows={key === "name" || key === "age" || key === "country" || key === "englishLevel" ? 1 : 3}
                value={profile[key]}
                onChange={(event) => update(key, event.target.value)}
              />
            </label>
          ))}
        </div>
        <button className="direction-primary" onClick={() => setSubmitted(true)}>Build my direction</button>
      </section>

      {submitted && (
        <>
          <section className="direction-panel">
            <div className="direction-panel-heading"><span>02</span><div><h2>My Possible Futures</h2><p>Exploration options, not permanent labels.</p></div></div>
            <div className="future-grid">
              {plan.possibleFutures.map((future) => (
                <article className="future-card" key={future.id}>
                  <div className="status-chip">{future.stage}</div>
                  <h3>{future.title}</h3>
                  <p>{future.whyItMayFit}</p>
                  <h4>Evidence</h4>
                  <ul>{future.supportingEvidence.map((item) => <li key={item}>{item}</li>)}</ul>
                  <h4>Still uncertain</h4>
                  <ul>{future.missingEvidence.map((item) => <li key={item}>{item}</li>)}</ul>
                  <h4>Possible degrees</h4>
                  <p>{future.degreeOptions.join(" · ")}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="direction-panel">
            <div className="direction-panel-heading"><span>03</span><div><h2>My Experiments</h2><p>Test a future before committing to it.</p></div></div>
            <div className="experiment-grid">
              {plan.experiments.map((experiment) => (
                <article className="experiment-card" key={experiment.id}>
                  <small>{experiment.estimatedTime}</small>
                  <h3>{experiment.title}</h3>
                  <p>{experiment.purpose}</p>
                  <ol>{experiment.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                  <strong>Reflection</strong>
                  <p>{experiment.reflection[0]}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="direction-split">
            <article className="direction-panel">
              <div className="direction-panel-heading"><span>04</span><div><h2>My Dream Path</h2><p>No acceptance percentage. Only transparent preparation.</p></div></div>
              <h3>{plan.dreamPath.destination}</h3>
              <div className="readiness-list">
                {plan.dreamPath.currentPosition.map((item) => (
                  <div key={item.label}><span>{item.label}</span><strong>{item.status}</strong></div>
                ))}
              </div>
            </article>

            <article className="direction-panel">
              <div className="direction-panel-heading"><span>05</span><div><h2>This Week</h2><p>Advice becomes action.</p></div></div>
              <div className="action-list">
                {plan.weeklyPlan.map((action) => (
                  <label key={action.id}><input type="checkbox" /> <span>{action.title}</span></label>
                ))}
              </div>
            </article>
          </section>

          <section className="direction-split">
            <article className="direction-panel">
              <div className="direction-panel-heading"><span>06</span><div><h2>Parent View</h2><p>Support, not surveillance.</p></div></div>
              <h3>{plan.parentSummary.headline}</h3>
              <p>{plan.parentSummary.summary}</p>
              <ul>{plan.parentSummary.discussionQuestions.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>

            <article className="direction-panel buddy-panel">
              <div className="direction-panel-heading"><span>07</span><div><h2>AI Buddy</h2><p>Specialised in this journey and aware of your profile.</p></div></div>
              <textarea value={buddyQuestion} onChange={(event) => setBuddyQuestion(event.target.value)} placeholder="What should I work on this week?" rows={4} />
              <button className="direction-primary" onClick={askBuddy} disabled={buddyLoading}>{buddyLoading ? "Thinking…" : "Ask Compass Buddy"}</button>
              {buddyAnswer && <div className="buddy-answer">{buddyAnswer}</div>}
            </article>
          </section>
        </>
      )}
    </main>
  );
}
