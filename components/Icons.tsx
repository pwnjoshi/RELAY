import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

const createHugeicon = (pathData: (props: IconProps) => React.ReactNode) => {
  return function HugeIcon({ size = 18, className = "", ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {pathData({ size, className, ...props })}
      </svg>
    );
  };
};

export const Icons = {
  // Telephony & Voice
  Phone: createHugeicon(() => (
    <>
      <path d="M14.05 6A5 5 0 0 1 18 9.94M14.05 2A9 9 0 0 1 22 9.94" />
      <path d="M18.99 15.58a11.16 11.16 0 0 1-5.57-5.57l1.7-1.7a1.41 1.41 0 0 0 .33-1.46 8.85 8.85 0 0 0-1.87-3.18 1.42 1.42 0 0 0-1.22-.47H8.5a1.42 1.42 0 0 0-1.42 1.42A14.92 14.92 0 0 0 22 19.5a1.42 1.42 0 0 0 1.42-1.42v-3.86a1.42 1.42 0 0 0-.47-1.22 8.85 8.85 0 0 0-3.18-1.87 1.41 1.41 0 0 0-1.46.33z" />
    </>
  )),
  PhoneCall: createHugeicon(() => (
    <>
      <path d="M14 3a8 8 0 0 1 7 7M14 6a4 4 0 0 1 3.5 3.5" />
      <path d="M20.9 16.5a11.5 11.5 0 0 1-5.7-5.7l1.8-1.8a1.5 1.5 0 0 0 .3-1.5 9 9 0 0 0-2-3.3A1.5 1.5 0 0 0 14 3.7h-3.9a1.5 1.5 0 0 0-1.5 1.5A15.8 15.8 0 0 0 23.8 20.4a1.5 1.5 0 0 0 1.5-1.5v-3.9a1.5 1.5 0 0 0-.5-1.1 9 9 0 0 0-3.3-2 1.5 1.5 0 0 0-1.5.3z" transform="scale(0.85) translate(2, 2)" />
    </>
  )),
  PhoneIncoming: createHugeicon(() => (
    <>
      <path d="M16 2v6h6M21 3l-7 7" />
      <path d="M21 16.5a12 12 0 0 1-6-6l2-2a1.5 1.5 0 0 0 .3-1.5 9.5 9.5 0 0 0-2.1-3.4 1.5 1.5 0 0 0-1.3-.5H10a1.5 1.5 0 0 0-1.5 1.5A16.5 16.5 0 0 0 24 21.5a1.5 1.5 0 0 0 1.5-1.5v-3.9a1.5 1.5 0 0 0-.5-1.3 9.5 9.5 0 0 0-3.4-2.1 1.5 1.5 0 0 0-1.5.3z" transform="scale(0.8) translate(3, 4)" />
    </>
  )),
  PhoneOutgoing: createHugeicon(() => (
    <>
      <path d="M22 8V2h-6M15 9l7-7" />
      <path d="M21 16.5a12 12 0 0 1-6-6l2-2a1.5 1.5 0 0 0 .3-1.5 9.5 9.5 0 0 0-2.1-3.4 1.5 1.5 0 0 0-1.3-.5H10a1.5 1.5 0 0 0-1.5 1.5A16.5 16.5 0 0 0 24 21.5a1.5 1.5 0 0 0 1.5-1.5v-3.9a1.5 1.5 0 0 0-.5-1.3 9.5 9.5 0 0 0-3.4-2.1 1.5 1.5 0 0 0-1.5.3z" transform="scale(0.8) translate(3, 4)" />
    </>
  )),

  // Multilingual & Global
  Globe: createHugeicon(() => (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20" />
    </>
  )),

  // Excel / CSV / Batch Campaign
  FileSpreadsheet: createHugeicon(() => (
    <>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h8M8 17h8M12 13v8" />
    </>
  )),
  Upload: createHugeicon(() => (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  )),
  Download: createHugeicon(() => (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>
  )),

  // IAM, Roles & Organizations
  Key: createHugeicon(() => (
    <>
      <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5M10 14a4 4 0 1 1 5.66-5.66L22 2v4h-2v2h-2v2l-2.34 2.34A4 4 0 0 1 10 14z" />
    </>
  )),
  Lock: createHugeicon(() => (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  )),
  Shield: createHugeicon(() => (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </>
  )),
  Users: createHugeicon(() => (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  )),
  Mail: createHugeicon(() => (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  )),
  UserPlus: createHugeicon(() => (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </>
  )),
  UserCheck: createHugeicon(() => (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </>
  )),
  Building: createHugeicon(() => (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </>
  )),
  Department: createHugeicon(() => (
    <>
      <path d="M2 20h20M5 20V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <line x1="9" y1="10" x2="9.01" y2="10" />
      <line x1="15" y1="10" x2="15.01" y2="10" />
      <line x1="9" y1="14" x2="9.01" y2="14" />
      <line x1="15" y1="14" x2="15.01" y2="14" />
    </>
  )),
  Layers: createHugeicon(() => (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  )),

  // Clinical Safety & Shield
  ShieldAlert: createHugeicon(() => (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  )),
  ShieldCheck: createHugeicon(() => (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </>
  )),

  // Operations & Diagnostics
  Activity: createHugeicon(() => (
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  )),
  TrendingUp: createHugeicon(() => (
    <>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </>
  )),
  BarChart: createHugeicon(() => (
    <>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </>
  )),
  Cpu: createHugeicon(() => (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="15" x2="23" y2="15" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="15" x2="4" y2="15" />
    </>
  )),
  Terminal: createHugeicon(() => (
    <>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </>
  )),
  Sparkles: createHugeicon(() => (
    <>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </>
  )),
  Zap: createHugeicon(() => (
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  )),
  Flame: createHugeicon(() => (
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  )),

  // Controls & UI Essentials
  Calendar: createHugeicon(() => (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  )),
  Clock: createHugeicon(() => (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  )),
  Search: createHugeicon(() => (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  )),
  Refresh: createHugeicon(() => (
    <>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </>
  )),
  Copy: createHugeicon(() => (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  )),
  Check: createHugeicon(() => (
    <polyline points="20 6 9 17 4 12" />
  )),
  CheckCircle: createHugeicon(() => (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  )),
  Close: createHugeicon(() => (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  )),
  ChevronRight: createHugeicon(() => (
    <polyline points="9 18 15 12 9 6" />
  )),
  ChevronDown: createHugeicon(() => (
    <polyline points="6 9 12 15 18 9" />
  )),
  ArrowUpRight: createHugeicon(() => (
    <>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </>
  )),
  Play: createHugeicon(() => (
    <polygon points="5 3 19 12 5 21 5 3" />
  )),
  Pause: createHugeicon(() => (
    <>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </>
  )),
  CreditCard: createHugeicon(() => (
    <>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </>
  )),
  DollarSign: createHugeicon(() => (
    <>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  )),
  RotateCw: createHugeicon(() => (
    <>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </>
  )),
  Settings: createHugeicon(() => (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  )),
  Sun: createHugeicon(() => (
    <>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </>
  )),
  Moon: createHugeicon(() => (
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  )),
  Plus: createHugeicon(() => (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  )),
  FileText: createHugeicon(() => (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </>
  )),
  AlertTriangle: createHugeicon(() => (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  )),
  Menu: createHugeicon(() => (
    <>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>
  )),
  BookOpen: createHugeicon(() => (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ))
};
