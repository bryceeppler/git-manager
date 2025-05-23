import Link from "next/link";

export function NavbarBrand() {
  return (
    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
      <div>
        <h1 className="font-bold text-xl">Git<span className="font-swanky text-primary font-normal">Rekt</span></h1>
      </div>
    </Link>
  );
} 