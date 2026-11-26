import { useEffect, useRef, useState } from 'react';
import { FileText, LoaderCircle, Upload } from 'lucide-react';
import Modal from './Modal';
import { formatINR } from '../constants';
import { detectCategory, parseTransaction } from '../utils/aiParser';
import { formatLongDate, todayStr } from '../utils/dateUtils';

const PLACEHOLDER = 'Paste receipt or SMS text, e.g. "Paid Rs. 680.00 to City Diner on 26-11-2026"';

export default function ReceiptScannerModal({ onClose, onExtracted }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  function handleFileChange(event) {
    const chosenFile = event.target.files[0];
    if (!chosenFile) return;

    setFile(chosenFile);
    setResult(null);
    setError('');

    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(chosenFile);
  }

  function handleScan() {
    setError('');
    setResult(null);

    if (text.trim() === '' && !file) {
      setError('Upload a receipt image or paste the receipt text first.');
      return;
    }

    setScanning(true);

    timerRef.current = setTimeout(() => {
      setScanning(false);

      if (text.trim() !== '') {
        const parsed = parseTransaction(text);
        if (!parsed.ok) {
          setError('I could not find an amount in that text.');
          return;
        }
        setResult({ ...parsed.entry, demo: false });
        return;
      }

      const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
      setResult({
        type: 'expense',
        amount: 100 + (file.size % 1900),
        category: detectCategory(name, 'expense'),
        date: todayStr(),
        note: ('Receipt: ' + name).slice(0, 60),
        aiTagged: true,
        demo: true,
      });
    }, 1400);
  }

  return (
    <Modal title="Scan Receipt" onClose={onClose} wide>
      <div className="space-y-4">
        <label className="relative block rounded-xl border-2 border-dashed p-4 text-center cursor-pointer overflow-hidden hover:border-emerald-500/60 transition" style={{ borderColor: 'var(--glass-border)' }}>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Receipt preview" className="mx-auto max-h-40 rounded-lg object-contain" />
              {scanning && <div className="scan-line" />}
            </div>
          ) : (
            <div className="t-muted text-sm py-4">
              <Upload className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
              Click to upload a receipt image
            </div>
          )}
        </label>

        <p className="text-center text-xs t-muted">or</p>

        <div>
          <label htmlFor="receipt-text" className="text-xs t-muted mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Paste receipt / SMS text
          </label>
          <textarea id="receipt-text" rows={3} className="field resize-none" placeholder={PLACEHOLDER} value={text} onChange={(e) => setText(e.target.value)} />
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        {result && (
          <div className="rounded-xl p-4 border border-emerald-500/40 bg-emerald-500/10 fade-up">
            <p className="text-xs font-semibold text-emerald-400 mb-2">Extracted details</p>
            <dl className="grid grid-cols-2 gap-y-1 text-sm">
              <dt className="t-muted">Amount</dt><dd className="font-semibold t-main">{formatINR(result.amount)}</dd>
              <dt className="t-muted">Category</dt><dd className="font-semibold t-main">{result.category}</dd>
              <dt className="t-muted">Date</dt><dd className="font-semibold t-main">{formatLongDate(result.date)}</dd>
              <dt className="t-muted">Note</dt><dd className="font-semibold t-main truncate">{result.note}</dd>
            </dl>
            {result.demo && <p className="text-xs t-muted mt-2">Demo scan: text is not read from images in the browser, so please check these values.</p>}
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={handleScan} disabled={scanning} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-60">
            {scanning && <LoaderCircle className="w-4 h-4 animate-spin" />}
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
          <button type="button" disabled={!result} onClick={() => onExtracted(result)} className="btn-emerald flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            Review &amp; Add
          </button>
        </div>
      </div>
    </Modal>
  );
}
