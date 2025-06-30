import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Cpu, 
  Globe, 
  Brain, 
  Layers, 
  Zap, 
  Monitor,
  Server,
  Database,
  Code,
  Target,
  Sparkles,
  Eye,
  Clock,
  HardDrive,
  MessageSquare,
  Cloud,
  TrendingUp
} from "lucide-react";
import { useState } from "react";

const TechnicalDetails = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabConfig = {
    overview: { icon: Globe, color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
    architecture: { icon: Layers, color: "text-purple-500", bgColor: "bg-purple-100 dark:bg-purple-900/30" }
  };

  return (
    <div id="technical-details" className="relative py-12">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 opacity-50" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-blue-400 rounded-full opacity-20 animate-pulse`}
            style={{
              left: `${25 + i * 12}%`,
              top: `${35 + (i % 3) * 15}%`,
              animationDelay: `${i * 1}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Cpu className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Technical Implementation
            </h2>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Bachelor's thesis project: A web-based 2D to 3D generation system using modern technologies
          </p>
        </div>
        
        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          {/* Custom Tab List */}
          <div className="flex justify-center mb-6 mt-6">
            <TabsList className="grid grid-cols-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-xl min-h-[80px]">
              {Object.entries(tabConfig).map(([key, config]) => (
                <TabsTrigger 
                  key={key}
                  value={key} 
                  className={`relative px-8 py-5 rounded-xl transition-all duration-300 ${
                    activeTab === key 
                      ? `${config.bgColor} ${config.color} shadow-lg scale-105` 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <config.icon className="w-5 h-5" />
                    <span className="font-semibold">
                      {key === 'overview' && 'Project Overview'}
                      {key === 'architecture' && 'System Architecture'}
                    </span>
                  </div>
                  
                  {activeTab === key && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-50" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
              <CardContent className="p-8">
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Project Objectives
                  </h3>
                </div>
                
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl">
                  <p className="text-blue-800 dark:text-blue-200 text-lg leading-relaxed">
                    This bachelor's thesis project demonstrates the development of a complete web application 
                    that enables multiple users to generate 3D models from 2D images using state-of-the-art 
                    AI technology. The system showcases modern software engineering practices and scalable architecture.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Frontend Section */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500 rounded-xl">
                        <Monitor className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                        Frontend Experience
                      </h4>
                    </div>
                    
                    <p className="text-blue-800 dark:text-blue-200 mb-6">
                      Modern React-based interface providing seamless interaction with 3D generation pipeline,
                      optimized for multi-user concurrent access and real-time status updates.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: Code, label: "React + TypeScript", desc: "Modern stack" },
                        { icon: Eye, label: "WebGL Rendering", desc: "Real-time 3D" },
                        { icon: Zap, label: "Responsive Design", desc: "Multi-device" },
                        { icon: Globe, label: "User Management", desc: "Authentication" }
                      ].map((item, index) => (
                        <div key={index} className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                          <item.icon className="w-5 h-5 text-blue-500 mb-2" />
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {item.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Backend Section */}
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-500 rounded-xl">
                        <Server className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-xl font-semibold text-purple-900 dark:text-purple-100">
                        Backend Infrastructure
                      </h4>
                    </div>
                    
                    <p className="text-purple-800 dark:text-purple-200 mb-6">
                      Django-based REST API with Redis message queuing and Celery workers,
                      enabling scalable asynchronous processing on cloud GPU infrastructure.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: Database, label: "Django REST", desc: "API framework" },
                        { icon: MessageSquare, label: "Redis + Celery", desc: "Message queue" },
                        { icon: Cloud, label: "Lambda Labs", desc: "GPU processing" },
                        { icon: TrendingUp, label: "Scalable", desc: "Multi-user" }
                      ].map((item, index) => (
                        <div key={index} className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                          <item.icon className="w-5 h-5 text-purple-500 mb-2" />
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {item.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-8">
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
              <CardContent className="p-8">
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    System Architecture
                  </h3>
                </div>
                
                <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-2xl">
                  <h4 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-4">
                    Distributed Processing Pipeline
                  </h4>
                  <p className="text-purple-800 dark:text-purple-200 text-lg leading-relaxed">
                    The system implements a scalable microservices architecture with asynchronous processing, 
                    enabling multiple users to submit 3D generation requests concurrently while maintaining 
                    optimal resource utilization and response times.
                  </p>
                </div>
                
                {/* Architecture Components */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { 
                      icon: Monitor, 
                      title: "Frontend", 
                      description: "React + TypeScript SPA",
                      details: ["Component-based UI", "Real-time updates", "Responsive design", "User management"],
                      color: "blue"
                    },
                    { 
                      icon: Server, 
                      title: "Backend API", 
                      description: "Django REST Framework",
                      details: ["RESTful endpoints", "User authentication", "File handling", "Job management"],
                      color: "green"
                    },
                    { 
                      icon: MessageSquare, 
                      title: "Message Queue", 
                      description: "Redis + Celery",
                      details: ["Async task processing", "Job queue management", "Worker scaling", "Status tracking"],
                      color: "orange"
                    },
                    { 
                      icon: Cloud, 
                      title: "GPU Processing", 
                      description: "Lambda Labs GPU",
                      details: ["Hunyuan3D model", "CUDA acceleration", "High-performance computing", "Scalable resources"],
                      color: "purple"
                    }
                  ].map((component, index) => (
                    <div key={index} className={`p-6 bg-gradient-to-br ${
                      component.color === 'blue' ? 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800' :
                      component.color === 'green' ? 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800' :
                      component.color === 'orange' ? 'from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-orange-200 dark:border-orange-800' :
                      'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800'
                    } rounded-2xl border`}>
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                        component.color === 'blue' ? 'bg-blue-500' :
                        component.color === 'green' ? 'bg-green-500' :
                        component.color === 'orange' ? 'bg-orange-500' :
                        'bg-purple-500'
                      }`}>
                        <component.icon className="w-6 h-6 text-white" />
                      </div>
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
                        {component.title}
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 text-center">
                        {component.description}
                      </p>
                      <div className="space-y-1">
                        {component.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              component.color === 'blue' ? 'bg-blue-500' :
                              component.color === 'green' ? 'bg-green-500' :
                              component.color === 'orange' ? 'bg-orange-500' :
                              'bg-purple-500'
                            }`} />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {detail}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Data Flow */}
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100">
                      Processing Workflow
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[
                      "Image Upload",
                      "Queue Job",
                      "GPU Processing", 
                      "Model Generation",
                      "Result Delivery"
                    ].map((step, index) => (
                      <div key={index} className="text-center">
                        <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                          {index + 1}
                        </div>
                        <p className="text-sm text-indigo-800 dark:text-indigo-200">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TechnicalDetails;