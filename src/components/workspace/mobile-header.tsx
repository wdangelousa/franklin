import { BrandMark } from "@/components/ui/brand-mark";
import { IconLogOut } from "@/components/ui/icons";
import { signOut } from "@/lib/auth/actions";
import type { SessionData } from "@/lib/auth/types";
import { getInitials } from "@/lib/utils";

interface MobileHeaderProps {
  session: SessionData;
}

export function MobileHeader({ session }: MobileHeaderProps) {
  return (
    <header className="mobile-header">
      <BrandMark compact href="/app/dashboard" />

      <div className="mobile-header-actions">
        <span className="user-avatar">{getInitials(session.user.name)}</span>
        <form action={signOut}>
          <button className="button-secondary" type="submit">
            <IconLogOut size={16} />
          </button>
        </form>
      </div>
    </header>
  );
}
