import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { extractTextFromPdf } from '../lib/pdfExtract';

interface UploadZoneProps {
  onSubmit: (resumeText: string) => void;
  isProcessing: boolean;
}

type Mode = 'upload' | 'paste';

const MAX_CHARS = 30_000;
const MIN_CHARS = 100;

const UploadZone = ({ onSubmit, isProcessing }: UploadZoneProps) => {
  const [mode, setMode] = useState<Mode>('upload');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported. Use the "Paste text" tab for other formats.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('PDF is too large (max 10 MB).');
      return;
    }

    setFileName(file.name);
    setIsExtracting(true);
    try {
      const extracted = await extractTextFromPdf(file);
      setText(extracted.slice(0, MAX_CHARS));
    } catch (err) {
      const code = err instanceof Error ? err.message : 'PDF_INVALID';
      if (code === 'PDF_NO_TEXT') {
        setError(
          'Couldn\'t extract text — this looks like a scanned/image PDF. Switch to "Paste text" instead.',
        );
      } else {
        setError("That doesn't look like a valid PDF. Try a different file.");
      }
      setFileName(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = () => {
    setError(null);
    const trimmed = text.trim();
    if (trimmed.length < MIN_CHARS) {
      setError(`Need at least ${MIN_CHARS} characters of resume text.`);
      return;
    }
    onSubmit(trimmed);
  };

  const charCount = text.length;
  const overLimit = charCount > MAX_CHARS;
  const canSubmit = charCount >= MIN_CHARS && !overLimit && !isProcessing && !isExtracting;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mx-auto mb-5 flex w-fit gap-1 rounded-full border border-[#D7E2EA]/12 bg-[#141418] p-1 sm:mb-6">
        {(['upload', 'paste'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            className={`rounded-full px-5 py-2 text-sm font-medium uppercase tracking-wide transition-colors duration-200 ${
              mode === tab
                ? 'bg-[#D7E2EA] text-[#0C0C0C]'
                : 'text-[#D7E2EA]/55 hover:text-[#D7E2EA]'
            }`}
          >
            {tab === 'upload' ? 'Upload PDF' : 'Paste text'}
          </button>
        ))}
      </div>

      {mode === 'upload' ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`w-full rounded-3xl border-2 border-dashed p-8 transition-all duration-300 sm:p-12 ${
            isDragging
              ? 'border-[#B600A8]/70 bg-[#1a0f1f]'
              : 'border-[#D7E2EA]/20 bg-[#141418] hover:border-[#D7E2EA]/35 hover:bg-[#17171c]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="flex flex-col items-center gap-3.5 text-center sm:gap-4">
            {fileName ? (
              <>
                <FileText size={44} className="text-[#D7E2EA]" strokeWidth={1.4} />
                <div className="flex flex-col gap-1">
                  <span className="break-all text-base font-medium text-[#D7E2EA] sm:text-lg">
                    {fileName}
                  </span>
                  {isExtracting ? (
                    <span className="animate-soft-pulse text-sm text-[#D7E2EA]/60">
                      Extracting text…
                    </span>
                  ) : (
                    <span className="text-sm text-[#D7E2EA]/55">
                      {charCount.toLocaleString()} characters extracted · click to replace
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <UploadCloud size={44} className="text-[#D7E2EA]/65" strokeWidth={1.4} />
                <div className="flex flex-col gap-1">
                  <span className="text-base font-medium text-[#D7E2EA] sm:text-lg">
                    Drop your resume PDF here, or click to browse
                  </span>
                  <span className="text-sm text-[#D7E2EA]/45">
                    PDF only · max 10 MB · text is never stored
                  </span>
                </div>
              </>
            )}
          </div>
        </button>
      ) : (
        <div className="w-full overflow-hidden rounded-3xl border border-[#D7E2EA]/12 bg-[#141418]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your full resume text here…"
            className="h-60 w-full resize-none bg-transparent p-5 text-sm font-light leading-relaxed text-[#D7E2EA] placeholder:text-[#D7E2EA]/30 focus:outline-none sm:h-64 sm:p-6 sm:text-base"
            style={{ fontFamily: "'Kanit', sans-serif" }}
          />
          <div className="flex items-center justify-between border-t border-[#D7E2EA]/10 px-5 py-3 text-xs uppercase tracking-wide text-[#D7E2EA]/45 sm:px-6">
            <span>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
            </span>
            <span>{charCount < MIN_CHARS ? `${MIN_CHARS - charCount} more needed` : 'Ready'}</span>
          </div>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/8 p-4 text-sm text-red-200/90"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" strokeWidth={1.6} />
          <span>{error}</span>
        </motion.div>
      )}

      <div className="mt-6 flex justify-center sm:mt-7">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-primary inline-flex items-center gap-2.5 rounded-full px-9 py-3.5 text-sm font-medium uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-40 sm:gap-3 sm:px-10 sm:py-4 sm:text-base"
        >
          <Sparkles size={17} strokeWidth={1.8} />
          {isProcessing ? 'Reviewing…' : 'Review my resume'}
        </button>
      </div>
    </div>
  );
};

export default UploadZone;
