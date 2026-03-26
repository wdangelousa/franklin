import Image from "next/image";

import { SignInForm } from "@/components/auth/sign-in-form";

export default function LoginPage() {
  return (
    <main className="login-screen">
      <div className="login-content">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icone-franklin-240.png"
          alt="Franklin"
          width={120}
          height={120}
          className="login-icon"
        />
        <p className="login-title">Sistema de propostas</p>
        <SignInForm />
      </div>
      <footer className="login-footer">
        <Image
          src="/logo.png"
          alt="Onebridge Stalwart"
          width={150}
          height={30}
          className="login-footer-logo"
          style={{ width: "auto", height: "auto" }}
        />
      </footer>
    </main>
  );
}
