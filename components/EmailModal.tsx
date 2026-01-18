
import React, { useState } from 'react';
import { X, Mail, Send, FileText, Info, Download, CheckCircle2, Loader2, Link as LinkIcon, ClipboardCheck, History } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { CasinoData } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  defaultSubject: string;
  defaultBody: string;
  casinos: CasinoData[];
  onCopyLiveLink: () => Promise<boolean>;
  onCopySnapshot: () => Promise<boolean>;
}

const EmailModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  theme, 
  defaultSubject, 
  defaultBody, 
  casinos, 
  onCopyLiveLink,
  onCopySnapshot 
}) => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [copiedLive, setCopiedLive] = useState(false);
  const [copiedSnap, setCopiedSnap] = useState(false);

  if (!isOpen) return null;

  const generateVisualPDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('dashboard-capture-root');
      if (!element) throw new Error("Dashboard root not found");

      // Capture options optimized for full-page, high-fidelity export
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: theme === 'dark' ? '#020617' : '#f8fafc',
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        y: window.scrollY // offset from top
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Handle multi-page if content is very long
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Batumi_Casino_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      setPdfGenerated(true);
    } catch (err) {
      console.error("PDF Visual Export Error:", err);
      alert("Failed to capture dashboard visual. Please ensure your browser is not in zoomed mode.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLive = async () => {
    const success = await onCopyLiveLink();
    if (success) {
      setCopiedLive(true);
      setTimeout(() => setCopiedLive(false), 2000);
    }
  };

  const handleCopySnap = async () => {
    const success = await onCopySnapshot();
    if (success) {
      setCopiedSnap(true);
      setTimeout(() => setCopiedSnap(false), 2000);
    }
  };

  const handleSendEmail = () => {
    if (!pdfGenerated) {
      if (!confirm("PDF hasn't been downloaded. Proceed to email without it?")) {
        return;
      }
    }
    const brandedBody = `Dear Stakeholder,\n\nPlease find the Batumi Casino Market Performance Report summary below.\n\n${defaultBody}\n\nGenerated via Batumi Intelligence Engine.`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(brandedBody)}`;
    window.location.href = mailtoUrl;
  };

  const bgColor = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const inputBg = theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`${bgColor} w-full max-w-xl rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200`}>
        <div className="p-6 border-b flex justify-between items-center bg-slate-800/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tight uppercase">Export Intelligence</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={handleCopyLive}
              className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border transition-all active:scale-95 ${
                copiedLive ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {copiedLive ? <ClipboardCheck className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest block">Clean Link</span>
                <span className="text-[8px] opacity-60 uppercase font-bold tracking-tighter">Live Dashboard</span>
              </div>
            </button>

            <button 
              onClick={handleCopySnap}
              className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border transition-all active:scale-95 ${
                copiedSnap ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {copiedSnap ? <ClipboardCheck className="w-6 h-6" /> : <History className="w-6 h-6" />}
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest block">Snapshot Link</span>
                <span className="text-[8px] opacity-60 uppercase font-bold tracking-tighter">Frozen View</span>
              </div>
            </button>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800/50">
             <button 
              onClick={generateVisualPDF}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all active:scale-[0.98] ${
                pdfGenerated 
                  ? 'bg-emerald-600 border-emerald-500 text-white' 
                  : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500'
              }`}
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : pdfGenerated ? <CheckCircle2 className="w-5 h-5" /> : <Download className="w-5 h-5" />}
              <span className="text-xs font-black uppercase tracking-widest">
                {isGenerating ? "Capturing..." : pdfGenerated ? "Downloaded" : "Generate Report PDF"}
              </span>
            </button>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800/50">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Recipient Email</label>
              <input 
                type="email" 
                placeholder="Stakeholder email..."
                className={`w-full p-4 rounded-xl border ${inputBg} ${textColor} outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-800/20 border-t">
          <button 
            onClick={handleSendEmail}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase tracking-widest">Send Email Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
