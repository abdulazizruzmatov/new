import { CAREER_PATHS } from "../data/careerPaths.js";
import { EXPERIMENTS } from "../data/experiments.js";

const normalise = (value) => String(value || "").toLowerCase().trim();
const words = (value) => normalise(value).split(/[^a-z0-9+]+/).filter(Boolean);

function pathScore(profile, path) {
  const text = [
    profile.interests,
    profile.favouriteSubjects,
    profile.activities,
    profile.strengths,
    profile.dream,
    profile.certificates,
  ].map(normalise).join(" ");

  const matchedSignals = path.signals.filter((signal) => text.includes(signal));
  const appliedEvidence = normalise(profile.projects).length > 20 || normalise(profile.activities).length > 30;
  const certificateEvidence = normalise(profile.certificates).length > 8;

  return {
    raw: matchedSignals.length * 2 + (appliedEvidence ? 2 : 0) + (certificateEvidence ? 1 : 0),
    matchedSignals,
    appliedEvidence,
    certificateEvidence,
  };
}

function directionStage(score) {
  if (score >= 8) return "Evidence-backed direction";
  if (score >= 4) return "Worth exploring";
  return "Early hypothesis";
}

function makeWhy(path, result) {
  if (!result.matchedSignals.length) {
    return "This is an exploration option, but Compass does not yet have enough evidence to treat it as a strong direction.";
  }
  return `Your profile mentions ${result.matchedSignals.slice(0, 3).join(", ")}. This supports exploration, but a practical experiment is still more valuable than a label.`;
}

function makeMissingEvidence(result) {
  const gaps = [];
  if (!result.appliedEvidence) gaps.push("No substantial applied project is recorded yet");
  if (!result.certificateEvidence) gaps.push("No relevant learning evidence is recorded yet");
  if (!result.matchedSignals.length) gaps.push("Your current answers contain little direct evidence for this path");
  return gaps.length ? gaps : ["Add measurable outcomes and reflection to strengthen the evidence"];
}

export function buildCompassPlan(profile) {
  const ranked = CAREER_PATHS
    .map((path) => ({ path, result: pathScore(profile, path) }))
    .sort((a, b) => b.result.raw - a.result.raw)
    .slice(0, 3);

  const possibleFutures = ranked.map(({ path, result }) => ({
    id: path.id,
    title: path.title,
    stage: directionStage(result.raw),
    whyItMayFit: makeWhy(path, result),
    supportingEvidence: result.matchedSignals.length
      ? result.matchedSignals.map((item) => `Profile signal: ${item}`)
      : ["Not enough evidence yet"],
    missingEvidence: makeMissingEvidence(result),
    degreeOptions: path.degreeOptions,
    workReality: path.reality,
    challenges: path.challenges,
    evidenceIdeas: path.evidenceIdeas,
  }));

  const experiments = ranked.slice(0, 2).map(({ path }) => {
    const experiment = EXPERIMENTS.find((item) => item.id === path.experimentId);
    return { ...experiment, status: "Not started" };
  });

  const priorities = [];
  if (!profile.englishLevel) priorities.push("Complete an English-level diagnostic");
  if (!profile.projects) priorities.push("Complete one practical career experiment");
  if (!profile.dream) priorities.push("Choose one possible future to explore for 30 days");
  if (profile.dream) priorities.push(`Research the real daily work behind: ${profile.dream}`);
  priorities.push("Record one reflection about what gave you energy this week");

  const dreamPath = {
    destination: profile.dream || "No dream path selected yet",
    currentPosition: [
      { label: "Self-understanding", status: profile.interests ? "Developing" : "Not started" },
      { label: "Academic preparation", status: profile.favouriteSubjects ? "Developing" : "Not enough information" },
      { label: "English preparation", status: profile.englishLevel ? `Current level recorded: ${profile.englishLevel}` : "Not started" },
      { label: "Practical evidence", status: profile.projects ? "Developing" : "Not started" },
      { label: "Financial preparation", status: profile.budget ? "Beginning" : "Not started" },
      { label: "University requirements", status: "Needs official verification" },
    ],
    next12Months: priorities.slice(0, 5),
  };

  const parentSummary = {
    headline: `${profile.name || "The student"} is still building evidence, not making a final career decision.`,
    summary: possibleFutures.length
      ? `Current exploration areas include ${possibleFutures.map((item) => item.title).join(", ")}. Compass recommends practical experiments before narrowing the direction.`
      : "More information is needed before suggesting exploration paths.",
    discussionQuestions: [
      "Which activity gave you the most energy this month?",
      "Which task did you avoid, and why?",
      "What would you like to test next?",
      "What support do you need from us?",
    ],
  };

  return {
    generatedAt: new Date().toISOString(),
    profileSummary: {
      name: profile.name || "Student",
      age: profile.age || null,
      currentInterests: words(profile.interests).slice(0, 8),
      mainUncertainty: profile.uncertainty || "Still exploring",
    },
    possibleFutures,
    experiments,
    dreamPath,
    weeklyPlan: priorities.slice(0, 4).map((title, index) => ({
      id: `action-${index + 1}`,
      title,
      status: "Not started",
    })),
    parentSummary,
    safetyNote: "Compass supports exploration and planning. It does not guarantee admissions, scholarships, visas, or career outcomes.",
  };
}
