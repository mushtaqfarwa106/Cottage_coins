"use client";

import { useEffect, useState } from "react";
import { emailReportsAPI } from "@/lib/api/email-reports";
import { EmailReportsHeader } from "./components/EmailReportsHeader";
import { EmailSettingsCard } from "./components/EmailSettingsCard";
import { ManualSendCard } from "./components/ManualSendCard";
import { EmailHistoryTable } from "./components/EmailHistoryTable";

export default function EmailReportsPage() {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [enabled, setEnabled] = useState(false);
  const [manualPeriod, setManualPeriod] = useState("monthly");
  const [history, setHistory] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [resendId, setResendId] = useState("");

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [settingsData, historyData] = await Promise.all([
        emailReportsAPI.getSettings(),
        emailReportsAPI.getHistory(),
      ]);
      setEmail(settingsData.email ?? "");
      setFrequency(settingsData.frequency ?? "monthly");
      setEnabled(Boolean(settingsData.enabled));
      setHistory(historyData.history ?? []);
    } catch (err) {
      setError(err.message || "Failed to load email report settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async () => {
    setError(null);
    setSuccess("");
    setIsSaving(true);
    try {
      const data = await emailReportsAPI.saveSettings({
        email,
        frequency,
        enabled,
      });
      setEmail(data.settings?.email ?? email);
      setFrequency(data.settings?.frequency ?? frequency);
      setEnabled(Boolean(data.settings?.enabled));
      setSuccess("Settings saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendNow = async () => {
    setError(null);
    setSuccess("");
    setIsSending(true);
    try {
      await emailReportsAPI.sendNow(manualPeriod);
      setSuccess("Report email sent successfully.");
      const historyData = await emailReportsAPI.getHistory();
      setHistory(historyData.history ?? []);
    } catch (err) {
      setError(err.message || "Failed to send report email");
    } finally {
      setIsSending(false);
    }
  };

  const handleResend = async (row) => {
    setError(null);
    setSuccess("");
    setResendId(row.id);
    try {
      await emailReportsAPI.resend({ reportId: row.id });
      setSuccess("Report email resent successfully.");
      const historyData = await emailReportsAPI.getHistory();
      setHistory(historyData.history ?? []);
    } catch (err) {
      setError(err.message || "Failed to resend report email");
    } finally {
      setResendId("");
    }
  };

  return (
    <div className="space-y-6">
      <EmailReportsHeader />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {success}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          Loading email reports...
        </div>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <EmailSettingsCard
              email={email}
              frequency={frequency}
              enabled={enabled}
              onEmailChange={setEmail}
              onFrequencyChange={setFrequency}
              onEnabledChange={setEnabled}
              onSave={handleSaveSettings}
              isSaving={isSaving}
            />

            <ManualSendCard
              period={manualPeriod}
              onPeriodChange={setManualPeriod}
              onSendNow={handleSendNow}
              isSending={isSending}
            />
          </div>

          <EmailHistoryTable history={history} onResend={handleResend} resendId={resendId} />
        </>
      )}
    </div>
  );
}
