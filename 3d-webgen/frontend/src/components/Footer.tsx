
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-muted/30 mt-12">
      <div className="container mx-auto px-4 py-8">
        <Separator className="mb-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="font-semibold">2D to 3D Generation System</p>
            <p className="text-sm text-muted-foreground">Master's Thesis Project © {new Date().getFullYear()}</p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Deep Learning + Computer Vision + Web Technologies</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
