import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import type { ReviewResult, CategoryScores } from '../lib/types';
import {
  EASE_OUT,
  staggerContainer,
  staggerItem,
} from '../lib/motion';

interface ResultViewProps {
  result: ReviewResult;
  resumeText: string;
  onReset: () => void;
}

const CATEGORY_LABELS: Record<keyof CategoryScores, string> = {
  clarity: 'Clarity',
  impact: 'Impact',
  atsCompatibility: 'ATS',
  structure: 'Structure',
};

const scoreColor = (score: number): string => {
  if (score >= 80) return '#4ade80';
  if (score >= 60) return '#facc15';
  if (score >= 40) return '#fb923c';
  return '#f87171';
};

const scoreLabel = (score: number): string => {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Decent';
  if (score >= 40) return 'Needs work';
  return 'Weak';
};

const ResultView = ({ result, resumeText, onReset }: ResultViewProps) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="mx-auto flex w-full max-w-6xl flex-col gap-10 sm:gap-12 md:gap-14"
    >
      <motion.div variants={staggerItem} className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm uppercase tracking-wide text-[#D7E2EA]/55 transition-colors duration-200 hover:text-[#D7E2EA]"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Review another
        </button>
        <span className="text-xs uppercase tracking-wide text-[#D7E2EA]/40">
          {resumeText.length.toLocaleString()} chars analysed
        </span>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="flex flex-col items-center gap-4 text-center sm:gap-5"
      >
        <span className="text-xs uppercase tracking-wide text-[#D7E2EA]/50 sm:text-sm">
          Overall Score
        </span>
        <div className="flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="score-gradient font-black leading-none"
            style={{ fontSize: 'clamp(5rem, 18vw, 14rem)' }}
          >
            {result.overallScore}
          </motion.span>
          <span
            className="mt-2 font-medium uppercase tracking-wide"
            style={{ color: scoreColor(result.overallScore) }}
          >
            {scoreLabel(result.overallScore)}
          </span>
        </div>
        <p
          className="max-w-2xl font-light leading-relaxed text-[#D7E2EA]/75"
          style={{ fontSize: 'clamp(1rem, 1.6vw, 1.2rem)' }}
        >
          {result.summary}
        </p>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
      >
        {(Object.keys(CATEGORY_LABELS) as Array<keyof CategoryScores>).map((key, i) => {
          const score = result.categoryScores[key];
          return (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-2xl border border-[#D7E2EA]/12 bg-[#141418] p-5 sm:gap-3.5 sm:p-6"
            >
              <span className="text-xs uppercase tracking-wide text-[#D7E2EA]/50">
                {CATEGORY_LABELS[key]}
              </span>
              <span
                className="text-3xl font-black sm:text-4xl"
                style={{ color: scoreColor(score) }}
              >
                {score}
                <span className="text-base font-light text-[#D7E2EA]/30">/100</span>
              </span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0C0C0C]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{
                    duration: 0.85,
                    delay: 0.15 + i * 0.06,
                    ease: EASE_OUT,
                  }}
                  className="h-full rounded-full"
                  style={{ background: scoreColor(score) }}
                />
              </div>
            </div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        <motion.section
          variants={staggerItem}
          className="flex flex-col gap-4 rounded-2xl border border-green-500/18 bg-green-500/5 p-6 sm:gap-5 sm:p-7"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={20} className="text-green-400" strokeWidth={1.6} />
            <h3 className="text-base font-medium uppercase tracking-wide text-[#D7E2EA] sm:text-lg">
              Strengths
            </h3>
          </div>
          <ul className="flex flex-col gap-3.5">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex gap-3 leading-relaxed text-[#D7E2EA]/88">
                <span className="shrink-0 font-medium text-green-400/55">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          variants={staggerItem}
          className="flex flex-col gap-4 rounded-2xl border border-amber-500/18 bg-amber-500/5 p-6 sm:gap-5 sm:p-7"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={20} className="text-amber-400" strokeWidth={1.6} />
            <h3 className="text-base font-medium uppercase tracking-wide text-[#D7E2EA] sm:text-lg">
              Weaknesses
            </h3>
          </div>
          <ul className="flex flex-col gap-3.5">
            {result.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-3 leading-relaxed text-[#D7E2EA]/88">
                <span className="shrink-0 font-medium text-amber-400/55">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>

      {result.missingSections && result.missingSections.length > 0 && (
        <motion.section
          variants={staggerItem}
          className="flex flex-col gap-4 rounded-2xl border border-[#D7E2EA]/12 bg-[#141418] p-6 sm:p-7"
        >
          <h3 className="text-base font-medium uppercase tracking-wide text-[#D7E2EA] sm:text-lg">
            Missing sections
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.missingSections.map((m, i) => (
              <span
                key={i}
                className="rounded-full border border-[#D7E2EA]/18 px-3.5 py-1.5 text-sm text-[#D7E2EA]/75"
              >
                {m}
              </span>
            ))}
          </div>
        </motion.section>
      )}

      <motion.section variants={staggerItem} className="flex flex-col gap-5 sm:gap-6">
        <div className="flex items-center gap-2.5">
          <Sparkles size={20} className="text-[#B600A8]" strokeWidth={1.6} />
          <h3 className="text-base font-medium uppercase tracking-wide text-[#D7E2EA] sm:text-lg">
            Suggested rewrites
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          {result.rewrites.map((r, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 * i, ease: EASE_OUT }}
              className="flex flex-col gap-4 rounded-2xl border border-[#D7E2EA]/12 bg-[#141418] p-5 sm:p-6 md:p-7"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-xs uppercase tracking-wide text-[#D7E2EA]/40">
                  Rewrite {i + 1}
                </span>
                <span className="text-xs uppercase tracking-wide text-[#D7E2EA]/55">
                  · {r.reason}
                </span>
              </div>

              <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4">
                <div className="rounded-xl border border-amber-500/15 bg-[#0C0C0C] p-4 sm:p-5">
                  <span className="mb-2 block text-xs uppercase tracking-wide text-amber-400/70">
                    Original
                  </span>
                  <p className="text-sm leading-relaxed text-[#D7E2EA]/68 line-through decoration-amber-500/35 sm:text-base">
                    {r.original}
                  </p>
                </div>

                <div className="hidden items-center justify-center md:flex">
                  <ChevronRight size={20} className="text-[#D7E2EA]/35" strokeWidth={1.6} />
                </div>

                <div className="rounded-xl border border-green-500/18 bg-[#0C0C0C] p-4 sm:p-5">
                  <span className="mb-2 block text-xs uppercase tracking-wide text-green-400/75">
                    Suggested
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-[#D7E2EA] sm:text-base">
                    {r.suggested}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <motion.div variants={staggerItem} className="flex justify-center pb-6 pt-2 sm:pb-10">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2.5 rounded-full border border-[#D7E2EA]/30 px-9 py-3.5 text-sm font-medium uppercase tracking-wide text-[#D7E2EA] transition-colors duration-200 hover:border-[#D7E2EA]/55 hover:bg-[#D7E2EA]/5 sm:px-10 sm:py-4 sm:text-base"
        >
          <ArrowLeft size={17} strokeWidth={1.8} />
          Review another resume
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ResultView;
