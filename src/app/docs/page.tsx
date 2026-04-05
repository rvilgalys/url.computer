import Footer from "../../components/Footer";
import NavHeader from "../../components/NavHeader";

export const metadata = {
  title: "url.computer — Docs",
  description: "Documentation for url.computer",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto p-4 md:p-8 max-w-5xl flex-1">
        <NavHeader activePage="docs" />

        <main className="space-y-8 font-mono text-elf-light-blue/80">
          <h1 className="text-2xl font-bold text-elf-light-blue">Docs</h1>

          <section className="space-y-3">
            <h2 className="text-lg text-elf-light-blue">URL Analyzer</h2>
            <p className="text-sm leading-relaxed">
              Paste any URL into the input field to break it down into its
              components: protocol, hostname, path, query parameters, and
              fragment. Edit any component and the full URL updates in real time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg text-elf-light-blue">cURL Builder</h2>
            <p className="text-sm leading-relaxed">
              Build{" "}
              <a
                href="https://curl.se/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-elf-light-blue underline underline-offset-2 hover:text-white transition-colors"
              >
                cURL
              </a>{" "}
              commands from your URL. Select an HTTP method, add
              headers, set a request body, and apply common recipes (JSON body,
              Bearer token, verbose mode, etc.). The generated command updates
              live and can be copied with one click.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg text-elf-light-blue">Shareable Links</h2>
            <p className="text-sm leading-relaxed">
              Your entire session state is compressed with{" "}
              <a
                href="https://github.com/pieroxy/lz-string"
                target="_blank"
                rel="noopener noreferrer"
                className="text-elf-light-blue underline underline-offset-2 hover:text-white transition-colors"
              >
                LZ-String
              </a>{" "}
              and stored in the URL hash.
              Copy the shareable link to send your exact URL + cURL configuration
              to a colleague — they&apos;ll see exactly what you see.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg text-elf-light-blue">Saved States</h2>
            <p className="text-sm leading-relaxed">
              Save your current configuration to localStorage for quick access
              later. Manage saved states from the sidebar — rename, load, or
              delete them as needed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg text-elf-light-blue">Privacy</h2>
            <p className="text-sm leading-relaxed">
              Everything runs in your browser. No data is ever sent to a server.
              Your URLs, headers, and tokens stay on your machine.
            </p>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
