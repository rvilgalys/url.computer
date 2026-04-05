import Footer from "../../components/Footer";
import NavHeader from "../../components/NavHeader";

export const metadata = {
  title: "url.computer — About",
  description: "About url.computer",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto p-4 md:p-8 max-w-5xl flex-1">
        <NavHeader activePage="about" />

        <main className="space-y-8 font-mono text-elf-light-blue/80">
          <h1 className="text-xl font-bold text-elf-yellow">About</h1>
          <section className="space-y-3">
            <p className="text-sm leading-relaxed">
              url.computer is a developer tool for parsing, editing, and working
              with URLs. It pairs with a{" "}
              <a
                href="https://curl.se/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-elf-light-blue underline underline-offset-2 hover:text-white transition-colors"
              >
                cURL
              </a>{" "}
              query builder. The entire app runs locally in the browser.
            </p>
            <p className="text-sm leading-relaxed">
              It's meant as a lightweight developer tool for quick URL parsing
              and querying, particularly in local development and debugging.
            </p>
            <p className="text-sm leading-relaxed">
              State is saved to the URL hash, allowing you to easily share the
              URLs you are working with. You can also save state to local
              storage (on your device-specific browser).
            </p>
            <p className="text-sm leading-relaxed">
              You can import plaintext URLs into the URL parser directly, for
              example{" "}
              <a
                href="https://url.computer/https://google.com/search?q=Google+in+1998"
                target="_blank"
                rel="noopener noreferrer"
                className="text-elf-light-blue underline underline-offset-2 hover:text-white transition-colors"
              >
                https://url.computer/https://google.com/search?q=Google+in+1998
              </a>
            </p>
            <p className="text-sm leading-relaxed">
              You can also use the <code>/clean</code> endpoint to clean up URLs
              and remove all query parameters that might be used for link
              tracking, for example{" "}
              <a
                href="https://url.computer/clean/https://sketchy.com/coolThing?tracking_id=asdf&utm_source=google"
                target="_blank"
                rel="noopener noreferrer"
                className="text-elf-light-blue underline underline-offset-2 hover:text-white transition-colors"
              >
                https://url.computer/clean/https://sketchy.com/coolThing?tracking_id=asdf&utm_source=google
              </a>
            </p>
            <p className="text-sm leading-relaxed">
              Developed by Rim Vilgalys (
              <a
                href="https://rim.computer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-elf-light-blue underline underline-offset-2 hover:text-white transition-colors"
              >
                rim.computer
              </a>
              ).
            </p>
            <p className="text-sm leading-relaxed">
              Built using{" "}
              <a
                href="https://nextjs.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-elf-light-blue underline underline-offset-2 hover:text-white transition-colors"
              >
                Next.js
              </a>
              ,{" "}
              <a
                href="https://tailwindcss.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-elf-light-blue underline underline-offset-2 hover:text-white transition-colors"
              >
                Tailwind CSS
              </a>
              , TypeScript, and{" "}
              <a
                href="https://github.com/pieroxy/lz-string"
                target="_blank"
                rel="noopener noreferrer"
                className="text-elf-light-blue underline underline-offset-2 hover:text-white transition-colors"
              >
                LZ-String
              </a>
              .
            </p>
            <p className="text-sm leading-relaxed">
              The source code is available on{" "}
              <a
                href="https://github.com/rvilgalys/url.computer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-elf-light-blue underline underline-offset-2 hover:text-white transition-colors"
              >
                GitHub
              </a>
              .
            </p>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
