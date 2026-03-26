"use client";

import { signInAsDemoUser } from "@/lib/auth/actions";
import { DEFAULT_DEMO_ACCOUNT, DEMO_ACCOUNTS } from "@/lib/auth/config";

export function SignInForm() {
  return (
    <div className="login-form">
      <form action={signInAsDemoUser}>
        <input name="accountId" type="hidden" value={DEFAULT_DEMO_ACCOUNT.id} />
        <button className="login-enter-button" type="submit">
          Entrar
        </button>
      </form>
      <div className="login-alt-accounts">
        {DEMO_ACCOUNTS.filter((a) => a.id !== DEFAULT_DEMO_ACCOUNT.id).map(
          (account) => (
            <form key={account.id} action={signInAsDemoUser}>
              <input name="accountId" type="hidden" value={account.id} />
              <button className="login-alt-button" type="submit">
                {account.name}
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
}
