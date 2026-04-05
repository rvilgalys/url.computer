import Link from "next/link";

interface NavHeaderProps {
  activePage?: "docs" | "about";
}

export default function NavHeader({ activePage }: NavHeaderProps) {
  return (
    <header className="mb-12">
      <div className="flex items-center gap-4">
        <Link href="/">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 8L10 12L6 16"
              stroke="#8ecae6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 16H18"
              stroke="#ffb703"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </Link>
        <Link
          href="/"
          className="text-3xl font-bold text-elf-light-blue font-mono hover:text-white transition-colors"
        >
          url.computer
        </Link>
        <span className="text-elf-light-blue/20">|</span>
        <nav className="flex items-center gap-3">
          <Link
            href="/docs"
            className={`font-mono text-sm transition-colors ${
              activePage === "docs"
                ? "text-elf-light-blue"
                : "text-elf-light-blue/50 hover:text-elf-light-blue"
            }`}
          >
            docs
          </Link>
          <Link
            href="/about"
            className={`font-mono text-sm transition-colors ${
              activePage === "about"
                ? "text-elf-light-blue"
                : "text-elf-light-blue/50 hover:text-elf-light-blue"
            }`}
          >
            about
          </Link>
        </nav>
      </div>
    </header>
  );
}
