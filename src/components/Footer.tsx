import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 py-6 border-t border-elf-light-blue/10">
      <div className="container mx-auto max-w-5xl px-4 md:px-8 flex items-center justify-between font-mono text-xs text-elf-light-blue/40">
        <span>&copy; 2025 url.computer</span>
        <div className="flex items-center gap-4">
          <Link
            href="/docs"
            className="hover:text-elf-light-blue transition-colors"
          >
            docs
          </Link>
          <Link
            href="/about"
            className="hover:text-elf-light-blue transition-colors"
          >
            about
          </Link>
          <a
            href="https://github.com/rvilgalys/url.computer"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-elf-light-blue transition-colors"
          >
            github
          </a>
        </div>
      </div>
    </footer>
  );
}
