import { Header } from "@/components/header";

export default function AboutPage() {
  return (
    <div className="home-scope">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-32">
        <h1 className="text-3xl font-bold mb-6">About</h1>
        <p className="text-lg text-muted-foreground">
          Welcome to our Sui Hackathon 2025 project.
        </p>
      </div>
    </div>
  );
}
