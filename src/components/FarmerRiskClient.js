"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  farmerFinalFormula,
  farmerInitialForm,
  farmerInsuranceCap,
  farmerLoanCap,
  farmerQuestionMap,
  farmerQuestionSteps,
  farmerResultPages,
} from "@/lib/taria/farmer-risk";

function readIntegrationContext() {
  if (typeof window === "undefined") {
    return {
      sourceApplication: "",
      externalFarmerId: "",
      farmId: "",
      loanApplicationId: "",
      returnOrigin: "",
      handoff: "",
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    sourceApplication: params.get("sourceApplication")?.trim() || "",
    externalFarmerId: params.get("externalFarmerId")?.trim() || "",
    farmId: params.get("farmId")?.trim() || "",
    loanApplicationId: params.get("loanApplicationId")?.trim() || "",
    returnOrigin: params.get("returnOrigin")?.trim() || "",
    handoff: params.get("handoff")?.trim() || "",
  };
}

export function FarmerRiskClient() {
  const [form, setForm] = useState(farmerInitialForm);
  const [touched, setTouched] = useState({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeResultPageIndex, setActiveResultPageIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [returnStatus, setReturnStatus] = useState("idle");
  const [integrationContext] = useState(readIntegrationContext);
  const { sourceApplication, externalFarmerId, farmId, loanApplicationId, returnOrigin, handoff } = integrationContext;
  const isAgrifinanceLaunch =
    sourceApplication.toLowerCase() === "agrifinance" && Boolean(returnOrigin);
  const shouldReturnToOpener = Boolean(
    isAgrifinanceLaunch && typeof window !== "undefined" && window.opener && !window.opener.closed
  );

  const currentStep = farmerQuestionSteps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === farmerQuestionSteps.length - 1;
  const progressPercent = ((currentStepIndex + 1) / farmerQuestionSteps.length) * 100;
  const activeResultPage = farmerResultPages[activeResultPageIndex];
  const canViewPreviousResultPage = activeResultPageIndex > 0;
  const canViewNextResultPage = activeResultPageIndex < farmerResultPages.length - 1;
  const totalQuestions = farmerQuestionSteps.reduce(
    (questionCount, step) => questionCount + step.questions.length,
    0
  );
  const currentStepStart =
    farmerQuestionSteps
      .slice(0, currentStepIndex)
      .reduce((questionCount, step) => questionCount + step.questions.length, 0) + 1;
  const currentStepEnd = currentStepStart + currentStep.questions.length - 1;

  useEffect(() => {
    if (!isAgrifinanceLaunch || !externalFarmerId || !farmId) {
      return;
    }

    let cancelled = false;
    const params = new URLSearchParams({ externalFarmerId, farmId, handoff });

    async function loadExistingAssessment() {
      setIsLoadingExisting(true);
      setSubmitError(null);

      try {
        const response = await fetch(`/api/v1/farmer-risk-assessments?${params.toString()}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || "We could not load the previous farmer assessment.");
        }

        const saved = payload.assessment;
        if (!saved || cancelled) {
          return;
        }

        setForm({ ...farmerInitialForm, ...(saved.answers || {}) });
        setResult({
          assessmentId: saved.assessmentId,
          submittedAt: saved.submittedAt,
          persisted: saved.persisted ?? true,
          context: saved.context || { sourceApplication, externalFarmerId, farmId, loanApplicationId },
          ...saved.result,
        });
        setActiveResultPageIndex(0);
        setCurrentStepIndex(0);
        setTouched({});
        setReturnStatus("idle");
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load the previous farmer risk assessment.", error);
          setSubmitError(error.message || "We could not load the previous farmer assessment.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingExisting(false);
        }
      }
    }

    loadExistingAssessment();

    return () => {
      cancelled = true;
    };
  }, [externalFarmerId, farmId, handoff, isAgrifinanceLaunch, loanApplicationId, sourceApplication]);

  function handleFieldChange(controlName, value) {
    setForm((current) => ({
      ...current,
      [controlName]: value,
    }));
  }

  function validateCurrentStep() {
    const nextTouched = {};
    let isValid = true;

    for (const question of currentStep.questions) {
      nextTouched[question.controlName] = true;
      const value = form[question.controlName];
      if (question.inputType === "number") {
        if (value === "" || value === null || Number(value) < 0 || Number.isNaN(Number(value))) {
          isValid = false;
        }
      } else if (!value) {
        isValid = false;
      }
    }

    setTouched((current) => ({ ...current, ...nextTouched }));
    return isValid;
  }

  async function calculateRisk(event) {
    event.preventDefault();

    const nextTouched = Object.fromEntries(
      Object.keys(farmerQuestionMap).map((controlName) => [controlName, true])
    );
    setTouched(nextTouched);
    setSubmitError(null);

    const hasInvalidAnswer = Object.entries(farmerQuestionMap).some(([controlName, question]) => {
      const value = form[controlName];
      if (question.inputType === "number") {
        return value === "" || value === null || Number(value) < 0 || Number.isNaN(Number(value));
      }
      return !value;
    });

    if (hasInvalidAnswer) {
      return;
    }

    setIsSaving(true);
    setReturnStatus("idle");

    try {
      const response = await fetch("/api/v1/farmer-risk-assessments", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          ...(sourceApplication ? { sourceApplication } : {}),
          ...(externalFarmerId ? { externalFarmerId } : {}),
          ...(farmId ? { farmId } : {}),
          ...(loanApplicationId ? { loanApplicationId } : {}),
        }),
        headers: {
          "Content-Type": "application/json",
          ...(handoff ? { "x-taria-handoff": handoff } : {}),
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "We could not save the farmer assessment.");
      }

      setResult({
        assessmentId: payload.assessmentId,
        submittedAt: payload.submittedAt,
        persisted: payload.persisted ?? true,
        context: payload.context || {
          sourceApplication,
          externalFarmerId,
          farmId,
          loanApplicationId,
        },
        ...payload.result,
      });
      setActiveResultPageIndex(0);
    } catch (error) {
      setSubmitError(error.message || "We could not save the farmer assessment.");
    } finally {
      setIsSaving(false);
    }
  }

  function getStepStatus(stepIndex) {
    if (stepIndex === currentStepIndex) {
      return "current";
    }
    if (stepIndex < currentStepIndex) {
      return "complete";
    }
    return "upcoming";
  }

  function returnToAgrifinance() {
    if (!isAgrifinanceLaunch || !isAllowedReturnOrigin(returnOrigin)) {
      return;
    }

    if (result && shouldReturnToOpener) {
      try {
        window.opener.postMessage(
          {
            type: "taria.farmerRisk.completed",
            assessment: {
              assessmentId: result.assessmentId,
              submittedAt: result.submittedAt,
              persisted: result.persisted,
              context: result.context,
              result: {
                score: result.score,
                rawScore: result.rawScore,
                riskLevel: result.riskLevel,
                loanRecommendationTier: result.loanRecommendationTier,
                loanAmount: result.loanAmount,
                insurancePremium: result.insurancePremium,
                insurancePackage: result.insurancePackage,
                sectionScores: result.sectionScores,
              },
            },
          },
          returnOrigin
        );
        setReturnStatus("sent");
      } catch (error) {
        console.error("Failed to return farmer risk result to opener.", error);
        setReturnStatus("failed");
        return;
      }
    }

    if (window.opener && !window.opener.closed) {
      window.opener.focus();
      window.close();
      return;
    }

    window.location.assign(returnOrigin);
  }

  return (
    <section className={`farmer-page${isAgrifinanceLaunch ? " farmer-page--integrated" : ""}`}>
      <div className="farmer-page__header">
        <div className="farmer-page__identity">
          <div className="farmer-page__eyebrow-row">
            <span className="farmer-page__tag">TARIA / FARM RISK ENGINE</span>
            <span className={`farmer-page__status-pill${result ? " is-saved" : ""}`}>
              {result ? "Assessment saved" : "Ready to assess"}
            </span>
          </div>
          <h1>Understand the farm before you fund it.</h1>
          <p>Update the farm profile, calculate its current risk, and return the saved decision to Agrifinance.</p>
          {sourceApplication ? (
            <div className="farmer-page__context" aria-label="Assessment context">
              <span><small>FARMER</small>{externalFarmerId || "—"}</span>
              <span><small>FARM</small>{farmId || "—"}</span>
              {loanApplicationId ? <span><small>LOAN</small>{loanApplicationId}</span> : null}
            </div>
          ) : null}
          {isLoadingExisting ? (
            <p className="farmer-page__loading-note">Loading the latest saved assessment for this farm…</p>
          ) : null}
        </div>
        <div className="farmer-page__header-actions">
          {isAgrifinanceLaunch ? (
            <button className="btn btn--secondary" type="button" onClick={returnToAgrifinance}>
              Return
            </button>
          ) : null}
          {!isAgrifinanceLaunch ? (
            <Link className="btn btn--secondary farmer-page__switch" href="/insurance/assessment">
              Go to Insurance Risk Profiling
            </Link>
          ) : null}
        </div>
      </div>

      <div className="farmer-page__grid">
        <form className="farmer-form" onSubmit={calculateRisk}>
          <div className="farmer-form__header">
            <div>
              <span className="farmer-form__kicker">01 / 05 · FARM PROFILE</span>
              <h2>Assessment inputs</h2>
              <p>Work through each domain. Your changes replace the saved assessment for this farm when you calculate.</p>
            </div>
            {result ? <span className="farmer-form__saved-badge">Editing saved profile</span> : null}
          </div>

          <div className="farmer-stepper">
            <div className="farmer-stepper__meta">
              <div>
                <span className="farmer-stepper__eyebrow">
                  Step {currentStep.stepNumber} of {farmerQuestionSteps.length}
                </span>
                <span className="farmer-stepper__domain">{currentStep.domainTitle}</span>
                <h3>{currentStep.areaTitle}</h3>
                <p>{currentStep.description}</p>
              </div>
            </div>

            <div className="farmer-stepper__progress" aria-hidden="true">
              <div className="farmer-stepper__progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="farmer-stepper__rail" aria-label="Questionnaire progress">
              {farmerQuestionSteps.map((step, stepIndex) => (
                <button
                  key={`${step.stepNumber}-${step.areaTitle}`}
                  className={`farmer-stepper__dot${getStepStatus(stepIndex) === "current" ? " is-current" : ""}${getStepStatus(stepIndex) === "complete" ? " is-complete" : ""}`}
                  type="button"
                  disabled
                >
                  {step.stepNumber}
                </button>
              ))}
            </div>
          </div>

          <section className="farmer-form__section">
            <div className="farmer-form__fields">
              {currentStep.questions.map((question) => {
                const showError = touched[question.controlName] && isQuestionInvalid(question, form[question.controlName]);

                return (
                  <label className="field" key={question.controlName}>
                    <span className="field__number">{question.number}</span>
                    <span className="field__question">
                      {question.number}. {question.label}
                    </span>
                    <small className="field__area">{currentStep.areaTitle}</small>

                    {question.inputType === "select" ? (
                      <select
                        value={form[question.controlName]}
                        onChange={(event) => handleFieldChange(question.controlName, event.target.value)}
                      >
                        <option value="" disabled>
                          Select an answer
                        </option>
                        {(question.options || []).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        inputMode="decimal"
                        min={question.min}
                        step={question.step}
                        placeholder={question.placeholder}
                        value={form[question.controlName]}
                        onChange={(event) => handleFieldChange(question.controlName, event.target.value)}
                      />
                    )}

                    {question.helpText ? <small className="field__hint">{question.helpText}</small> : null}
                    {showError ? (
                      <small className="field__error">Enter a valid answer to score this question.</small>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </section>

          <div className="farmer-form__actions farmer-form__actions--split">
            <button
              className="btn btn--secondary"
              type="button"
              onClick={() => setCurrentStepIndex((current) => Math.max(current - 1, 0))}
              disabled={isFirstStep}
            >
              Previous
            </button>

            <div className="farmer-form__actions-main">
              <span className="farmer-form__step-note">
                Questions {currentStepStart}-{currentStepEnd} of {totalQuestions}
              </span>

              {!isLastStep ? (
                <button
                  className="btn btn--primary"
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    if (validateCurrentStep()) {
                      setCurrentStepIndex((current) => Math.min(current + 1, farmerQuestionSteps.length - 1));
                    }
                  }}
                >
                  Next step
                </button>
              ) : (
                <button className="btn btn--primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving profile..." : "Calculate Farmer Risk"}
                </button>
              )}
            </div>
          </div>

          {submitError ? <p className="farmer-form__status farmer-form__status--error">{submitError}</p> : null}
        </form>

        <section className="farmer-results">
          <div className="farmer-results__header">
            <div>
              <span className="farmer-results__kicker">02 / DECISION</span>
              <h2>Risk output</h2>
            </div>
            <span className="farmer-results__live-dot">LIVE</span>
            <p>Saved score, lending guidance, and the protection package for this farm.</p>
          </div>

          {result ? (
            <>
              <div className="farmer-results__score">
                <div>
                    <span className="farmer-results__score-label">Farm risk score</span>
                  <strong>{result.score}/100</strong>
                </div>
                <span className="farmer-results__level">{result.riskLevel}</span>
              </div>

              <div className="farmer-results__pager">
                <div className="farmer-results__pager-meta">
                  <span className="farmer-results__pager-step">
                    Page {activeResultPageIndex + 1} of {farmerResultPages.length}
                  </span>
                  <h3>{activeResultPage.title}</h3>
                  <p>{activeResultPage.summary}</p>
                </div>
                <div className="farmer-results__pager-dots" aria-label="Result pages">
                  {farmerResultPages.map((page, pageIndex) => (
                    <button
                      key={page.key}
                      className={`farmer-results__pager-dot${pageIndex === activeResultPageIndex ? " is-active" : ""}`}
                      type="button"
                      onClick={() => setActiveResultPageIndex(pageIndex)}
                    />
                  ))}
                </div>
              </div>

              <div className="farmer-results__viewport">
                {activeResultPage.key === "overview" ? (
                  <section className="farmer-results__pane">
                    <div className="farmer-results__hero">
                      <article className="farmer-results__hero-card">
                        <span>Eligible loan amount</span>
                        <strong>GHS {result.loanAmount.toLocaleString()}</strong>
                        <small>Out of the capped GHS {farmerLoanCap.toLocaleString()} loan pool.</small>
                      </article>
                      <article className="farmer-results__hero-card farmer-results__hero-card--accent">
                        <span>Insurance premium</span>
                        <strong>GHS {result.insurancePremium.toLocaleString()}</strong>
                        <small>
                          Out of the capped GHS {farmerInsuranceCap.toLocaleString()} insurance contribution.
                        </small>
                      </article>
                    </div>

                    <div className="farmer-results__overview-note">
                      <h3>How to read this page</h3>
                      <p>
                        The final risk score places the farmer into a capped funding and premium bracket. Higher
                        scores unlock more loan value and a lower premium amount.
                      </p>
                      {result.context?.sourceApplication ? (
                        <p className="farmer-results__save-note">
                          Linked to {result.context.sourceApplication}
                          {result.context.externalFarmerId ? ` farmer ${result.context.externalFarmerId}` : ""}
                          {result.context.loanApplicationId ? ` / loan ${result.context.loanApplicationId}` : ""}.
                        </p>
                      ) : null}
                      <p className="farmer-results__save-note">
                        {result.persisted
                          ? `Saved assessment ID: ${result.assessmentId}`
                          : `Temporary result ID: ${result.assessmentId} (storage unavailable)`}
                      </p>
                      {isAgrifinanceLaunch ? (
                        <p className="farmer-results__save-note">
                          {returnStatus === "sent"
                            ? "Result returned to Agrifinance. Use the return button if this window remains open."
                            : returnStatus === "failed"
                              ? "Taria calculated the result, but sending it back to Agrifinance failed."
                            : "Review this result, then click Return to Agrifinance."}
                        </p>
                      ) : null}
                    </div>
                  </section>
                ) : null}

                {activeResultPage.key === "decision" ? (
                  <section className="farmer-results__pane">
                    <div className="farmer-results__summary">
                      <article>
                        <h3>Loan recommendation tier</h3>
                        <p>{result.loanRecommendationTier}</p>
                      </article>
                      <article>
                        <h3>Assessment coverage</h3>
                        <p>Crop risk, farm size, practices, weather, and past loss were all included.</p>
                      </article>
                    </div>

                    <div className="farmer-results__block">
                      <h3>Insurance package</h3>
                      <ul>
                        {result.insurancePackage.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="farmer-results__block">
                      <h3>Scoring formula</h3>
                      <p>{farmerFinalFormula}</p>
                    </div>
                  </section>
                ) : null}

                {activeResultPage.key === "breakdown" ? (
                  <section className="farmer-results__pane">
                    <div className="farmer-results__metrics">
                      {result.sectionScores.map((item) => (
                        <article className="metric" key={item.label}>
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>

              <div className="farmer-results__pager-controls">
                <button
                  className="btn btn--secondary"
                  type="button"
                  disabled={!canViewPreviousResultPage}
                  onClick={() => setActiveResultPageIndex((current) => Math.max(current - 1, 0))}
                >
                  Previous page
                </button>
                <button
                  className="btn btn--primary"
                  type="button"
                  disabled={!canViewNextResultPage}
                  onClick={() =>
                    setActiveResultPageIndex((current) => Math.min(current + 1, farmerResultPages.length - 1))
                  }
                >
                  Next page
                </button>
              </div>
            </>
          ) : (
            <div className="farmer-results__placeholder">
              <span className="farmer-results__empty-mark">◎</span>
              <h3>Score appears here</h3>
              <p>Complete all 45 inputs, then calculate to save the current risk decision for this farm.</p>
              <div className="farmer-results__placeholder-pages">
                <span>Financial overview</span>
                <span>Decision summary</span>
                <span>Domain breakdown</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function isAllowedReturnOrigin(value) {
  try {
    const origin = new URL(value).origin;
    const configured = (process.env.NEXT_PUBLIC_AGRIFINANCE_ALLOWED_ORIGINS ||
      "http://localhost:4200,https://agrifinance.tripsecureagrifinanceltd.com")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return configured.includes(origin);
  } catch {
    return false;
  }
}

function isQuestionInvalid(question, value) {
  if (question.inputType === "number") {
    return value === "" || value === null || Number(value) < 0 || Number.isNaN(Number(value));
  }
  return !value;
}
