import { NavbarBrand } from "./navbar-brand";
import { NavbarUserMenu } from "./navbar-user-menu";

export function Navbar() {
  return (
    <nav className="w-full bg-card">
      <div className="mx-auto px-4 h-16 flex items-center justify-between">
        <NavbarBrand />
        <NavbarUserMenu />
      </div>
    </nav>
  );
} 