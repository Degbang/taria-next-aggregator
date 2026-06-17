"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { assessmentOptions } from "@/lib/taria/ui";
import { RecommendationsPanel } from "./RecommendationsPanel";

const DRAFT_KEY = "taria-next.assessment.draft";
const SESSION_KEY = "taria-next.assessment.session";

const initialForm = {
  employmentIncomeSituation: "",
  dependentCountRange: "",
  assetTypes: [],
  travelPattern: "",
  lateNightCommuteFrequency: "",
  mobilityMode: "",
  riskyActivityFrequency: "",
  belongingsCareLevel: "",
  expensePredictability: "",
  emergencyResponseCapacity: "",
  paymentPreference: "",
  insuranceBudgetPercentRange: "",
  insuranceExperience: "",
  insuranceConcern: "",
  choicePriority: "",
};

export function InsuranceAssessmentClient() {
  const [form, setForm] = useState(() => readStorage(DRAFT_KEY) || initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionState, setSessionState] = useState(() => {
    const savedSession = readStorage(SESSION_KEY);
    return {
      assessmentId: savedSession?.assessmentId || null,
      recommendations: savedSession?.recommendations || null,
    };
  });
  const assessmentId = sessionState.assessmentId;
  const recommendations = sessionState.recommendations;

  useEffect(() => {
    writeStorage(DRAFT_KEY, form);
  }, [form]);

  useEffect(() => {
    writeStorage(SESSION_KEY, sessionState);
  }, [sessionState]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.assetTypes.length === 0) {
      setError("Select at least one asset.");
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const assessmentResponse = await fetch("/api/v1/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const assessmentPayload = await assessmentResponse.json();
      if (!assessmentResponse.ok) {
        throw new Error(assessmentPayload.message || "We could not submit the assessment.");
      }

      setSessionState({ assessmentId: assessmentPayload.assessmentId, recommendations: null });
      const recommendationResult = await fetchRecommendations(assessmentPayload.assessmentId);
      setSessionState({
        assessmentId: assessmentPayload.assessmentId,
        recommendations: recommendationResult,
      });
    } catch (submitError) {
      setError(submitError.message || "We could not submit the assessment.");
    } finally {
      setLoading(false);
    }
  }

  async function retryRecommendations() {
    if (!assessmentId || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const recommendationResult = await fetchRecommendations(assessmentId);
      setSessionState((current) => ({
        ...current,
        recommendations: recommendationResult,
      }));
    } catch (retryError) {
      setError(retryError.message || "We could not generate recommendations.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleAsset(assetValue) {
    setForm((current) => {
      const nextAssets = current.assetTypes.includes(assetValue)
        ? current.assetTypes.filter((value) => value !== assetValue)
        : [...current.assetTypes, assetValue];

      const normalized =
        assetValue === "NONE_OF_THE_ABOVE" && !current.assetTypes.includes(assetValue)
          ? ["NONE_OF_THE_ABOVE"]
          : nextAssets.filter((value) => value !== "NONE_OF_THE_ABOVE" || nextAssets.length === 1);

      return { ...current, assetTypes: normalized };
    });
  }

  return (
    <section className="assessment-page">
      <div className="assessment-page__header">
        <div>
          <span className="assessment-page__tag">Insurance Risk Profiling</span>
          <h1>Tell us about the customer profile</h1>
          <p>Complete the insurance workflow and TARIA will return personalized recommendations.</p>
        </div>
        <Link className="btn btn--secondary assessment-page__switch" href="/farmer-risk/assessment">
          Go to Farmer Risk Profiling
        </Link>
      </div>

      <div className="assessment-page__grid">
        <div className="assessment-page__form">
          <form className="form-card" onSubmit={handleSubmit}>
            <div className="form-card__header">
              <h2>Tell us about you</h2>
              <p>Answer a few quick questions to personalize coverage options.</p>
            </div>

            <div className="form-grid">
              <SelectField
                label="Employment status"
                name="employmentIncomeSituation"
                value={form.employmentIncomeSituation}
                options={assessmentOptions.employmentOptions}
                onChange={updateField}
              />
              <SelectField
                label="Dependents"
                name="dependentCountRange"
                value={form.dependentCountRange}
                options={assessmentOptions.dependentOptions}
                onChange={updateField}
              />
              <SelectField
                label="Travel pattern"
                name="travelPattern"
                value={form.travelPattern}
                options={assessmentOptions.travelOptions}
                onChange={updateField}
              />
              <SelectField
                label="Late night commute"
                name="lateNightCommuteFrequency"
                value={form.lateNightCommuteFrequency}
                options={assessmentOptions.lateNightOptions}
                onChange={updateField}
              />
              <SelectField
                label="Mobility mode"
                name="mobilityMode"
                value={form.mobilityMode}
                options={assessmentOptions.mobilityOptions}
                onChange={updateField}
              />
              <SelectField
                label="Risky activities"
                name="riskyActivityFrequency"
                value={form.riskyActivityFrequency}
                options={assessmentOptions.riskyActivityOptions}
                onChange={updateField}
              />
              <SelectField
                label="Care for belongings"
                name="belongingsCareLevel"
                value={form.belongingsCareLevel}
                options={assessmentOptions.careOptions}
                onChange={updateField}
              />
              <SelectField
                label="Expense predictability"
                name="expensePredictability"
                value={form.expensePredictability}
                options={assessmentOptions.expenseOptions}
                onChange={updateField}
              />
              <SelectField
                label="Emergency response"
                name="emergencyResponseCapacity"
                value={form.emergencyResponseCapacity}
                options={assessmentOptions.emergencyOptions}
                onChange={updateField}
              />
              <SelectField
                label="Payment preference"
                name="paymentPreference"
                value={form.paymentPreference}
                options={assessmentOptions.paymentOptions}
                onChange={updateField}
              />
              <SelectField
                label="Insurance budget"
                name="insuranceBudgetPercentRange"
                value={form.insuranceBudgetPercentRange}
                options={assessmentOptions.budgetOptions}
                onChange={updateField}
              />
              <SelectField
                label="Insurance experience"
                name="insuranceExperience"
                value={form.insuranceExperience}
                options={assessmentOptions.experienceOptions}
                onChange={updateField}
              />
              <SelectField
                label="Primary concern"
                name="insuranceConcern"
                value={form.insuranceConcern}
                options={assessmentOptions.concernOptions}
                onChange={updateField}
              />
              <SelectField
                label="Choice priority"
                name="choicePriority"
                value={form.choicePriority}
                options={assessmentOptions.priorityOptions}
                onChange={updateField}
              />
            </div>

            <div className="field assets">
              <span>Assets to protect</span>
              <div className="checkbox-grid">
                {assessmentOptions.assetOptions.map((option) => (
                  <label className="check" key={option.value}>
                    <input
                      type="checkbox"
                      checked={form.assetTypes.includes(option.value)}
                      onChange={() => toggleAsset(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {error === "Select at least one asset." ? <small>{error}</small> : null}
            </div>

            <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
              {loading ? "Analyzing…" : "Get Recommendations"}
            </button>
          </form>
        </div>

        <div className="assessment-page__results">
          <RecommendationsPanel
            loading={loading}
            error={error === "Select at least one asset." ? null : error}
            response={recommendations}
            onRetry={retryRecommendations}
          />
        </div>
      </div>
    </section>
  );
}

function SelectField({ label, name, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(name, event.target.value)} required>
        <option value="" disabled>
          Select
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function readStorage(key) {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

async function fetchRecommendations(assessmentId) {
  const response = await fetch(`/api/v1/assessments/${assessmentId}/recommendations`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "We could not generate recommendations.");
  }

  return payload;
}
