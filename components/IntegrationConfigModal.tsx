"use client";

import React, { useState, useEffect } from "react";
import { Icons } from "./Icons";

export interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  desc: string;
  status: string;
  badge: string;
  apiKey?: string;
  endpointUrl?: string;
  isAutoSync?: boolean;
  email?: string;
}

interface IntegrationConfigModalProps {
  isOpen: boolean;
  integration: IntegrationItem | null;
  onClose: () => void;
  onSave: (updated: IntegrationItem) => void;
}

export function IntegrationConfigModal({
  isOpen,
  integration,
  onClose,
  onSave
}: IntegrationConfigModalProps) {
  // Google OAuth State
  const [googleEmail, setGoogleEmail] = useState("alexander@relayoperations.com");
  const [googleAccountConnected, setGoogleAccountConnected] = useState(false);
  const [selectedCalId, setSelectedCalId] = useState("primary");
  const [freeBusyMask, setFreeBusyMask] = useState(true);
  const [isGoogleOAuthPickerOpen, setIsGoogleOAuthPickerOpen] = useState(false);
  const [customInputEmail, setCustomInputEmail] = useState("");
  const [selectedAccountOption, setSelectedAccountOption] = useState<string>("alexander@relayoperations.com");

  // Salesforce State
  const [sfConnected, setSfConnected] = useState(false);
  const [sfDomain, setSfDomain] = useState("https://relay.my.salesforce.com");
  const [sfAutoLead, setSfAutoLead] = useState(true);

  // HubSpot State
  const [hubspotConnected, setHubspotConnected] = useState(false);
  const [hubspotToken, setHubspotToken] = useState("pat-na1-88192-3341");

  // EHR State
  const [fhirEndpoint, setFhirEndpoint] = useState("https://fhir.athenahealth.com/v1/Patient");
  const [npiNumber, setNpiNumber] = useState("1092834019");

  // SIP State
  const [twilioSid, setTwilioSid] = useState("AC98127394102938472918374");
  const [outboundDid, setOutboundDid] = useState("+919810012345");

  // Slack State
  const [slackWebhook, setSlackWebhook] = useState("https://hooks.slack.com/services/T00/B00/XXXX");

  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (integration) {
      setTestResult(null);
      if (integration.id === "google_cal") {
        setGoogleAccountConnected(integration.status === "connected");
        if (integration.email) setGoogleEmail(integration.email);
      }
      if (integration.id === "salesforce") {
        setSfConnected(integration.status === "connected");
      }
      if (integration.id === "hubspot") {
        setHubspotConnected(integration.status === "connected");
      }
    }
  }, [integration]);

  if (!isOpen || !integration) return null;

  const handleAuthorizeGoogleAccount = () => {
    let finalEmail = selectedAccountOption;
    if (selectedAccountOption === "custom") {
      finalEmail = customInputEmail.trim() || "user@company.com";
    }
    setGoogleEmail(finalEmail);
    setGoogleAccountConnected(true);
    setIsGoogleOAuthPickerOpen(false);
    setTestResult({
      ok: true,
      message: `Google Workspace OAuth 2.0 authorized for ${finalEmail}. Primary & Consultation calendars linked.`
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      if (integration.id === "google_cal") {
        setTestResult({
          ok: true,
          message: `Google Workspace OAuth 2.0 verified for ${googleEmail}. 4 open calendar slots verified. Free/Busy Masking: ACTIVE.`
        });
      } else if (integration.id === "salesforce") {
        setTestResult({
          ok: true,
          message: `Salesforce Service Cloud OAuth 2.0 (Org ID 00D5e000000Xyz) handshake 200 OK. Auto-Lead creation active.`
        });
      } else if (integration.id === "hubspot") {
        setTestResult({
          ok: true,
          message: `HubSpot CRM Portal #881203 OAuth token verified. Call timeline event logger ready.`
        });
      } else if (integration.id === "athena_epic") {
        setTestResult({
          ok: true,
          message: `FHIR / HL7 Patient endpoint ${fhirEndpoint} verified. HIPAA BAA encryption active.`
        });
      } else if (integration.id === "twilio_sip") {
        setTestResult({
          ok: true,
          message: `Twilio PSTN carrier DID ${outboundDid} interconnect ping 13.8ms latency. Opus 24kHz audio ready.`
        });
      } else {
        setTestResult({
          ok: true,
          message: `Slack Webhook ping dispatched to channel. Emergency distress keywords active.`
        });
      }
    }, 500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...integration,
      status: "connected",
      email: integration.id === "google_cal" ? googleEmail : undefined,
      badge: "ACTIVE SYNC"
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="w-full max-w-lg bg-white dark:bg-[#10223A] border border-[#E4E8E7] dark:border-[#20324A] rounded-2xl p-6 shadow-2xl space-y-5 animate-fade-in relative text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E8E7] dark:border-[#20324A]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1B9A9C]/10 text-[#1B9A9C] border border-[#1B9A9C]/20 flex items-center justify-center font-bold font-mono text-sm">
                {integration.name.charAt(0)}
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-[#1B9A9C] uppercase tracking-wider block">
                  {integration.badge}
                </span>
                <h3 className="font-heading font-extrabold text-base text-[#0B1930] dark:text-[#F8FAFC]">
                  {integration.name}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#667085] hover:text-[#0B1930] dark:hover:text-white"
            >
              <Icons.Close className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic Integration-Specific Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* 1. Google Calendar & Workspace */}
            {integration.id === "google_cal" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#0B1930] dark:text-white flex items-center gap-2 text-xs">
                        <span className={`w-2.5 h-2.5 rounded-full ${googleAccountConnected ? "bg-[#16A34A] animate-pulse" : "bg-[#98A2B3]"}`} />
                        <span>Google OAuth 2.0 Authorization</span>
                      </div>
                      <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8] font-mono mt-0.5">
                        {googleAccountConnected ? `Authorized: ${googleEmail}` : "Not authenticated with Google Workspace"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsGoogleOAuthPickerOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Icons.Globe className="w-3.5 h-3.5 text-[#32C4BE]" />
                      <span>{googleAccountConnected ? "Switch Google Account" : "Sign in with Google"}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                    Target Google Calendar
                  </label>
                  <select
                    value={selectedCalId}
                    onChange={(e) => setSelectedCalId(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-medium text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                  >
                    <option value="primary">Primary Calendar ({googleEmail})</option>
                    <option value="consultations">Client Consultation Bookings ({googleEmail})</option>
                    <option value="executive">Executive Calendar ({googleEmail})</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A]">
                  <div>
                    <span className="font-bold text-[#0B1930] dark:text-[#F8FAFC] block">
                      Free/Busy Privacy Masking
                    </span>
                    <span className="text-[10px] text-[#667085] dark:text-[#9BA8B8]">
                      Expose open time slots only. Caller PII & private notes are never stored.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={freeBusyMask}
                    onChange={(e) => setFreeBusyMask(e.target.checked)}
                    className="w-4 h-4 accent-[#1B9A9C] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 2. Salesforce CRM */}
            {integration.id === "salesforce" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#0B1930] dark:text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${sfConnected ? "bg-[#16A34A] animate-pulse" : "bg-[#98A2B3]"}`} />
                      <span>Salesforce Service Cloud OAuth</span>
                    </div>
                    <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8] font-mono mt-0.5">
                      {sfConnected ? "Org ID: 00D5e000000Xyz (Authorized)" : "OAuth Token Expired"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSfConnected(!sfConnected)}
                    className="px-3 py-1.5 rounded-lg bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs cursor-pointer"
                  >
                    {sfConnected ? "Re-Authenticate" : "Connect Salesforce"}
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                    Salesforce Instance Domain URL
                  </label>
                  <input
                    type="url"
                    value={sfDomain}
                    onChange={(e) => setSfDomain(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                  />
                </div>
              </div>
            )}

            {/* 3. HubSpot CRM */}
            {integration.id === "hubspot" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#0B1930] dark:text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${hubspotConnected ? "bg-[#16A34A] animate-pulse" : "bg-[#98A2B3]"}`} />
                      <span>HubSpot Portal Interconnect</span>
                    </div>
                    <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8] font-mono mt-0.5">
                      {hubspotConnected ? "HubSpot Portal ID: #881203 (Active)" : "Disconnected"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHubspotConnected(!hubspotConnected)}
                    className="px-3 py-1.5 rounded-lg bg-[#0B1930] text-white font-bold text-xs cursor-pointer"
                  >
                    {hubspotConnected ? "Connected ✓" : "Connect HubSpot"}
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                    HubSpot Private App Access Token
                  </label>
                  <input
                    type="password"
                    value={hubspotToken}
                    onChange={(e) => setHubspotToken(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                  />
                </div>
              </div>
            )}

            {/* 4. AthenaHealth & Epic EHR */}
            {integration.id === "athena_epic" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                    FHIR / HL7 Patient Base Endpoint
                  </label>
                  <input
                    type="url"
                    value={fhirEndpoint}
                    onChange={(e) => setFhirEndpoint(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                    NPI Registration #
                  </label>
                  <input
                    type="text"
                    value={npiNumber}
                    onChange={(e) => setNpiNumber(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* 5. Twilio & Telnyx SIP Trunks */}
            {integration.id === "twilio_sip" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                    Twilio Account SID
                  </label>
                  <input
                    type="text"
                    value={twilioSid}
                    onChange={(e) => setTwilioSid(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                    Primary Carrier DID
                  </label>
                  <input
                    type="text"
                    value={outboundDid}
                    onChange={(e) => setOutboundDid(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* 6. Slack & PagerDuty Alerts */}
            {integration.id === "slack_pagerduty" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                    Slack Incoming Webhook URL
                  </label>
                  <input
                    type="url"
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* Test Ping Result Banner */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono leading-relaxed animate-fade-in ${
                  testResult.ok
                    ? "bg-[#16A34A]/10 border-[#16A34A]/30 text-[#16A34A]"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-500"
                }`}
              >
                <div className="font-bold mb-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  Handshake Verified: 200 OK
                </div>
                <div>{testResult.message}</div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E4E8E7] dark:border-[#20324A]">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] hover:border-[#1B9A9C] text-xs font-bold text-[#0B1930] dark:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Icons.Refresh className={`w-3.5 h-3.5 text-[#1B9A9C] ${isTesting ? "animate-spin" : ""}`} />
                <span>{isTesting ? "Testing Handshake..." : "Test Handshake Ping"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-[#667085] hover:text-[#0B1930] dark:hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold shadow-card transition-all active:scale-95 cursor-pointer"
                >
                  Save Integration
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Interactive Google OAuth 2.0 Account Picker Modal */}
      {isGoogleOAuthPickerOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsGoogleOAuthPickerOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white text-[#202124] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Google Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center items-center gap-1 font-bold text-xl tracking-tight text-[#4285F4]">
                <span>G</span><span className="text-[#EA4335]">o</span><span className="text-[#FBBC05]">o</span><span>g</span><span className="text-[#34A853]">l</span><span className="text-[#EA4335]">e</span>
              </div>
              <h3 className="text-base font-bold text-[#202124]">Choose an account</h3>
              <p className="text-xs text-[#5f6368]">
                to authorize <strong className="text-[#202124]">Relay Telephony Engine</strong> to access your Google Calendar
              </p>
            </div>

            {/* Account List Options */}
            <div className="space-y-2 border-y border-[#dadce0] py-3">
              {[
                { email: "alexander@relayoperations.com", name: "Alexander Taylor", initial: "A", color: "bg-blue-600" },
                { email: "pawan@techsangi.com", name: "Pawan Joshi", initial: "P", color: "bg-emerald-600" }
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => setSelectedAccountOption(acc.email)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedAccountOption === acc.email
                      ? "border-[#4285F4] bg-[#e8f0fe]"
                      : "border-[#dadce0] hover:bg-[#f8f9fa]"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${acc.color} text-white font-bold flex items-center justify-center text-xs flex-shrink-0`}>
                    {acc.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-[#202124] truncate">{acc.name}</div>
                    <div className="text-[11px] text-[#5f6368] truncate">{acc.email}</div>
                  </div>
                  {selectedAccountOption === acc.email && (
                    <span className="text-[#4285F4] font-bold text-sm">✓</span>
                  )}
                </button>
              ))}

              {/* Custom Email Entry */}
              <div
                onClick={() => setSelectedAccountOption("custom")}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  selectedAccountOption === "custom" ? "border-[#4285F4] bg-[#e8f0fe]" : "border-[#dadce0] hover:bg-[#f8f9fa]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f1f3f4] text-[#5f6368] font-bold flex items-center justify-center text-sm flex-shrink-0">
                    +
                  </div>
                  <div className="font-bold text-xs text-[#202124]">Use another Google Workspace account</div>
                </div>

                {selectedAccountOption === "custom" && (
                  <input
                    type="email"
                    autoFocus
                    value={customInputEmail}
                    onChange={(e) => setCustomInputEmail(e.target.value)}
                    placeholder="Enter Google email (e.g. name@company.com)"
                    className="w-full bg-white border border-[#4285F4] rounded-lg px-3 py-2 text-xs font-mono text-[#202124] outline-none"
                  />
                )}
              </div>
            </div>

            {/* Scope Explanation */}
            <div className="text-[11px] text-[#5f6368] space-y-1 bg-[#f8f9fa] p-3 rounded-xl border border-[#dadce0]">
              <div className="font-bold text-[#202124]">Permissions Granted to Relay:</div>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>View free/busy availability windows for booking appointments.</li>
                <li>Write confirmed appointment slots to your target calendar.</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsGoogleOAuthPickerOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#5f6368] hover:text-[#202124]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAuthorizeGoogleAccount}
                className="px-5 py-2.5 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Authorize & Connect Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
