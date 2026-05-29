import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import UploadZone from './components/UploadZone';
import LoadingState from './components/LoadingState';
import ResultView from './components/ResultView';
import type { ReviewResult } from './lib/types';
import { EASE_OUT, fadeUp, fadeUpTransition, pageTransition } from './lib/motion';

type AppState =
  | { phase: 'idle' }
  | { phase: 'loading'; resumeText: string }
  | { phase: 'result'; resumeText: string; result: ReviewResult }
  | { phase: 'error'; resumeText: string; error: string };

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const App = () => {
  const [state, setState] = useState<AppState>({ phase: 'idle' });

  const handleReview = async (resumeText: string) => {
    setState({ phase: 'loading', resumeText });

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });

      const raw = await res.text();
      let data: { error?: string } = {};
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error(
            'Server returned an invalid response. Restart the dev server after adding GEMINI_API_KEY to .env.',
          );
        }
      }

      if (!res.ok) {
        throw new Error(data.error || 'Review failed.');
      }

      setState({ phase: 'result', resumeText, result: data as ReviewResult });
      requestAnimationFrame(scrollToTop);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setState({ phase: 'error', resumeText, error: msg });
    }
  };

  const reset = () => {
    setState({ phase: 'idle' });
    requestAnimationFrame(scrollToTop);
  };

  return (
    <main className="relative min-h-screen w-full bg-[#0C0C0C]">
      <header className="mx-auto flex w-full max-w-6xl px-5 py-5 sm:px-8 md:px-10 md:py-6">
        <a
          href="/"
          className="flex items-center gap-2.5 text-sm font-medium uppercase tracking-wide text-[#D7E2EA] sm:text-base"
        >
          <span className="score-gradient text-xl font-black sm:text-2xl">R</span>
          ResumeIQ
        </a>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12 md:px-10 md:pt-16">
        <AnimatePresence mode="wait">
          {state.phase === 'idle' && (
            <motion.div key="idle" {...pageTransition}>
              <motion.div
                {...fadeUp}
                transition={fadeUpTransition()}
                className="mb-12 flex flex-col items-center gap-5 text-center sm:mb-16 sm:gap-6 md:mb-20"
              >
                <h1
                  className="hero-heading font-black uppercase leading-[0.95] tracking-tight"
                  style={{ fontSize: 'clamp(2.75rem, 10vw, 7.5rem)' }}
                >
                  Resume reviewer
                </h1>
                <p
                  className="max-w-xl font-light leading-relaxed text-[#D7E2EA]/70 sm:max-w-2xl"
                  style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }}
                >
                  Drop in your resume. Get a brutally honest, AI-powered review with
                  scores, strengths, weaknesses, and rewritten bullets — in seconds.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12, ease: EASE_OUT }}
              >
                <UploadZone onSubmit={handleReview} isProcessing={false} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
                className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-4 sm:mt-20 sm:grid-cols-3 sm:gap-5"
              >
                {[
                  { num: '4', label: 'Scored categories' },
                  { num: '3', label: 'Bullets rewritten' },
                  { num: '~8s', label: 'Average response' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-[#D7E2EA]/10 bg-[#141418]/60 p-5 sm:p-6"
                  >
                    <span className="score-gradient text-3xl font-black sm:text-4xl">
                      {stat.num}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-[#D7E2EA]/50">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {state.phase === 'loading' && (
            <motion.div key="loading" {...pageTransition}>
              <LoadingState />
            </motion.div>
          )}

          {state.phase === 'result' && (
            <motion.div key="result" {...pageTransition}>
              <ResultView
                result={state.result}
                resumeText={state.resumeText}
                onReset={reset}
              />
            </motion.div>
          )}

          {state.phase === 'error' && (
            <motion.div
              key="error"
              {...pageTransition}
              className="mx-auto flex max-w-xl flex-col items-center gap-5 py-20 text-center sm:gap-6"
            >
              <AlertCircle size={44} className="text-red-400/90" strokeWidth={1.4} />
              <h2 className="text-xl font-medium text-[#D7E2EA] sm:text-2xl">
                Couldn&apos;t review that resume
              </h2>
              <p className="leading-relaxed text-[#D7E2EA]/70">{state.error}</p>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border border-[#D7E2EA]/30 px-8 py-3 text-sm font-medium uppercase tracking-wide text-[#D7E2EA] transition-colors hover:border-[#D7E2EA]/60 hover:bg-[#D7E2EA]/5"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="border-t border-[#D7E2EA]/10 px-5 py-6 sm:px-8 md:px-10">
        <p className="mx-auto max-w-6xl text-center text-xs uppercase tracking-wide text-[#D7E2EA]/40">
          Your resume is processed in real time and never stored
        </p>
      </footer>
    </main>
  );
};

export default App;
