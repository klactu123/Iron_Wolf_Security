import { useState } from "react";
import { Mail, Send, Clipboard, Trash2 } from "lucide-react";

const SAMPLE_EMAIL = `From: security-alerts@arnazon-account.com
Reply-To: verify@arnazon-secure.net
To: user@example.com
Subject: [URGENT] Your account has been compromised - Verify immediately
Date: Mon, 3 Mar 2026 08:15:22 -0500
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8
X-Mailer: PHPMailer 5.2.9

Dear Valued Customer,

We have detected unusual sign-in activity on your Amazon account. Your account has been temporarily limited until you verify your identity.

WHAT HAPPENED:
- Someone tried to log in to your account from an unrecognized device in Moscow, Russia
- Multiple failed password attempts were detected
- Your payment method may have been compromised

You must verify your identity within 24 hours or your account will be permanently suspended.

Click here to verify your account: https://arnazon-account-verify.com/secure/login.php?ref=3847291

If you do not verify within 24 hours:
1. Your account will be permanently locked
2. Any pending orders will be canceled
3. Your gift card balance will be forfeited

Thank you for your immediate attention to this matter.

Amazon Security Team
This is an automated message from Amazon.com, Inc.
© 2026 Amazon.com. All rights reserved.`;

export default function EmailInput({ onAnalyze, loading }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() && !loading) {
      onAnalyze(email);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setEmail(text);
    } catch {
      // Clipboard access denied — ignore
    }
  };

  const handleLoadSample = () => {
    setEmail(SAMPLE_EMAIL);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <textarea
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Paste the suspicious email here (including headers if available)..."
          className="w-full h-64 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-500 text-sm font-mono resize-y focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
          disabled={loading}
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            type="button"
            onClick={handlePaste}
            disabled={loading}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
            title="Paste from clipboard"
          >
            <Clipboard size={14} />
          </button>
          {email && (
            <button
              type="button"
              onClick={() => setEmail("")}
              disabled={loading}
              className="p-1.5 text-zinc-500 hover:text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
              title="Clear"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          type="button"
          onClick={handleLoadSample}
          disabled={loading}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
        >
          Load sample phishing email
        </button>

        <div className="flex items-center gap-3">
          {email && (
            <span className="text-xs text-zinc-600">
              {email.length.toLocaleString()} characters
            </span>
          )}
          <button
            type="submit"
            disabled={!email.trim() || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Send size={16} />
            {loading ? "Analyzing..." : "Analyze Email"}
          </button>
        </div>
      </div>
    </form>
  );
}
