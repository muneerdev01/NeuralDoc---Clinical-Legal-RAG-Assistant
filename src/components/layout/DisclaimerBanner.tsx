import React from 'react';
import { AlertCircle, ShieldAlert, FileText, Info } from 'lucide-react';
import { DocumentCategory } from '../../types';

interface DisclaimerBannerProps {
  category?: DocumentCategory | null;
  showPrivacyNotice?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  category,
  showPrivacyNotice = false,
}) => {
  return (
    <div className="space-y-2 mb-4">
      {/* Category-Specific Banner */}
      {category === 'clinical' && (
        <div
          id="clinical-mode-banner"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-200 text-xs font-medium"
        >
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Clinical Intelligence Mode:</strong> Document-grounded clinical information. Not medical advice. Never substitute for physician clinical assessment.
          </span>
        </div>
      )}

      {category === 'legal' && (
        <div
          id="legal-mode-banner"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-indigo-200 text-xs font-medium"
        >
          <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <strong>Legal Intelligence Mode:</strong> Document-grounded legal information. Not legal advice. Never substitute for licensed legal counsel.
          </span>
        </div>
      )}

      {/* Privacy Notice for Uploads */}
      {showPrivacyNotice && (
        <div
          id="privacy-warning-banner"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs"
        >
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Privacy Warning:</strong> Do not upload real patient records, confidential legal documents, credentials, or other sensitive information to this demo deployment. Use synthetic demo data.
          </span>
        </div>
      )}
    </div>
  );
};
