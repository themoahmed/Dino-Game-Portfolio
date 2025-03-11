import DinoGameWithClientCheck from "../components/DinoGame";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="navbar">{/* Navbar placeholder */}</nav>
      <div className="flex justify-center mt-[50px]">
        <aside className="ad-component">{/* Ad component placeholder */}</aside>
        <DinoGameWithClientCheck />
        <aside className="text-box">{/* Text box placeholder */}</aside>
      </div>
      <footer className="leaderboard">{/* Leaderboard placeholder */}</footer>
    </div>
  );
}
