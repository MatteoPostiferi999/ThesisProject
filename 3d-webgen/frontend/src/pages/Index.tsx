import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ModelWorkflow from "@/components/ModelWorkflow";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Hero />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <ModelWorkflow />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
