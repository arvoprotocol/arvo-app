import Image from "next/image";

export function AppAccessGate({
  invalid = false,
}: {
  invalid?: boolean;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07090b] px-5 py-20 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[28%] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-[#c9846a]/[0.08] blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,#0b0d10)]" />
      </div>

      <div className="relative w-full max-w-[470px]">
        <div className="mb-10 flex justify-center">
          <Image
            src="/arvo-white.svg"
            alt="Arvo Protocol"
            width={170}
            height={45}
            priority
            className="h-auto w-[145px]"
          />
        </div>

        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035] shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur-xl">
          <div className="h-px bg-[linear-gradient(90deg,transparent,#c9846a,transparent)] opacity-70" />

          <div className="px-7 py-10 sm:px-10">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#c9846a]/20 bg-[#c9846a]/[0.07] px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e2a98e]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#e2a98e]">
                  Private access
                </span>
              </span>
            </div>

            <h1 className="mt-7 text-center text-4xl font-semibold tracking-[-0.045em]">
              Arvo App
            </h1>

            <p className="mx-auto mt-4 max-w-sm text-center text-[15px] leading-7 text-white/45">
              The Arvo App is currently in private preparation ahead of public access.
            </p>

            <form
              action="/api/app-access"
              method="post"
              className="mt-9"
            >
              <label
                htmlFor="password"
                className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35"
              >
                Access password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter password"
                className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-[15px] text-white outline-none transition placeholder:text-white/20 focus:border-[#c9846a]/50"
              />

              {invalid && (
                <p className="mt-3 text-sm text-[#e2a98e]">
                  That password is not recognised.
                </p>
              )}

              <button
                type="submit"
                className="mt-5 w-full rounded-xl bg-[linear-gradient(135deg,#b9775d,#e2a98e)] px-5 py-4 text-sm font-semibold text-[#07090b] transition hover:opacity-90"
              >
                Access app
              </button>
            </form>

            <p className="mt-7 text-center text-xs leading-5 text-white/25">
              Access is currently limited while the application and vault infrastructure are prepared.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
