// Re-mounts on each navigation inside the app, so page content eases in while the shell stays still.
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="arvo-page">{children}</div>;
}
