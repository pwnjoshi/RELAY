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
  config?: Record<string, any>;
}

interface IntegrationConfigModalProps {
  isOpen: boolean;
  integration: IntegrationItem | null;
  locations?: any[];
  onClose: () => void;
  onSave: (updated: IntegrationItem) => void;
}

export function IntegrationConfigModal({
  isOpen,
  integration,
  locations = [],
  onClose,
  onSave
}: IntegrationConfigModalProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("loc_downtown");

  // Google OAuth Live State
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleAccountConnected, setGoogleAccountConnected] = useState(false);
  const [selectedCalId, setSelectedCalId] = useState("primary");
  const [freeBusyMask, setFreeBusyMask] = useState(true);

  // Salesforce State
  const [sfDomain, setSfDomain] = useState("https://login.salesforce.com");
  const [sfClientId, setSfClientId] = useState("");

  // HubSpot State
  const [hubspotToken, setHubspotToken] = useState("");

  // EHR State
  const [fhirEndpoint, setFhirEndpoint] = useState("https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4");

  // SIP State
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioToken, setTwilioToken] = useState("");
  const [outboundDid, setOutboundDid] = useState("+15550100");

  // Slack State
  const [slackWebhook, setSlackWebhook] = useState("");

  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (integration) {
      setTestResult(null);
      if (integration.id === "google_cal") {
        fetch(`/api/calendar?branchId=${selectedBranchId}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.ok && d.connected) {
              setGoogleAccountConnected(true);
              setGoogleEmail(d.config?.calendarEmail || "Authorized Google Account");
            } else {
              setGoogleAccountConnected(false);
              setGoogleEmail("");
            }
          })
          .catch(() => {
            setGoogleAccountConnected(false);
          });
      }

      // Restore saved configs from integration state
      if (integration.config) {
        if (integration.config.sfDomain) setSfDomain(integration.config.sfDomain);
        if (integration.config.sfClientId) setSfClientId(integration.config.sfClientId);
        if (integration.config.hubspotToken) setHubspotToken(integration.config.hubspotToken);
        if (integration.config.fhirEndpoint) setFhirEndpoint(integration.config.fhirEndpoint);
        if (integration.config.twilioSid) setTwilioSid(integration.config.twilioSid);
        if (integration.config.twilioToken) setTwilioToken(integration.config.twilioToken);
        if (integration.config.outboundDid) setOutboundDid(integration.config.outboundDid);
        if (integration.config.slackWebhook) setSlackWebhook(integration.config.slackWebhook);
      }
    }
  }, [integration, selectedBranchId]);

  if (!isOpen || !integration) return null;

  // Real Google OAuth 2.0 Redirection
  const handleStartOAuthFlow = async () => {
    try {
      const res = await fetch(`/api/calendar/auth-url?branchId=${selectedBranchId}`);
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
      } else {
        setTestResult({
          ok: false,
          message: data.error || "Failed to generate Google OAuth URL. Please verify server environment credentials."
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: `Failed to initiate Google OAuth: ${err.message}`
      });
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "disconnect",
          branchId: selectedBranchId
        })
      });
      if (res.ok) {
        setGoogleAccountConnected(false);
        setGoogleEmail("");
        setTestResult({
          ok: true,
          message: `Google Calendar disconnected for branch '${selectedBranchId}'.`
        });
      }
    } catch (err: any) {
      setTestResult({ ok: false, message: `Disconnect failed: ${err.message}` });
    }
  };

  // Real System Live Test Handshake
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const configPayload: Record<string, any> = {
      sfDomain,
      sfClientId,
      hubspotToken,
      fhirEndpoint,
      twilioSid,
      twilioToken,
      outboundDid,
      slackWebhook
    };

    try {
      const res = await fetch("/api/integrations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integrationId: integration.id,
          branchId: selectedBranchId,
          config: configPayload
        })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setTestResult({
          ok: true,
          message: data.message || "Live handshake verified: 200 OK."
        });
      } else {
        setTestResult({
          ok: false,
          message: data.error || "Connection test failed."
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: `Connection verification failed: ${err.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const configPayload: Record<string, any> = {
      sfDomain,
      sfClientId,
      hubspotToken,
      fhirEndpoint,
      twilioSid,
      twilioToken,
      outboundDid,
      slackWebhook,
      selectedBranchId
    };

    onSave({
      ...integration,
      status: integration.id === "google_cal" ? (googleAccountConnected ? "connected" : "disconnected") : "connected",
      email: integration.id === "google_cal" ? googleEmail : undefined,
      badge: "CONFIGURED",
      config: configPayload
    });
    onClose();
  };

  return (
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

        {/* Dynamic Integration Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* 1. Google Calendar & Workspace */}
          {integration.id === "google_cal" && (
            <div className="space-y-4">
              {locations && locations.length > 0 && (
                <div className="space-y-1">
                  <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                    Target Clinic Branch / Location
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-bold text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-bold text-[#0B1930] dark:text-white flex items-center gap-2 text-xs">
                      <span className={`w-2.5 h-2.5 rounded-full ${googleAccountConnected ? "bg-[#16A34A] animate-pulse" : "bg-[#98A2B3]"}`} />
                      <span>Google OAuth 2.0 Authorization</span>
                    </div>
                    <div className="text-[11px] text-[#667085] dark:text-[#9BA8B8] font-mono mt-0.5">
                      {googleAccountConnected ? `Connected: ${googleEmail}` : "Not Authenticated with Google"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {googleAccountConnected ? (
                      <>
                        <button
                          type="button"
                          onClick={handleStartOAuthFlow}
                          className="px-3 py-1.5 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white text-xs font-bold shadow-sm transition-all"
                        >
                          Switch Account
                        </button>
                        <button
                          type="button"
                          onClick={handleDisconnectGoogle}
                          className="px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-xs font-bold transition-all"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartOAuthFlow}
                        className="px-4 py-2 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
                      >
                        <Icons.Globe className="w-3.5 h-3.5 text-[#32C4BE]" />
                        <span>Sign in with Google &rarr;</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  Target Google Calendar ID
                </label>
                <input
                  type="text"
                  value={selectedCalId}
                  onChange={(e) => setSelectedCalId(e.target.value)}
                  placeholder="primary"
                  className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A]">
                <div>
                  <span className="font-bold text-[#0B1930] dark:text-[#F8FAFC] block">
                    Strict Free/Busy Privacy Masking
                  </span>
                  <span className="text-[10px] text-[#667085] dark:text-[#9BA8B8]">
                    Only expose open time slots. Meeting titles and attendees are masked.
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
              <div className="space-y-1">
                <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  Salesforce MyDomain / Instance URL
                </label>
                <input
                  type="url"
                  value={sfDomain}
                  onChange={(e) => setSfDomain(e.target.value)}
                  placeholder="https://yourcompany.my.salesforce.com"
                  className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  Connected App Client ID (Consumer Key)
                </label>
                <input
                  type="text"
                  value={sfClientId}
                  onChange={(e) => setSfClientId(e.target.value)}
                  placeholder="3MVG9... (from Salesforce App Manager)"
                  className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                />
              </div>
            </div>
          )}

          {/* 3. HubSpot CRM */}
          {integration.id === "hubspot" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  HubSpot Private App Access Token
                </label>
                <input
                  type="password"
                  value={hubspotToken}
                  onChange={(e) => setHubspotToken(e.target.value)}
                  placeholder="pat-na1-..."
                  className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                />
                <span className="text-[10px] text-[#667085] dark:text-[#9BA8B8] block">
                  Requires <code>crm.objects.contacts.read</code> and <code>crm.objects.contacts.write</code> scopes.
                </span>
              </div>
            </div>
          )}

          {/* 4. AthenaHealth / Epic EHR */}
          {integration.id === "athena_epic" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  HL7 / FHIR R4 Base Endpoint URL
                </label>
                <input
                  type="url"
                  value={fhirEndpoint}
                  onChange={(e) => setFhirEndpoint(e.target.value)}
                  placeholder="https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"
                  className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                />
              </div>
            </div>
          )}

          {/* 5. Twilio SIP */}
          {integration.id === "twilio_sip" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                    Twilio Account SID
                  </label>
                  <input
                    type="text"
                    value={twilioSid}
                    onChange={(e) => setTwilioSid(e.target.value)}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                    Auth Token
                  </label>
                  <input
                    type="password"
                    value={twilioToken}
                    onChange={(e) => setTwilioToken(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#0B1930] dark:text-[#F8FAFC]">
                  Outbound Caller ID (E.164 DID)
                </label>
                <input
                  type="text"
                  value={outboundDid}
                  onChange={(e) => setOutboundDid(e.target.value)}
                  placeholder="+15550100"
                  className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                />
              </div>
            </div>
          )}

          {/* 6. Slack & PagerDuty */}
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
                  placeholder="https://hooks.slack.com/services/T00/B00/XXXX"
                  className="w-full bg-[#FAFAF8] dark:bg-[#081426] border border-[#E4E8E7] dark:border-[#20324A] rounded-xl px-3 py-2 text-xs font-mono text-[#0B1930] dark:text-white outline-none focus:border-[#1B9A9C]"
                />
              </div>
            </div>
          )}

          {/* Live Test Feedback Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2 animate-fade-in ${
                testResult.ok
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
              }`}
            >
              <span className="font-bold">{testResult.ok ? "✓ Verified:" : "✕ Failed:"}</span>
              <span className="text-[11px] leading-relaxed flex-1">{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E4E8E7] dark:border-[#20324A]">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestConnection}
              className="px-3.5 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#081426] hover:bg-[#E4E8E7] dark:hover:bg-[#15294A] border border-[#E4E8E7] dark:border-[#20324A] text-[#0B1930] dark:text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isTesting ? <Icons.Activity className="w-3.5 h-3.5 animate-spin text-[#1B9A9C]" /> : <Icons.Zap className="w-3.5 h-3.5 text-[#1B9A9C]" />}
              <span>{isTesting ? "Testing Handshake..." : "Test Connection"}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-[#667085] hover:text-[#0B1930] dark:hover:text-white font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#0B1930] hover:bg-[#15294A] text-white font-bold text-xs shadow-sm transition-all"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
