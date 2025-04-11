"use client";

import React, { useState } from 'react';
import { Layers, Zap, Settings, BookOpen, Code, BarChart2, Brain, Database, Award, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';

const DeepLearningGuide = () => {
  // State to track expanded sections
  const [expandedSections, setExpandedSections] = useState({
    basics: true,
    architecture: false,
    training: false,
    types: false,
    applications: false
  });

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-full bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <Brain size={36} className="mr-3" />
              <h1 className="text-3xl font-bold">Deep Learning: A Visual Guide</h1>
            </div>
            <p className="text-center max-w-2xl mx-auto text-blue-100">
              A concise introduction to deep learning concepts, architecture, and applications
            </p>
          </div>

          {/* Content sections */}
          <div className="p-6">
            {/* 1. What is Deep Learning? */}
            <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => toggleSection('basics')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 text-left"
                aria-expanded={expandedSections.basics}
              >
                <div className="flex items-center">
                  <BookOpen className="mr-3 text-blue-600" size={24} />
                  <h2 className="text-xl font-semibold text-slate-800">What is Deep Learning?</h2>
                </div>
                {expandedSections.basics ? 
                  <ChevronDown className="text-slate-500" size={20} /> : 
                  <ChevronRight className="text-slate-500" size={20} />
                }
              </button>
              
              {expandedSections.basics && (
                <div className="p-4 border-t border-slate-200">
                  <p className="mb-4">
                    Deep learning is a subset of machine learning that uses neural networks with multiple layers 
                    (deep neural networks) to analyze various forms of data.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-700 mb-2">Key Characteristics</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <ArrowRight size={16} className="mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>Automatically learns features from data without manual feature extraction</span>
                        </li>
                        <li className="flex items-start">
                          <ArrowRight size={16} className="mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>Improves with more data (unlike traditional algorithms that plateau)</span>
                        </li>
                        <li className="flex items-start">
                          <ArrowRight size={16} className="mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>Excels at finding patterns in unstructured data (images, text, audio)</span>
                        </li>
                        <li className="flex items-start">
                          <ArrowRight size={16} className="mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>Requires significant computational resources and large datasets</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h3 className="font-medium text-indigo-700 mb-2">How It Differs</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <div className="mr-2 flex-shrink-0 font-medium">Traditional ML:</div>
                          <span>Requires manual feature engineering and works best with structured data</span>
                        </div>
                        <div className="flex items-start">
                          <div className="mr-2 flex-shrink-0 font-medium">Deep Learning:</div>
                          <span>Automatically extracts features and excels with large, complex datasets</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                    <h3 className="font-medium text-amber-700 mb-2">The Inspiration: The Human Brain</h3>
                    <p className="text-sm">
                      Deep learning is loosely inspired by the structure of the human brain, with artificial neurons organized in layers that process information. However, these neural networks are significant simplifications of actual biological neural systems.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* 2. Neural Network Architecture */}
            <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => toggleSection('architecture')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 text-left"
                aria-expanded={expandedSections.architecture}
              >
                <div className="flex items-center">
                  <Layers className="mr-3 text-blue-600" size={24} />
                  <h2 className="text-xl font-semibold text-slate-800">Neural Network Architecture</h2>
                </div>
                {expandedSections.architecture ? 
                  <ChevronDown className="text-slate-500" size={20} /> : 
                  <ChevronRight className="text-slate-500" size={20} />
                }
              </button>
              
              {expandedSections.architecture && (
                <div className="p-4 border-t border-slate-200">
                  <p className="mb-4">
                    Deep neural networks consist of multiple layers of interconnected nodes (neurons) that process and transform data.
                  </p>
                  
                  <div className="bg-white p-4 border rounded-lg mb-4">
                    <h3 className="font-medium text-slate-700 mb-2">Basic Structure</h3>
                    
                    <div className="flex flex-col items-center">
                      {/* Visual representation of neural network */}
                      <div className="w-full max-w-lg h-64 relative mb-4">
                        {/* Input layer */}
                        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-center items-center">
                          <div className="text-xs text-center mb-2 font-medium text-blue-600">Input Layer</div>
                          <div className="w-8 h-8 rounded-full bg-blue-500 mb-3"></div>
                          <div className="w-8 h-8 rounded-full bg-blue-500 mb-3"></div>
                          <div className="w-8 h-8 rounded-full bg-blue-500 mb-3"></div>
                          <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                        </div>
                        
                        {/* Hidden layers */}
                        <div className="absolute left-1/4 top-0 bottom-0 w-16 flex flex-col justify-center items-center">
                          <div className="text-xs text-center mb-2 font-medium text-indigo-600">Hidden Layer 1</div>
                          <div className="w-8 h-8 rounded-full bg-indigo-500 mb-3"></div>
                          <div className="w-8 h-8 rounded-full bg-indigo-500 mb-3"></div>
                          <div className="w-8 h-8 rounded-full bg-indigo-500 mb-3"></div>
                          <div className="w-8 h-8 rounded-full bg-indigo-500"></div>
                        </div>
                        
                        <div className="absolute left-2/4 top-0 bottom-0 w-16 flex flex-col justify-center items-center -translate-x-1/2">
                          <div className="text-xs text-center mb-2 font-medium text-indigo-600">Hidden Layer 2</div>
                          <div className="w-8 h-8 rounded-full bg-indigo-500 mb-3"></div>
                          <div className="w-8 h-8 rounded-full bg-indigo-500 mb-3"></div>
                          <div className="w-8 h-8 rounded-full bg-indigo-500"></div>
                        </div>
                        
                        <div className="absolute left-3/4 top-0 bottom-0 w-16 flex flex-col justify-center items-center">
                          <div className="text-xs text-center mb-2 font-medium text-indigo-600">Hidden Layer 3</div>
                          <div className="w-8 h-8 rounded-full bg-indigo-500 mb-3"></div>
                          <div className="w-8 h-8 rounded-full bg-indigo-500 mb-3"></div>
                          <div className="w-8 h-8 rounded-full bg-indigo-500"></div>
                        </div>
                        
                        {/* Output layer */}
                        <div className="absolute right-0 top-0 bottom-0 w-16 flex flex-col justify-center items-center">
                          <div className="text-xs text-center mb-2 font-medium text-purple-600">Output Layer</div>
                          <div className="w-8 h-8 rounded-full bg-purple-500 mb-3"></div>
                          <div className="w-8 h-8 rounded-full bg-purple-500"></div>
                        </div>
                        
                        {/* Connection lines (simplified) */}
                        <div className="absolute inset-0 z-0">
                          <svg className="w-full h-full" viewBox="0 0 400 250">
                            {/* These lines are just representative */}
                            <path d="M40 50 L100 30" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M40 50 L100 70" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M40 90 L100 30" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M40 90 L100 70" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M40 130 L100 110" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M40 130 L100 150" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M40 170 L100 110" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M40 170 L100 150" stroke="#CBD5E1" strokeWidth="1" />
                            
                            <path d="M116 30 L200 50" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M116 70 L200 90" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M116 110 L200 50" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M116 150 L200 130" stroke="#CBD5E1" strokeWidth="1" />
                            
                            <path d="M216 50 L300 30" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M216 90 L300 70" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M216 130 L300 110" stroke="#CBD5E1" strokeWidth="1" />
                            
                            <path d="M316 30 L360 50" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M316 70 L360 90" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M316 110 L360 50" stroke="#CBD5E1" strokeWidth="1" />
                            <path d="M316 110 L360 90" stroke="#CBD5E1" strokeWidth="1" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="text-xs text-slate-500 text-center">
                        A simplified representation of a deep neural network with multiple hidden layers
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-700 text-sm">Input Layer</h4>
                      <p className="text-xs mt-1">
                        Receives raw data (e.g., pixel values of an image) and passes it to the first hidden layer
                      </p>
                    </div>
                    
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <h4 className="font-medium text-indigo-700 text-sm">Hidden Layers</h4>
                      <p className="text-xs mt-1">
                        Multiple layers that extract and transform features of increasing complexity and abstraction
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <h4 className="font-medium text-purple-700 text-sm">Output Layer</h4>
                      <p className="text-xs mt-1">
                        Produces the final prediction or classification result based on the processed information
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-medium text-slate-700 mb-2">Key Components</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-slate-700">Neurons (Nodes)</h4>
                        <p className="text-xs text-slate-600">
                          Computational units that take inputs, apply weights and biases, and output a value through an activation function
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-700">Weights & Biases</h4>
                        <p className="text-xs text-slate-600">
                          Adjustable parameters that determine the strength of connections between neurons and are updated during training
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-700">Activation Functions</h4>
                        <p className="text-xs text-slate-600">
                          Mathematical functions (like ReLU, Sigmoid, Tanh) that introduce non-linearity, allowing the network to learn complex patterns
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* 3. How Training Works */}
            <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => toggleSection('training')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 text-left"
                aria-expanded={expandedSections.training}
              >
                <div className="flex items-center">
                  <Settings className="mr-3 text-blue-600" size={24} />
                  <h2 className="text-xl font-semibold text-slate-800">How Training Works</h2>
                </div>
                {expandedSections.training ? 
                  <ChevronDown className="text-slate-500" size={20} /> : 
                  <ChevronRight className="text-slate-500" size={20} />
                }
              </button>
              
              {expandedSections.training && (
                <div className="p-4 border-t border-slate-200">
                  <p className="mb-4">
                    Training a deep neural network involves feeding it data, measuring its errors, and adjusting its parameters to improve performance.
                  </p>
                  
                  <div className="bg-white border rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-slate-700 mb-3">The Training Process</h3>
                    
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium">Forward Propagation</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            Input data passes through the network, with each layer performing computations and passing results to the next layer
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">2</div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium">Loss Calculation</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            The network's output is compared to the actual target values, and a loss function quantifies the error
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">3</div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium">Backpropagation</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            The error is propagated backward through the network to calculate how each weight contributes to the error
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">4</div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium">Weight Updates</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            An optimization algorithm (like gradient descent) updates the weights to reduce the error
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">5</div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium">Iteration</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            This process repeats many times with the entire dataset, with each complete pass called an "epoch"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h3 className="font-medium text-indigo-700 mb-2">Key Concepts</h3>
                      <ul className="space-y-2 text-xs">
                        <li className="flex items-start">
                          <div className="font-medium mr-1">Gradient Descent:</div>
                          <span>Optimization algorithm that adjusts weights in the direction that reduces error</span>
                        </li>
                        <li className="flex items-start">
                          <div className="font-medium mr-1">Learning Rate:</div>
                          <span>Controls how much weights are adjusted in each iteration (too high: unstable, too low: slow)</span>
                        </li>
                        <li className="flex items-start">
                          <div className="font-medium mr-1">Batch Size:</div>
                          <span>Number of training examples processed before weights are updated</span>
                        </li>
                        <li className="flex items-start">
                          <div className="font-medium mr-1">Overfitting:</div>
                          <span>When a model learns the training data too well, including noise, harming generalization</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h3 className="font-medium text-amber-700 mb-2">Training Challenges</h3>
                      <ul className="space-y-2 text-xs">
                        <li className="flex items-start">
                          <ArrowRight size={12} className="mr-1 mt-0.5 text-amber-500 flex-shrink-0" />
                          <span>Requires large amounts of labeled data for supervised learning</span>
                        </li>
                        <li className="flex items-start">
                          <ArrowRight size={12} className="mr-1 mt-0.5 text-amber-500 flex-shrink-0" />
                          <span>Computationally intensive, often requiring specialized hardware (GPUs, TPUs)</span>
                        </li>
                        <li className="flex items-start">
                          <ArrowRight size={12} className="mr-1 mt-0.5 text-amber-500 flex-shrink-0" />
                          <span>Hyperparameter tuning can be time-consuming (learning rate, batch size, etc.)</span>
                        </li>
                        <li className="flex items-start">
                          <ArrowRight size={12} className="mr-1 mt-0.5 text-amber-500 flex-shrink-0" />
                          <span>Balancing underfitting (too simple) and overfitting (too complex)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* 4. Types of Deep Learning Networks */}
            <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => toggleSection('types')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 text-left"
                aria-expanded={expandedSections.types}
              >
                <div className="flex items-center">
                  <Code className="mr-3 text-blue-600" size={24} />
                  <h2 className="text-xl font-semibold text-slate-800">Types of Deep Learning Networks</h2>
                </div>
                {expandedSections.types ? 
                  <ChevronDown className="text-slate-500" size={20} /> : 
                  <ChevronRight className="text-slate-500" size={20} />
                }
              </button>
              
              {expandedSections.types && (
                <div className="p-4 border-t border-slate-200">
                  <p className="mb-4">
                    Different types of deep learning architectures are specialized for specific tasks and data types.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Layers size={18} />
                        </div>
                        <h3 className="ml-2 font-medium text-slate-700">Convolutional Neural Networks (CNNs)</h3>
                      </div>
                      
                      <p className="text-xs mb-2">
                        Specialized for processing grid-like data, particularly images, using convolutional layers to extract spatial features.
                      </p>
                      
                      <div className="text-xs">
                        <div className="font-medium">Key Features:</div>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                          <li>Convolutional layers detect patterns like edges, textures, and shapes</li>
                          <li>Pooling layers reduce dimensionality and capture important features</li>
                          <li>Translation invariance (recognizes objects regardless of position)</li>
                        </ul>
                      </div>
                      
                      <div className="mt-2 text-xs text-slate-500">
                        <div className="font-medium">Common Uses:</div>
                        <p>Image classification, object detection, facial recognition</p>
                      </div>
                    </div>
                    
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <ArrowRight size={18} />
                        </div>
                        <h3 className="ml-2 font-medium text-slate-700">Recurrent Neural Networks (RNNs)</h3>
                      </div>
                      
                      <p className="text-xs mb-2">
                        Designed for sequential data, with connections that form directed cycles allowing the network to maintain a memory of previous inputs.
                      </p>
                      
                      <div className="text-xs">
                        <div className="font-medium">Key Features:</div>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                          <li>Hidden state acts as memory of previous inputs</li>
                          <li>LSTM and GRU variants solve vanishing gradient problems</li>
                          <li>Can process inputs of variable length</li>
                        </ul>
                      </div>
                      
                      <div className="mt-2 text-xs text-slate-500">
                        <div className="font-medium">Common Uses:</div>
                        <p>Text generation, language modeling, time series prediction</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <Zap size={18} />
                        </div>
                        <h3 className="ml-2 font-medium text-slate-700">Transformers</h3>
                      </div>
                      
                      <p className="text-xs mb-2">
                        Modern architecture that uses self-attention mechanisms to weigh the importance of different parts of the input data.
                      </p>
                      
                      <div className="text-xs">
                        <div className="font-medium">Key Features:</div>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                          <li>Attention mechanisms capture relationships between all positions</li>
                          <li>Highly parallelizable (faster training than RNNs)</li>
                          <li>Positional encoding to maintain sequence order</li>
                        </ul>
                      </div>
                      
                      <div className="mt-2 text-xs text-slate-500">
                        <div className="font-medium">Common Uses:</div>
                        <p>Language models (like GPT and BERT), translation, summarization</p>
                      </div>
                    </div>
                    
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <Database size={18} />
                        </div>
                        <h3 className="ml-2 font-medium text-slate-700">Other Specialized Networks</h3>
                      </div>
                      
                      <ul className="text-xs space-y-2">
                        <li>
                          <div className="font-medium">Generative Adversarial Networks (GANs):</div>
                          <p className="mt-0.5">Two competing networks that generate realistic data (images, text, etc.)</p>
                        </li>
                        <li>
                          <div className="font-medium">Autoencoders:</div>
                          <p className="mt-0.5">Learn efficient representations by compressing then reconstructing data</p>
                        </li>
                        <li>
                          <div className="font-medium">Graph Neural Networks:</div>
                          <p className="mt-0.5">Process data represented as graphs with nodes and edges</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* 5. Applications */}
            <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => toggleSection('applications')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 text-left"
                aria-expanded={expandedSections.applications}
              >
                <div className="flex items-center">
                  <BarChart2 className="mr-3 text-blue-600" size={24} />
                  <h2 className="text-xl font-semibold text-slate-800">Real-World Applications</h2>
                </div>
                {expandedSections.applications ? 
                  <ChevronDown className="text-slate-500" size={20} /> : 
                  <ChevronRight className="text-slate-500" size={20} />
                }
              </button>
              
              {expandedSections.applications && (
                <div className="p-4 border-t border-slate-200">
                  <p className="mb-4">
                    Deep learning powers many technologies and applications that we use daily.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <MessageSquare size={14} />
                        </div>
                        <h3 className="ml-2 font-medium text-sm">Natural Language Processing</h3>
                      </div>
                      <ul className="text-xs space-y-1 text-slate-600">
                        <li>• Translation services</li>
                        <li>• Chatbots and virtual assistants</li>
                        <li>• Text summarization</li>
                        <li>• Sentiment analysis</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <Image size={14} />
                        </div>
                        <h3 className="ml-2 font-medium text-sm">Computer Vision</h3>
                      </div>
                      <ul className="text-xs space-y-1 text-slate-600">
                        <li>• Facial recognition</li>
                        <li>• Medical image analysis</li>
                        <li>• Autonomous vehicles</li>
                        <li>• Augmented reality</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                          <Award size={14} />
                        </div>
                        <h3 className="ml-2 font-medium text-sm">Healthcare</h3>
                      </div>
                      <ul className="text-xs space-y-1 text-slate-600">
                        <li>• Disease diagnosis</li>
                        <li>• Drug discovery</li>
                        <li>• Patient monitoring</li>
                        <li>• Personalized treatment</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <BarChart2 size={14} />
                        </div>
                        <h3 className="ml-2 font-medium text-sm">Finance</h3>
                      </div>
                      <ul className="text-xs space-y-1 text-slate-600">
                        <li>• Fraud detection</li>
                        <li>• Algorithmic trading</li>
                        <li>• Risk assessment</li>
                        <li>• Customer service automation</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <Zap size={14} />
                        </div>
                        <h3 className="ml-2 font-medium text-sm">Content Creation</h3>
                      </div>
                      <ul className="text-xs space-y-1 text-slate-600">
                        <li>• Art generation</li>
                        <li>• Music composition</li>
                        <li>• Video synthesis</li>
                        <li>• Writing assistance</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                          <Settings size={14} />
                        </div>
                        <h3 className="ml-2 font-medium text-sm">Manufacturing & Industry</h3>
                      </div>
                      <ul className="text-xs space-y-1 text-slate-600">
                        <li>• Predictive maintenance</li>
                        <li>• Quality control</li>
                        <li>• Supply chain optimization</li>
                        <li>• Robotics</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-700 mb-2 text-sm">Future Directions</h3>
                    <p className="text-xs">
                      Deep learning continues to evolve with research focusing on more efficient training methods, 
                      models that require less data, enhanced interpretability, multimodal learning 
                      (combining different types of data), and stronger theoretical foundations. As computational 
                      resources grow and algorithms improve, deep learning will likely transform even more fields.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600">
              This is a simplified guide to deep learning. The field is complex and rapidly evolving, 
              with many nuances and advanced concepts beyond this introduction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepLearningGuide;