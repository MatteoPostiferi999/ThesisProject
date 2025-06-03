
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const TechnicalDetails = () => {
  return (
    <div id="technical-details" className="py-12">
      <h2 className="text-3xl font-bold mb-6 text-center">Technical Information</h2>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="model">Model Architecture</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">System Architecture</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium mb-2">Frontend</h4>
                  <p className="mb-4 text-muted-foreground">
                    Our user-friendly web interface allows users to easily upload 2D images
                    and interact with the generated 3D models.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>React-based user interface</li>
                    <li>WebGL for 3D rendering</li>
                    <li>Responsive design for all devices</li>
                    <li>Optimized for modern browsers</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Backend</h4>
                  <p className="mb-4 text-muted-foreground">
                    Our processing module uses a fine-tuned neural network to transform 2D images
                    into realistic 3D representations.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Deep learning pipeline for 3D reconstruction</li>
                    <li>Transfer learning on domain-specific datasets</li>
                    <li>Optimized for low-latency processing</li>
                    <li>Scalable architecture for high demand</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="model">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Model Adaptation</h3>
              
              <p className="mb-6">
                The core of our system is a pre-trained deep learning model, optimized via transfer 
                learning on a domain-specific dataset. This fine-tuning improves the quality and realism 
                of the 3D reconstructions, enabling the model to capture complex geometries and textures 
                more effectively.
              </p>
              
              <div className="bg-muted/30 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-medium mb-2">Technical Specifications</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Base Architecture:</p>
                    <p className="text-muted-foreground">Modified ResNet with 3D decoder</p>
                  </div>
                  <div>
                    <p className="font-medium">Training Dataset:</p>
                    <p className="text-muted-foreground">50,000+ aligned image-model pairs</p>
                  </div>
                  <div>
                    <p className="font-medium">Inference Time:</p>
                    <p className="text-muted-foreground">~3-5 seconds per image</p>
                  </div>
                  <div>
                    <p className="font-medium">Model Size:</p>
                    <p className="text-muted-foreground">245MB (optimized for web)</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border p-4 flex flex-col items-center justify-center text-center">
                <h4 className="text-base font-medium mb-2">Continuous Improvement</h4>
                <p className="text-sm text-muted-foreground">
                  Our model is continuously improving through user feedback and additional training.
                  Each generated model contributes to enhancing the system's accuracy and output quality.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Application Scope</h3>
              
              <p className="mb-6">
                A key application of the system lies in the early phases of product design and prototyping. 
                Given a known 3D object (e.g., a cup), the system can generate realistic variants by 
                applying new surface textures derived from 2D images, supporting rapid exploration of 
                design alternatives.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-muted/20 p-6 rounded-lg">
                  <h4 className="text-lg font-medium mb-2">Product Design</h4>
                  <p className="text-sm text-muted-foreground">
                    Rapidly prototype different design variations without manual 3D modeling.
                  </p>
                </div>
                
                <div className="bg-muted/20 p-6 rounded-lg">
                  <h4 className="text-lg font-medium mb-2">E-Commerce</h4>
                  <p className="text-sm text-muted-foreground">
                    Create interactive 3D previews from product photography for enhanced shopping experiences.
                  </p>
                </div>
                
                <div className="bg-muted/20 p-6 rounded-lg">
                  <h4 className="text-lg font-medium mb-2">Education</h4>
                  <p className="text-sm text-muted-foreground">
                    Transform diagrams and illustrations into 3D models for immersive learning.
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                <h4 className="text-lg font-medium mb-2">Research Contribution</h4>
                <p className="text-muted-foreground">
                  This project connects academic research in computer vision with practical deployment 
                  through web technologies, offering insight into how AI can support design and visual 
                  computing workflows.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TechnicalDetails;
