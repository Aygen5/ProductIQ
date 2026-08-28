import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchDuplicateCandidateById,
  confirmDuplicateCandidate,
  rejectDuplicateCandidate,
  updateCandidateStatus,
} from "../../services/duplicateService";
import type { DuplicateCandidateDetail, DuplicateStatus } from "../../types/duplicate";

export const DuplicateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<DuplicateCandidateDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>("");

  const loadCandidate = useCallback(async () => {
    if (!id) {
      setError("Candidate ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchDuplicateCandidateById(id);
      setCandidate(data);
      if (data.resolutionNotes) {
        setResolutionNotes(data.resolutionNotes);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load candidate details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCandidate();
  }, [loadCandidate]);

  const handleConfirm = async () => {
    if (!id) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const updated = await confirmDuplicateCandidate(id, resolutionNotes.trim() || undefined);
      setCandidate(updated);
      setFeedback({ type: "success", message: "Duplicate pair confirmed successfully in database." });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to confirm duplicate." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const updated = await rejectDuplicateCandidate(id, resolutionNotes.trim() || undefined);
      setCandidate(updated);
      setFeedback({ type: "success", message: "Candidate pair marked as Not a Duplicate (Rejected)." });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to reject duplicate." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToPending = async () => {
    if (!id) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const updated = await updateCandidateStatus(id, 0 as DuplicateStatus, resolutionNotes.trim() || undefined);
      setCandidate(updated);
      setFeedback({ type: "success", message: "Candidate reset back to Pending Review status." });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to reset status." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseSignals = (matchSignals: string | null) => {
    if (!matchSignals) return null;
    try {
      return JSON.parse(matchSignals);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] w-full gap-md">
        <span className="material-symbols-outlined text-[48px] animate-spin text-primary">progress_activity</span>
        <span className="text-body-lg text-on-surface-variant">Loading duplicate analysis...</span>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] w-full gap-md">
        <div className="w-16 h-16 rounded-full bg-error-container/20 flex items-center justify-center text-error">
          <span className="material-symbols-outlined text-[32px]">error</span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface">Candidate Not Found</h2>
        <p className="text-body-md text-on-surface-variant max-w-md text-center">{error || "The requested duplicate pair could not be found."}</p>
        <button
          onClick={() => navigate("/duplicates")}
          className="px-md py-sm bg-primary text-on-primary rounded-xl font-label-md hover:bg-primary-fixed-dim transition-colors flex items-center gap-xs mt-sm"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Duplicate Queue
        </button>
      </div>
    );
  }

  const signals = parseSignals(candidate.matchSignals);
  const overallPct = Math.round(candidate.overallScore * 100);
  const brandPct = Math.round((signals?.brand_score ?? (candidate.brandMatch ? 1 : 0)) * 100);
  const categoryPct = Math.round((signals?.category_score ?? 0) * 100);
  const modelPct = Math.round((signals?.model_score ?? (candidate.modelMatch ? 1 : 0)) * 100);
  const textPct = Math.round((candidate.textSimilarity ?? 0) * 100);
  const semanticPct = Math.round((candidate.semanticSimilarity ?? 0) * 100);
  const attributePct = Math.round((candidate.attributeSimilarity ?? 0) * 100);

  const strokeDash = 289;
  const strokeOffset = strokeDash - (strokeDash * overallPct) / 100;

  return (
    <div className="flex flex-col w-full relative">
      <div className="absolute top-0 right-0 w-3/4 h-[800px] bg-gradient-radial from-primary/5 via-primary/[0.02] to-transparent pointer-events-none mix-blend-screen transform translate-x-1/4 -translate-y-1/4 z-0"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-md relative z-10 w-full max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-xs">
          <div className="flex items-center gap-xs font-label-sm text-label-sm text-outline uppercase tracking-[0.1em]">
            <span onClick={() => navigate("/duplicates")} className="hover:text-on-background transition-colors cursor-pointer flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Duplicate Queue
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">Review & Decision</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-background tracking-tight">Duplicate Analysis</h1>
        </div>

        <div className="flex flex-wrap items-center gap-sm">
          {candidate.status === 1 ? (
            <div className="flex items-center gap-sm">
              <span className="px-md py-sm rounded-xl font-label-md text-label-md bg-secondary-container text-on-secondary-container flex items-center gap-xs font-bold shadow-sm">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Confirmed Duplicate
              </span>
              <button
                disabled={isSubmitting}
                onClick={handleResetToPending}
                className="px-md py-sm rounded-xl font-label-md text-label-md border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Re-open
              </button>
            </div>
          ) : candidate.status === 2 ? (
            <div className="flex items-center gap-sm">
              <span className="px-md py-sm rounded-xl font-label-md text-label-md bg-error-container/20 text-error flex items-center gap-xs font-bold border border-error/30">
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                Rejected (Not a Duplicate)
              </span>
              <button
                disabled={isSubmitting}
                onClick={handleResetToPending}
                className="px-md py-sm rounded-xl font-label-md text-label-md border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Re-open
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-sm">
              <button
                disabled={isSubmitting}
                onClick={handleReject}
                className="px-md py-sm rounded-xl font-label-md text-label-md bg-error-container/20 text-error hover:bg-error-container/40 transition-colors border border-error/30 flex items-center gap-xs disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
                Not a Duplicate
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleConfirm}
                className="px-md py-sm rounded-xl font-label-md text-label-md bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary transition-colors shadow-md flex items-center gap-xs font-bold disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                Confirm Duplicate
              </button>
            </div>
          )}

          <div className="h-8 w-px bg-outline-variant/20 hidden md:block"></div>

          <button
            onClick={() => navigate("/duplicates")}
            className="px-md py-sm rounded-xl font-label-md text-label-md border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">list</span>
            Queue
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`mb-md p-md rounded-2xl border flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-secondary-container/20 border-secondary/30 text-on-surface"
              : "bg-error-container/20 border-error/30 text-error"
          }`}
        >
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined">
              {feedback.type === "success" ? "check_circle" : "error"}
            </span>
            <span className="font-body-md text-body-md">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      <div className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-lg relative z-10">
        <div className="xl:col-span-8 flex flex-col gap-lg">
          <div className="bg-surface-container-low rounded-[24px] p-lg border border-outline-variant/10 shadow-2xl shadow-black/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-surface-container to-surface-container-lowest opacity-50 z-0"></div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center pointer-events-none md:pointer-events-auto">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-surface-container-lowest border border-outline-variant/20 shadow-2xl shadow-black flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl">
                <svg className="absolute inset-0 w-full h-full -rotate-90 z-0" viewBox="0 0 100 100">
                  <circle className="stroke-surface-container-high" cx="50" cy="50" fill="none" r="46" strokeWidth="4"></circle>
                  <circle
                    className="stroke-primary drop-shadow-[0_0_8px_rgba(255,180,171,0.5)]"
                    cx="50"
                    cy="50"
                    fill="none"
                    r="46"
                    strokeDasharray={strokeDash}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    strokeWidth="4"
                  ></circle>
                </svg>
                <div className="relative z-10 flex flex-col items-center mt-xs">
                  <span className="font-headline-lg text-headline-lg text-on-surface leading-none font-bold">
                    {overallPct}<span className="text-[16px] text-on-surface-variant">%</span>
                  </span>
                </div>
              </div>
              <div className="mt-2 px-md py-0.5 rounded-full bg-primary-container/30 border border-primary/30 backdrop-blur-md">
                <span className="font-label-sm text-label-sm text-on-primary-container uppercase tracking-widest">
                  Duplicate Confidence
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md relative z-10">
              <div className="flex flex-col gap-md bg-surface-container-lowest/70 rounded-2xl p-md border border-outline-variant/10 group hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="px-sm py-xs rounded-lg bg-surface-container font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Product A
                  </div>
                  <span className="font-body-sm text-[12px] text-outline font-mono bg-surface px-sm py-xs rounded">
                    ASIN: {candidate.productA?.amazonItemId}
                  </span>
                </div>

                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative bg-surface-container flex items-center justify-center p-md">
                  {candidate.productA?.mainImageUrl ? (
                    <img
                      src={candidate.productA.mainImageUrl}
                      alt={candidate.productA.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-outline text-[48px]">image</span>
                  )}
                </div>

                <div className="flex flex-col gap-xs mt-xs">
                  <h3 className="font-headline-sm text-headline-sm text-on-background line-clamp-2" title={candidate.productA?.name}>
                    {candidate.productA?.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-sm mt-xs">
                    {candidate.productA?.brand && (
                      <span className="font-label-sm text-label-sm text-primary bg-primary/10 px-xs py-[2px] rounded">
                        {candidate.productA.brand}
                      </span>
                    )}
                    {candidate.productA?.price && (
                      <span className="font-body-md text-body-md text-on-surface font-semibold">
                        ${candidate.productA.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-on-surface-variant mt-xs line-clamp-1">
                    {candidate.productA?.category}
                  </div>
                </div>

                <div className="mt-xs pt-sm border-t border-outline-variant/10 flex flex-col gap-xs text-[12px]">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Product Type:</span>
                    <span className="text-on-surface">{candidate.productA?.productType || "N/A"}</span>
                  </div>
                  {candidate.productA?.modelNumber && (
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Model Number:</span>
                      <span className="text-on-surface font-mono">{candidate.productA.modelNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-md bg-surface-container-lowest/70 rounded-2xl p-md border border-outline-variant/10 group hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="px-sm py-xs rounded-lg bg-surface-container font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    Product B
                  </div>
                  <span className="font-body-sm text-[12px] text-outline font-mono bg-surface px-sm py-xs rounded">
                    ASIN: {candidate.productB?.amazonItemId}
                  </span>
                </div>

                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative bg-surface-container flex items-center justify-center p-md">
                  {candidate.productB?.mainImageUrl ? (
                    <img
                      src={candidate.productB.mainImageUrl}
                      alt={candidate.productB.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-outline text-[48px]">image</span>
                  )}
                </div>

                <div className="flex flex-col gap-xs mt-xs">
                  <h3 className="font-headline-sm text-headline-sm text-on-background line-clamp-2" title={candidate.productB?.name}>
                    {candidate.productB?.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-sm mt-xs">
                    {candidate.productB?.brand && (
                      <span className="font-label-sm text-label-sm text-primary bg-primary/10 px-xs py-[2px] rounded">
                        {candidate.productB.brand}
                      </span>
                    )}
                    {candidate.productB?.price && (
                      <span className="font-body-md text-body-md text-on-surface font-semibold">
                        ${candidate.productB.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-on-surface-variant mt-xs line-clamp-1">
                    {candidate.productB?.category}
                  </div>
                </div>

                <div className="mt-xs pt-sm border-t border-outline-variant/10 flex flex-col gap-xs text-[12px]">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Product Type:</span>
                    <span className="text-on-surface">{candidate.productB?.productType || "N/A"}</span>
                  </div>
                  {candidate.productB?.modelNumber && (
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Model Number:</span>
                      <span className="text-on-surface font-mono">{candidate.productB.modelNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-[24px] p-xl border border-outline-variant/10 flex flex-col gap-lg">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-[28px]">insights</span>
              <h2 className="font-headline-lg text-headline-lg text-on-background">Similarity Breakdown</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div className="flex flex-col gap-sm">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">branding_watermark</span>
                    <span className="font-label-md text-label-md text-on-surface">Brand Match</span>
                  </div>
                  <span className="font-label-md text-label-md text-primary font-bold">{brandPct}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${brandPct}%` }}></div>
                </div>
                <p className="font-body-sm text-body-sm text-outline">
                  {brandPct >= 80 ? "Exact or parent-brand alignment." : "Different or unverified brand information."}
                </p>
              </div>

              <div className="flex flex-col gap-sm">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-secondary text-[20px]">category</span>
                    <span className="font-label-md text-label-md text-on-surface">Category Match</span>
                  </div>
                  <span className="font-label-md text-label-md text-secondary font-bold">{categoryPct}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full transition-all duration-700" style={{ width: `${categoryPct}%` }}></div>
                </div>
                <p className="font-body-sm text-body-sm text-outline">
                  {categoryPct >= 80 ? "Exact category taxonomy hierarchy alignment." : "Partial taxonomy path overlap."}
                </p>
              </div>

              <div className="flex flex-col gap-sm">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-tertiary text-[20px]">match_word</span>
                    <span className="font-label-md text-label-md text-on-surface">Text Similarity</span>
                  </div>
                  <span className="font-label-md text-label-md text-tertiary font-bold">{textPct}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full transition-all duration-700" style={{ width: `${textPct}%` }}></div>
                </div>
                <p className="font-body-sm text-body-sm text-outline">
                  Token overlap across title, model, and description.
                </p>
              </div>

              <div className="flex flex-col gap-sm">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                    <span className="font-label-md text-label-md text-on-surface">Semantic Match (pgvector)</span>
                  </div>
                  <span className="font-label-md text-label-md text-primary font-bold">{semanticPct}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${semanticPct}%` }}></div>
                </div>
                <p className="font-body-sm text-body-sm text-outline">
                  Cosine similarity of 1536-dimensional OpenAI text embeddings stored in PostgreSQL pgvector.
                </p>
              </div>

              <div className="flex flex-col gap-sm">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-outline text-[20px]">format_list_bulleted</span>
                    <span className="font-label-md text-label-md text-on-surface">Attribute Match</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-bold">{attributePct}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-on-surface-variant rounded-full transition-all duration-700" style={{ width: `${attributePct}%` }}></div>
                </div>
                <p className="font-body-sm text-body-sm text-outline">
                  Key-value attribute alignment and physical dimension tolerance.
                </p>
              </div>

              <div className="flex flex-col gap-sm">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-outline text-[20px]">qr_code_2</span>
                    <span className="font-label-md text-label-md text-on-surface">Model Match</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-bold">{modelPct}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-on-surface-variant rounded-full transition-all duration-700" style={{ width: `${modelPct}%` }}></div>
                </div>
                <p className="font-body-sm text-body-sm text-outline">
                  {modelPct > 0 ? "Model number or name overlap confirmed." : "No explicit model number match found."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-lg">
          <div className="bg-surface-container-low rounded-[24px] p-lg border border-outline-variant/10 flex flex-col gap-md">
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-xs">Review Notes & Resolution</h3>
            <div className="flex flex-col gap-sm">
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Add optional notes explaining your resolution decision..."
                rows={3}
                className="w-full bg-surface p-sm rounded-xl text-body-sm text-on-surface placeholder:text-on-surface-variant/60 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors resize-none"
              />
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>{candidate.reviewedAt ? `Last reviewed: ${new Date(candidate.reviewedAt).toLocaleString()}` : "Not yet reviewed"}</span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-[24px] p-lg border border-primary/20 relative overflow-hidden">
            <div className="relative z-10 flex flex-col gap-md">
              <div className="flex items-center gap-sm mb-xs">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                </div>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Candidate Info</span>
              </div>
              <div className="p-md bg-surface-container-lowest/60 rounded-xl border border-outline-variant/10 font-mono text-[12px] text-on-surface-variant flex flex-col gap-xs">
                <div className="flex justify-between">
                  <span>Candidate ID:</span>
                  <span className="text-on-surface font-bold truncate max-w-[150px]">{candidate.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-bold ${candidate.status === 1 ? "text-secondary" : candidate.status === 2 ? "text-error" : "text-tertiary"}`}>
                    {candidate.status === 1 ? "Confirmed" : candidate.status === 2 ? "Rejected" : "Pending Review"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Overall Score:</span>
                  <span className="text-primary font-bold">{(candidate.overallScore * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-[24px] p-lg border border-outline-variant/10 flex flex-col gap-md">
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-xs">Detection Criteria</h3>
            <div className="flex flex-col gap-0">
              <div className="flex items-start gap-md py-sm border-b border-outline-variant/10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-[2px] ${brandPct >= 80 ? "bg-primary-container text-on-primary-container" : "bg-surface-container-high text-outline"}`}>
                  <span className="material-symbols-outlined text-[14px]">{brandPct >= 80 ? "check" : "close"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Brand Alignment</span>
                  <span className="font-body-sm text-[12px] text-outline">
                    {brandPct >= 80 ? `Matching brand: '${candidate.productA?.brand}'` : "Brands differ or unverified"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-md py-sm border-b border-outline-variant/10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-[2px] ${categoryPct >= 50 ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high text-outline"}`}>
                  <span className="material-symbols-outlined text-[14px]">{categoryPct >= 50 ? "check" : "close"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Category Taxonomy</span>
                  <span className="font-body-sm text-[12px] text-outline">
                    {categoryPct >= 50 ? "Same catalog category taxonomy path" : "Different catalog categories"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-md py-sm border-b border-outline-variant/10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-[2px] ${semanticPct >= 50 ? "bg-primary-container text-on-primary-container" : "bg-surface-container-high text-outline"}`}>
                  <span className="material-symbols-outlined text-[14px]">{semanticPct >= 50 ? "check" : "close"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">pgvector Semantic Match</span>
                  <span className="font-body-sm text-[12px] text-outline">
                    Cosine similarity of text embeddings: {semanticPct}%
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-md py-sm">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-[2px] ${attributePct > 0 ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high text-outline"}`}>
                  <span className="material-symbols-outlined text-[14px]">{attributePct > 0 ? "check" : "close"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Attribute Match</span>
                  <span className="font-body-sm text-[12px] text-outline">
                    {attributePct > 0 ? `Shared attribute values match: ${attributePct}%` : "No matching attribute keys found"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-sm flex flex-col gap-sm">
            <button
              onClick={() => navigate(`/products/${candidate.productAId}`)}
              className="w-full py-sm rounded-xl font-label-md text-label-md text-on-surface-variant hover:text-on-surface border border-outline-variant/30 hover:bg-surface-container-high transition-colors flex items-center justify-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              View Product A in Catalog
            </button>
            <button
              onClick={() => navigate(`/products/${candidate.productBId}`)}
              className="w-full py-sm rounded-xl font-label-md text-label-md text-on-surface-variant hover:text-on-surface border border-outline-variant/30 hover:bg-surface-container-high transition-colors flex items-center justify-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              View Product B in Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
