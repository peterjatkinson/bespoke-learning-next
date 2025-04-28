"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Sliders, Info, Moon, PlayCircle, PauseCircle } from 'lucide-react';
import * as THREE from 'three';

const Earth3DTidalSimulator = () => {
  // State for controlling moon size (1 = current size, range from 0.1 to 5)
  const [moonSizeMultiplier, setMoonSizeMultiplier] = useState(1);
  // State to track whether animation is paused
  const [isPaused, setIsPaused] = useState(false);
  // State for showing tooltip/info panel
  const [showInfo, setShowInfo] = useState(false);
  // State for tracking the Earth's rotation angle
  const [earthRotation, setEarthRotation] = useState(0);
  // State for the camera view angle (perspective)
  const [viewAngle, setViewAngle] = useState(0);
  
  // References for the container and Three.js objects
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const earthRef = useRef(null);
  const tidalBulgesRef = useRef(null);
  const moonRef = useRef(null);
  
  // Calculate tidal force using inverse cube law (F ∝ m/r³)
  const calculateTidalForce = () => {
    // Mass increases with volume (r³)
    const massMultiplier = Math.pow(moonSizeMultiplier, 3);
    return massMultiplier;
  };
  
  // Derived values
  const tidalForce = calculateTidalForce();
  const tidalHeight = 0.05 + (tidalForce * 0.08); // Base height plus scaled force
  const waveFrequency = 0.5 + (moonSizeMultiplier * 0.2); // Faster waves with larger moon
  
  // Format the tidal force as percentage relative to current moon
  const tidalForcePercentage = Math.round(tidalForce * 100);
  
  // Initialize Three.js scene
// Initialize Three.js scene
useEffect(() => {
    // Skip if container is not yet available
    if (!containerRef.current) return;
  
    // Capture the current container element NOW, so the cleanup function
    // uses the correct value even if the ref changes later.
    const containerElement = containerRef.current;
  
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
  
    // Use the captured containerElement for dimensions
    const width = containerElement.clientWidth;
    const height = containerElement.clientHeight;
  
    // Add explanatory text for what the view perspectives mean
    const helpTextElem = document.createElement('div');
    helpTextElem.style.position = 'absolute';
    helpTextElem.style.bottom = '60px';
    helpTextElem.style.left = '50%';
    helpTextElem.style.transform = 'translateX(-50%)';
    helpTextElem.style.backgroundColor = 'rgba(0,0,0,0.7)';
    helpTextElem.style.color = '#9BD5FF';
    helpTextElem.style.padding = '8px 12px';
    helpTextElem.style.borderRadius = '4px';
    helpTextElem.style.fontSize = '12px';
    helpTextElem.style.textAlign = 'center';
    helpTextElem.style.maxWidth = '300px';
    helpTextElem.style.opacity = '0';
    helpTextElem.style.transition = 'opacity 0.3s';
    helpTextElem.textContent = 'Camera perspectives: View Earth-Moon system from different angles';
    helpTextElem.style.pointerEvents = 'none';
    // Use the captured containerElement to append
    containerElement.appendChild(helpTextElem);
  
    // Show explanation briefly on load
    setTimeout(() => {
      helpTextElem.style.opacity = '1';
      setTimeout(() => {
        helpTextElem.style.opacity = '0';
      }, 5000);
    }, 1000);
  
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;
    cameraRef.current = camera;
  
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    // Use the captured containerElement to append
    containerElement.appendChild(renderer.domElement);
    rendererRef.current = renderer;
  
    // Capture the renderer's DOM element now for cleanup
    const rendererDomElement = renderer.domElement;
  
  
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
  
    // Add directional light (as sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
  
    // Create starry background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
    });
  
    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = THREE.MathUtils.randFloatSpread(100);
      const y = THREE.MathUtils.randFloatSpread(100);
      const z = THREE.MathUtils.randFloatSpread(100);
  
      // Only add stars that are not too close to the center
      if (Math.sqrt(x*x + y*y + z*z) > 10) {
        starsVertices.push(x, y, z);
      }
    }
  
    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
  
    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
  
    // Create more realistic Earth materials with texture-like effects using shaders
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a66cc,  // Deeper blue for oceans
      shininess: 45,
      specular: 0x333333,
      emissive: 0x112244,
      emissiveIntensity: 0.2
    });
  
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    earthRef.current = earth;
  
    // Create more realistic continents with varied terrain
    const createContinent = (lat, long, width, height, rotation, color = 0x2a7d2a, roughness = 0.8) => {
      const geometry = new THREE.SphereGeometry(1.01, 32, 32,
        long, width, lat, height);
      const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 8 + Math.random() * 4,
        specular: 0x222222,
        flatShading: roughness > 0.5
      });
      const continent = new THREE.Mesh(geometry, material);
      earth.add(continent);
      if (rotation) {
        continent.rotation.y = rotation;
      }
  
      // Add subtle terrain variations
      if (roughness > 0.5) {
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          const randomOffset = (Math.random() - 0.5) * 0.005;
          positions[i] *= (1 + randomOffset);
          positions[i+1] *= (1 + randomOffset);
          positions[i+2] *= (1 + randomOffset);
        }
        geometry.attributes.position.needsUpdate = true;
      }
  
      return continent;
    };
  
    // Add more detailed continents with varied colors
    createContinent(0.4, 0.6, 1.2, 0.8, 0, 0x3a8d3a);  // Larger landmass like Eurasia
    createContinent(0.2, 2, 0.8, 0.4, 0.5, 0x357c35);  // Africa-like
    createContinent(1.5, 3, 0.9, 0.7, 1.2, 0x2a7d2a);  // Americas-like
    createContinent(0.8, 4.2, 1.1, 0.5, 0.8, 0x3a8d3a); // Asia-like
  
    // Add some smaller islands
    createContinent(0.2, 1, 0.3, 0.2, 0, 0x2d8d2d);
    createContinent(1.8, 2.5, 0.2, 0.2, 1, 0x357c35);
    createContinent(1.3, 5, 0.2, 0.3, 0.5, 0x3a8d3a);
  
    // Add polar caps
    const northPoleGeometry = new THREE.SphereGeometry(1.015, 32, 32, 0, Math.PI * 2, 0, 0.3);
    const southPoleGeometry = new THREE.SphereGeometry(1.015, 32, 32, 0, Math.PI * 2, 2.8, 0.3);
  
    const polarCapsMaterial = new THREE.MeshPhongMaterial({
      color: 0xe0e0e0,
      shininess: 70,
      specular: 0x666666
    });
  
    const northPole = new THREE.Mesh(northPoleGeometry, polarCapsMaterial);
    const southPole = new THREE.Mesh(southPoleGeometry, polarCapsMaterial);
  
    earth.add(northPole);
    earth.add(southPole);
  
    // Add atmospheric glow effect
    const atmosphereGeometry = new THREE.SphereGeometry(1.03, 32, 32);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x88aaff,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
  
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earth.add(atmosphere);
  
    // Create tidal bulge visualization
    const tidalGeometry = new THREE.SphereGeometry(1, 64, 64);
    const tidalMaterial = new THREE.MeshPhongMaterial({
      color: 0x3366cc,
      shininess: 40,
      transparent: true,
      opacity: 0.6,
    });
  
    const tidalBulges = new THREE.Mesh(tidalGeometry, tidalMaterial);
    scene.add(tidalBulges);
    tidalBulgesRef.current = tidalBulges;
  
    // Create Moon
    const moonGeometry = new THREE.SphereGeometry(0.27, 32, 32);
  
    // Create more realistic Moon material with crater-like texture
    const moonMaterial = new THREE.MeshPhongMaterial({
      color: 0xdddddd,
      shininess: 5,
      specular: 0x111111,
      emissive: 0x222222,
      emissiveIntensity: 0.1
    });
  
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(4, 0, 0);
    scene.add(moon);
    moonRef.current = moon;
  
    // Add craters to the moon
    const addCrater = (x, y, z, size) => {
      const craterGeometry = new THREE.CircleGeometry(size, 16);
      const craterMaterial = new THREE.MeshPhongMaterial({
        color: 0xbbbbbb,
        side: THREE.DoubleSide
      });
  
      const crater = new THREE.Mesh(craterGeometry, craterMaterial);
  
      // Position the crater on the moon's surface
      crater.position.set(x, y, z);
  
      // Make the crater face outward from the center
      crater.lookAt(0, 0, 0);
  
      // Offset slightly to prevent z-fighting
      crater.position.multiplyScalar(1.001);
  
      moon.add(crater);
    };
  
    // Add several craters of varying sizes
    for (let i = 0; i < 15; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const size = 0.02 + Math.random() * 0.05;
  
      const x = 0.27 * Math.sin(phi) * Math.cos(theta);
      const y = 0.27 * Math.sin(phi) * Math.sin(theta);
      const z = 0.27 * Math.cos(phi);
  
      addCrater(x, y, z, size);
    }
  
    // Create moon orbit indicator
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x555555,
      transparent: true,
      opacity: 0.3,
    });
  
    const orbitPoints = [];
    const orbitSegments = 64;
    const orbitRadius = 4;
  
    for (let i = 0; i <= orbitSegments; i++) {
      const angle = (i / orbitSegments) * Math.PI * 2;
      orbitPoints.push(
        Math.cos(angle) * orbitRadius,
        0,
        Math.sin(angle) * orbitRadius
      );
    }
  
    orbitGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(orbitPoints, 3)
    );
  
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbit);
  
    // Handle window resize
    const handleResize = () => {
      // These refs should be fine as they are checked for existence
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
  
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
  
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
  
      rendererRef.current.setSize(width, height);
    };
  
    window.addEventListener('resize', handleResize);
  
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      // Use the captured variables in the cleanup
      if (containerElement && rendererDomElement && containerElement.contains(rendererDomElement)) {
         containerElement.removeChild(rendererDomElement);
      }
      // Optional: Add more complete Three.js resource cleanup here if needed
      // e.g., renderer.dispose(), dispose geometries/materials in the scene
    };
  }, []); // Empty dependency array means this effect runs once on mount
  
  // Update Earth and Moon visuals based on moon size and rotation
  useEffect(() => {
    if (!sceneRef.current || !earthRef.current || !tidalBulgesRef.current || !moonRef.current) return;
    
    // Animation function
    const animate = () => {
      if (isPaused) return;
      
      // Update Earth rotation
      const rotationSpeed = 0.005; // Base rotation speed
      setEarthRotation(prev => (prev + rotationSpeed) % (Math.PI * 2));
      
      // Request next frame if component is still mounted
      requestAnimationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    const requestAnimationRef = { current: null };
    requestAnimationRef.current = requestAnimationFrame(animate);
    
    // Cleanup animation
    return () => {
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, [isPaused]);
  
  // Render the scene with updated values
  useEffect(() => {
    if (!sceneRef.current || !earthRef.current || !tidalBulgesRef.current || !moonRef.current || !cameraRef.current || !rendererRef.current) return;
    
    // Update moon size
    moonRef.current.scale.set(
      moonSizeMultiplier,
      moonSizeMultiplier,
      moonSizeMultiplier
    );
    
    // Calculate moon position for visualization
    const moonDistance = 4 + moonSizeMultiplier * 0.2; // Slightly adjust distance with size
    moonRef.current.position.set(
      moonDistance * Math.cos(earthRotation),
      0,
      moonDistance * Math.sin(earthRotation)
    );
    
    // Update tidal bulges (elongate the sphere in the moon's direction and opposite)
    const sphericalToCartesian = (r, theta, phi) => {
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi)
      };
    };
    
    // Create tidal bulges by deforming the sphere
    const geometry = tidalBulgesRef.current.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const positions = positionAttribute.array;
    
    // Direction to the moon (normalized vector)
    const moonDir = new THREE.Vector3(
      moonRef.current.position.x,
      moonRef.current.position.y,
      moonRef.current.position.z
    ).normalize();
    
    // For each vertex of the tidal sphere
    for (let i = 0; i < positions.length; i += 3) {
      const vertex = new THREE.Vector3(
        positions[i],
        positions[i + 1],
        positions[i + 2]
      ).normalize();
      
      // Calculate dot product with moon direction
      const dotWithMoon = vertex.dot(moonDir);
      
      // Create two bulges - one toward the moon and one on the opposite side
      const bulgeAmount = tidalHeight * (Math.abs(dotWithMoon) * 2 - 1) * (Math.abs(dotWithMoon) * 2 - 1);
      
      // Apply the bulge
      const newRadius = 1 + bulgeAmount;
      positions[i] = vertex.x * newRadius;
      positions[i + 1] = vertex.y * newRadius;
      positions[i + 2] = vertex.z * newRadius;
    }
    
    positionAttribute.needsUpdate = true;
    
    // Set camera position based on view angle
    const cameraDistance = 7;
    cameraRef.current.position.x = cameraDistance * Math.sin(viewAngle);
    cameraRef.current.position.z = cameraDistance * Math.cos(viewAngle);
    cameraRef.current.lookAt(0, 0, 0);
    
    // Rotate Earth and tidal bulges
    earthRef.current.rotation.y = earthRotation;
    
    // Render the scene
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    
  }, [moonSizeMultiplier, earthRotation, tidalHeight, viewAngle]);
  
  // Handle view angle changes
  const handleViewChange = (angle) => {
    setViewAngle(angle);
  };
  
  return (
    <div className="bg-gray-900 min-h-full p-4 flex flex-col text-gray-200" aria-describedby="visualization-description">
      <div id="visualization-description" className="sr-only">
        A 3D visualization showing how the Moon's size affects tidal forces on Earth.
        Use the slider to adjust the Moon's size and observe the changes in tidal bulges.
      </div>
      
      <h1 className="text-2xl font-bold text-center mb-4 text-blue-300">
        3D Earth Tidal Forces Visualization
      </h1>
      
      <div className="flex flex-col xl:flex-row gap-4 flex-1">
        {/* 3D Visualization container */}
        <div className="relative flex-1 bg-black rounded-lg overflow-hidden min-h-96" ref={containerRef}>
          {/* Loading message while Three.js initializes */}
          {!sceneRef.current && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xl text-blue-300">Loading 3D visualization...</div>
            </div>
          )}
          
          {/* Controls overlay */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="bg-gray-800/50 hover:bg-gray-700/70 p-2 rounded-full text-white"
              aria-label={isPaused ? "Resume animation" : "Pause animation"}
            >
              {isPaused ? (
                <PlayCircle className="h-6 w-6" />
              ) : (
                <PauseCircle className="h-6 w-6" />
              )}
            </button>
            
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="bg-gray-800/50 hover:bg-gray-700/70 p-2 rounded-full text-white"
              aria-label={showInfo ? "Hide information" : "Show information"}
            >
              <Info className="h-6 w-6" />
            </button>
          </div>
          
          {/* Info tooltip */}
          {showInfo && (
            <div className="absolute bottom-4 left-4 right-4 bg-gray-900/80 p-4 rounded-lg text-sm max-w-md border border-blue-900">
              <h3 className="font-bold text-blue-300 mb-2">How to Read This Visualization</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>The blue sphere shows Earth's oceans with tidal bulges</li>
                <li>Two bulges always form: one facing the Moon and one on the opposite side</li>
                <li>As the Moon (grey sphere) grows larger, the tidal bulges become more pronounced</li>
                <li>Earth rotates to simulate the daily tidal cycle</li>
                <li>Use the camera angle buttons below to view from different perspectives</li>
              </ul>
              <button 
                className="mt-2 text-blue-400 hover:text-blue-300"
                onClick={() => setShowInfo(false)}
              >
                Close
              </button>
            </div>
          )}
          
          {/* Camera view controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-gray-800/50 p-2 rounded-lg">
            <button
              onClick={() => handleViewChange(0)}
              className={`p-2 rounded ${viewAngle === 0 ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              aria-label="View facing the Moon"
              title="View Earth facing the Moon"
            >
              Moon View
            </button>
            <button
              onClick={() => handleViewChange(Math.PI / 2)}
              className={`p-2 rounded ${viewAngle === Math.PI / 2 ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              aria-label="View from orbit plane, perpendicular to Moon"
              title="View from orbit plane, perpendicular to Moon"
            >
              Orbit View
            </button>
            <button
              onClick={() => handleViewChange(Math.PI)}
              className={`p-2 rounded ${viewAngle === Math.PI ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              aria-label="View Earth from opposite side of Moon"
              title="View Earth from opposite side of Moon"
            >
              Far Side
            </button>
            <button
              onClick={() => handleViewChange(Math.PI * 1.25)}
              className={`p-2 rounded ${viewAngle === Math.PI * 1.25 ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              aria-label="View from above the orbit plane"
              title="View from above the orbit plane"
            >
              Above
            </button>
          </div>
        </div>
        
        {/* Controls and data panel */}
        <div className="w-full xl:w-72 space-y-4">
          {/* Moon size control */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <Moon className="h-5 w-5 text-blue-300 mr-2" aria-hidden="true" />
              <h2 className="text-lg font-medium text-blue-300">Moon Size</h2>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm mr-3 w-8" id="size-value" aria-hidden="true">
                {moonSizeMultiplier.toFixed(1)}×
              </span>
              
              <div className="relative flex-1">
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={moonSizeMultiplier}
                  onChange={(e) => setMoonSizeMultiplier(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  aria-labelledby="moon-size-label"
                  aria-valuenow={moonSizeMultiplier}
                  aria-valuemin={0.1}
                  aria-valuemax={5}
                  aria-valuetext={`${moonSizeMultiplier.toFixed(1)} times current Moon size`}
                />
                
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-400 px-1">
                  <span>0.1×</span>
                  <span>1×</span>
                  <span>5×</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-sm text-gray-400" id="moon-size-label">
              {moonSizeMultiplier.toFixed(1)}× the Moon's actual size
            </div>
            
            <div className="mt-2 p-2 bg-gray-900 rounded border border-gray-700 text-xs text-gray-300">
              <p><strong>Note:</strong> This simulation accurately represents the relative scaling of tidal effects. A value of 1× represents the Moon's current size. A value of 2× means the Moon's radius is doubled (which would make its volume and mass 8× larger).</p>
            </div>
          </div>
          
          {/* Tidal effects data */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-blue-300 mb-3">Tidal Effects</h2>
            
            <div className="space-y-4">
              {/* Tidal force indicator */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tidal Force:</span>
                  <span aria-live="polite">{tidalForcePercentage}% of current</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{width: `${Math.min(tidalForcePercentage, 100)}%`}}
                    aria-hidden="true"
                  ></div>
                </div>
                {tidalForcePercentage > 100 && (
                  <div className="text-xs text-blue-400 mt-1">
                    {Math.floor(tidalForcePercentage/100)}× scale maximum
                  </div>
                )}
              </div>
              
              {/* Tidal bulge height */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tidal Bulge:</span>
                  <span aria-live="polite">
                    {(tidalHeight * 100).toFixed(1)}% of Earth radius
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{width: `${Math.min((tidalHeight / 0.5) * 100, 100)}%`}}
                    aria-hidden="true"
                  ></div>
                </div>
              </div>
              
              {/* Wave frequency indicator */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tide Frequency:</span>
                  <span aria-live="polite">{waveFrequency.toFixed(1)}× normal</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{width: `${Math.min((waveFrequency / 2) * 100, 100)}%`}}
                    aria-hidden="true"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scientific explanation */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-blue-300 mb-2">The Science</h2>
            
            <div className="space-y-2 text-sm">
              <p>
                Tidal forces occur because the Moon's gravity pulls stronger on the near side of Earth than the far side.
              </p>
              
              <p>
                The difference in gravitational pull creates two bulges:
              </p>
              
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li>One directly under the Moon (direct pull)</li>
                <li>One on the opposite side (inertial effect)</li>
              </ul>
              
              <p className="font-medium mt-2">Key Formula:</p>
              <div className="bg-gray-900 p-2 rounded text-center font-mono">
                F<sub>tidal</sub> ∝ M<sub>moon</sub> / r<sup>3</sup>
              </div>
              
              <p className="mt-2">
                A {moonSizeMultiplier > 1 ? "larger" : "smaller"} Moon 
                ({moonSizeMultiplier.toFixed(1)}×) would create tidal forces 
                {tidalForcePercentage !== 100 ? ` ${tidalForcePercentage}% of current levels` : ""}.
              </p>
              
              {moonSizeMultiplier >= 1.9 && moonSizeMultiplier <= 2.1 && (
                <div className="text-yellow-300 mt-2 border border-yellow-800 p-2 rounded bg-gray-900">
                  <p className="font-bold">At 2× Moon size:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Tidal forces would be ~8× stronger</li>
                    <li>Coastal areas would experience massive flooding twice daily</li>
                    <li>Tidal ranges could exceed 15-20 meters in many areas</li>
                    <li>Marine ecosystems would be dramatically altered</li>
                    <li>Coastal erosion would increase significantly</li>
                  </ul>
                </div>
              )}
              
              {moonSizeMultiplier > 3 && (
                <p className="text-yellow-300 mt-2">
                  Warning: Tides this extreme would reshape Earth's geography and drastically affect climate!
                </p>
              )}
              
              {moonSizeMultiplier < 0.2 && (
                <p className="text-blue-300 mt-2">
                  Note: With such a small Moon, Earth would have much more stable weather patterns but fewer coastal ecosystems.
                </p>
              )}
            </div>
          </div>
          
          {/* Real-world context */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-blue-300 mb-2">Tidal Facts</h2>
            
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Earth's actual tidal range averages 1-2 meters in open ocean.</li>
              <li>The Bay of Fundy has the world's largest tidal range (~16m) due to its shape amplifying the effect.</li>
              <li>Earth's rotation creates two high tides and two low tides daily.</li>
              <li>The Sun also creates tides about 46% as strong as the Moon's.</li>
              <li>The Moon is slowly moving away from Earth (~3.8cm/year), gradually weakening tidal effects.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earth3DTidalSimulator;