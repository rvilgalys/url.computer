export default function Home() {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
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
          <h1 className="text-3xl font-bold text-white font-mono">
            url.computer
          </h1>
        </div>
      </header>

      <main className="space-y-6">
        <section className="p-6 rounded-lg border border-[#219ebc20] bg-[#0d3b52] shadow-md">
          <label
            htmlFor="url-input"
            className="block text-sm font-medium text-white mb-2"
          >
            URL Input
          </label>
          <input
            type="text"
            id="url-input"
            className="font-mono w-full p-3 rounded-md text-white text-lg bg-elf-dark-blue border border-elf-mid-blue focus:outline-2 focus:outline-offset-2 focus:outline-elf-yellow focus:border-transparent"
            placeholder="https://api.example.com/v1/users?token=..."
          />
        </section>
      </main>
    </div>
  );
}
