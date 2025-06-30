import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Code2, 
  Zap,
  Heart,
  Github,
  Linkedin,
  Mail
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: "https://github.com/Matteopostiferi999", label: "GitHub" },
    { icon: Mail, href: "mailto:matteo.postiferi@gmail.com", label: "Contact" },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* 🌌 Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950" />
      
      {/* ✨ Floating Particles Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse`}
            style={{
              left: `${25 + i * 20}%`,
              top: `${40 + (i % 2) * 20}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative container mx-auto px-4 py-8">
        
        {/* 🎨 Custom Gradient Separator */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          </div>
          <div className="relative flex justify-center">
            <div className="px-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-900 dark:to-slate-900">
              <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* 📱 Main Content - Layout Orizzontale Compatto */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-6">
          
          {/* 🏢 Brand Section */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                2D to 3D Generation
              </h3>
              <p className="text-sm text-muted-foreground">
                Master's Thesis Project
              </p>
            </div>
          </div>

          {/* 🚀 Innovation Stats - Compatti */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl border border-blue-200 dark:border-blue-800">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                AI Powered
              </span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-xl border border-purple-200 dark:border-purple-800">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                3D Generation
              </span>
            </div>
          </div>

          {/* 🔗 Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white transition-all duration-300 transform hover:scale-110 group"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4 group-hover:animate-pulse" />
              </a>
            ))}
          </div>

        </div>

        {/* 📜 Bottom Credits - Single Line */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">

            
            <div className="flex items-center gap-3">
              <span>Bachelor's Thesis Project</span>
              <span>•</span>
              <span>React + TypeScript</span>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;