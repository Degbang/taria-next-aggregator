"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import {
  farmerFinalFormula,
  farmerInitialForm,
  farmerInsuranceCap,
  farmerLoanCap,
  farmerQuestionMap,
  farmerQuestionSteps,
  farmerResultPages,
} from "@/lib/taria/farmer-risk";

export function FarmerRiskClient() {
  const [form, setForm] = useState(farmerInitialForm);
  const [touched, setTouched] = useState({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeResultPageIndex, setActiveResultPageIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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

    try {
      const response = await fetch("/api/v1/farmer-risk-assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "We could not save the farmer assessment.");
      }

      startTransition(() => {
        setResult({
          assessmentId: payload.assessmentId,
          submittedAt: payload.submittedAt,
          ...payload.result,
        });
        setActiveResultPageIndex(0);
      });
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

  return (
    <section className="farmer-page">
      <div className="farmer-page__header">
        <div>
          <span className="farmer-page__tag">Farmer Risk Profile</span>
          <h1>Farmer risk profile</h1>
          <p>Answer the questions across five domains to assess farmer strength, exposure, and support needs.</p>
        </div>
        <Link className="btn btn--secondary farmer-page__switch" href="/insurance/assessment">
          Go to Insurance Risk Profiling
        </Link>
      </div>

      <div className="farmer-page__grid">
        <form className="farmer-form" onSubmit={calculateRisk}>
          <div className="farmer-form__header">
            <h2>Assessment questions</h2>
            <p>Work through each domain and complete the current section before moving on.</p>
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
            <h2>Risk Output</h2>
            <p>Overall result, domain breakdown, loan guidance, and insurance package.</p>
          </div>

          {result ? (
            <>
              <div className="farmer-results__score">
                <div>
                  <span className="farmer-results__score-label">Farmer risk score</span>
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
                      <p className="farmer-results__save-note">
                        Saved assessment ID: {result.assessmentId}
                      </p>
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
              <h3>No score yet</h3>
              <p>Complete all 45 questionnaire inputs to generate the five-domain weighted output.</p>
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

function isQuestionInvalid(question, value) {
  if (question.inputType === "number") {
    return value === "" || value === null || Number(value) < 0 || Number.isNaN(Number(value));
  }
  return !value;
}
