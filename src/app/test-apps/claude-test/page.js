"use client";
import React, { useState } from 'react';
import { 
  Mail, 
  Twitter, 
  Facebook, 
  Instagram, 
  Video, 
  Globe, 
  ChevronRight,
  BarChart,
  Users,
  Clock,
  ThumbsUp,
  Share2,
  MessageCircle
} from 'lucide-react';

// Main component for the Multi-Channel Marketing Campaign demonstration
const MultiChannelMarketingApp = () => {
  // State to track which channel is currently selected
  const [activeChannel, setActiveChannel] = useState('email');
  
  // Product information - in a real app would likely come from a database or API
  const product = {
    name: "EcoZen Bamboo Water Bottle",
    tagline: "Stay hydrated. Save the planet.",
    keyFeatures: [
      "100% biodegradable bamboo exterior",
      "Double-walled insulation keeps drinks hot/cold for 12+ hours",
      "Leak-proof design with smart-lock cap",
      "Zero plastic - fully sustainable materials"
    ],
    price: "$34.99",
    salePrice: "$27.99",
    discount: "20% off"
  };

  // Channel-specific content showing how marketing varies by platform
  const channels = [
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="w-6 h-6" aria-hidden="true" />,
      tone: 'Professional, informative, detailed',
      format: 'Long-form with multiple sections, images, and call-to-action buttons',
      content: `Dear Valued Customer,

We're excited to introduce our newest addition to our sustainable living collection - the EcoZen Bamboo Water Bottle.

In today's world, staying hydrated shouldn't come at the planet's expense. That's why we've created a premium water bottle that combines elegant design with environmental responsibility.

For a limited time, enjoy 20% off your purchase with code: ECOZEN20

Key features:
• 100% biodegradable bamboo exterior
• Double-walled insulation (12+ hours temperature retention)
• Leak-proof smart-lock cap
• Zero plastic - fully sustainable materials

Join thousands of environmentally conscious customers who've made the switch.

Shop now and make hydration sustainable!

Best regards,
The EcoLiving Team`,
      mediaType: 'Images, formatted text, buttons',
      cta: 'Shop Now - Use Code ECOZEN20',
      // Visual mockup of email campaign
      mockup: (
        <div className="bg-gray-50 border p-4 rounded-md">

          <div className="p-4 bg-white">
            <h3 className="text-xl font-bold text-green-800 mb-2">Introducing: EcoZen Bamboo Water Bottle</h3>
            <p className="text-sm mb-3">Dear Valued Customer,</p>
            <p className="text-sm mb-2">We're excited to introduce our newest sustainable product...</p>
            <div className="bg-green-50 p-3 rounded my-3 text-sm">
              <p className="font-bold text-green-800">LIMITED TIME OFFER</p>
              <p className="text-2xl font-bold text-green-900">{product.discount}</p>
              <p>Use code: ECOZEN20</p>
            </div>
            <div className="my-3 text-sm">
              <p className="font-bold mb-1">Key features:</p>
              <ul className="list-disc pl-5 space-y-1">
                {product.keyFeatures.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded w-full font-bold">
              SHOP NOW
            </button>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Unsubscribe | View in browser | Privacy Policy
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: <Twitter className="w-6 h-6" aria-hidden="true" />,
      tone: 'Concise, trendy, conversational',
      format: 'Short text (280 characters) with eye-catching image or GIF',
      content: `Hydration just got an eco-upgrade 💧🌿 Our new EcoZen Bamboo Bottle keeps drinks cold for 12+ hrs and is 100% sustainable. 20% off for launch week! #SustainableLiving #EcoZen`,
      mediaType: 'Single image, animated GIF, short video clip',
      cta: 'Shop via bio link',
      // Visual mockup of X/Twitter campaign
      mockup: (
        <div className="bg-gray-50 border rounded-md overflow-hidden max-w-md">
          {/* Header */}
          <div className="flex items-center p-3 border-b">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="font-bold text-green-800">EC</span>
            </div>
            <div className="ml-3">
              <p className="font-bold text-sm">EcoLiving</p>
              <p className="text-gray-500 text-xs">@ecoliving</p>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-3">
            <p className="text-sm mb-3">
              Hydration just got an eco-upgrade 💧🌿 Our new EcoZen Bamboo Bottle keeps drinks cold for 12+ hrs and is 100% sustainable. 20% off for launch week! #SustainableLiving #EcoZen
            </p>
            <div 
              className="w-full rounded-md mb-3 bg-gray-300 h-[280px] flex items-center justify-center text-gray-600"
              style={{ aspectRatio: '500/280' }}
              aria-label="EcoZen Bamboo Water Bottle placeholder image"
            >
              500 × 280
            </div>
          </div>
          
          {/* Engagement stats */}
          <div className="flex justify-between px-3 py-2 border-t text-gray-500 text-xs">
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" aria-hidden="true" />
              <span>42</span>
            </div>
            <div className="flex items-center">
              <Share2 className="w-4 h-4 mr-1" aria-hidden="true" />
              <span>128</span>
            </div>
            <div className="flex items-center">
              <ThumbsUp className="w-4 h-4 mr-1" aria-hidden="true" />
              <span>356</span>
            </div>
            <div className="flex items-center">
              <BarChart className="w-4 h-4 mr-1" aria-hidden="true" />
              <span>2.4K</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="w-6 h-6" aria-hidden="true" />,
      tone: 'Friendly, community-focused, value-driven',
      format: 'Medium-length post with image carousel or video',
      content: `🌿 INTRODUCING: The EcoZen Bamboo Water Bottle 🌿

Stay hydrated while staying eco-friendly! Our gorgeous new bamboo water bottles just launched, and they're already flying off the shelves.

✅ 100% biodegradable bamboo exterior
✅ Keeps drinks hot/cold for 12+ hours
✅ Zero plastic - fully sustainable

💰 LAUNCH SPECIAL: 20% OFF this week only! Tag a friend who loves sustainable products.`,
      mediaType: 'Image carousel, video testimonial, product demo',
      cta: 'Shop Now button, tag a friend',
      // Visual mockup of Facebook campaign
      mockup: (
        <div className="bg-white border rounded-md overflow-hidden max-w-md">
          {/* Header */}
          <div className="flex items-center p-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="font-bold text-green-800">EC</span>
            </div>
            <div className="ml-3">
              <p className="font-bold text-sm">EcoLiving</p>
              <div className="flex items-center">
                <p className="text-gray-500 text-xs">Yesterday at 2:45 PM</p>
                <span className="mx-1 text-gray-400">•</span>
                <Globe className="w-3 h-3 text-gray-500" aria-hidden="true" />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-3 pb-2">
            <p className="text-sm mb-3">
              🌿 INTRODUCING: The EcoZen Bamboo Water Bottle 🌿<br /><br />
              
              Stay hydrated while staying eco-friendly! Our gorgeous new bamboo water bottles just launched, and they're already flying off the shelves.<br /><br />
              
              ✅ 100% biodegradable bamboo exterior<br />
              ✅ Keeps drinks hot/cold for 12+ hours<br />
              ✅ Zero plastic - fully sustainable<br /><br />
              
              💰 LAUNCH SPECIAL: 20% OFF this week only! Tag a friend who loves sustainable products.
            </p>
          </div>
          
          {/* Media carousel dots */}
          <div className="relative">
            <div
              className="w-full bg-gray-300 flex items-center justify-center text-gray-600"
              style={{ aspectRatio: '500/300', height: '300px' }}
              aria-label="EcoZen Bamboo Water Bottle placeholder image"
            >
              500 × 300
            </div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
          
          {/* Engagement */}
          <div className="p-3">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <div className="flex items-center">
                <div className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center mr-1">
                  <ThumbsUp className="w-2 h-2" aria-hidden="true" />
                </div>
                <span>428 likes</span>
              </div>
              <div>64 comments • 32 shares</div>
            </div>
            
            <div className="flex border-t border-b py-1 justify-around">
              <button className="flex items-center text-gray-500 px-2 py-1 text-sm">
                <ThumbsUp className="w-4 h-4 mr-1" aria-hidden="true" />
                <span>Like</span>
              </button>
              <button className="flex items-center text-gray-500 px-2 py-1 text-sm">
                <MessageCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                <span>Comment</span>
              </button>
              <button className="flex items-center text-gray-500 px-2 py-1 text-sm">
                <Share2 className="w-4 h-4 mr-1" aria-hidden="true" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="w-6 h-6" aria-hidden="true" />,
      tone: 'Aspirational, visual, lifestyle-focused',
      format: 'Beautiful imagery with brief caption',
      content: `Sustainability never looked so good ✨ Introducing our EcoZen Bamboo Water Bottle - crafted with 100% sustainable materials to keep your drinks at the perfect temperature for 12+ hours.

Now available at 20% off for our launch week 🎉

#EcoLiving #SustainableLiving #EcoZen #ZeroWaste #HydrationGoals`,
      mediaType: 'High-quality lifestyle photos, carousel, Reels',
      cta: 'Link in bio, swipe up (Stories)',
      // Visual mockup of Instagram campaign
      mockup: (
        <div className="bg-white border rounded-md overflow-hidden max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center p-0.5">
                <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="font-bold text-green-800 text-xs">EC</span>
                  </div>
                </div>
              </div>
              <p className="font-bold text-sm ml-2">ecoliving</p>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xl">•••</span>
            </div>
          </div>
          
          {/* Image */}
          <div
            className="w-full aspect-square bg-gray-300 flex items-center justify-center text-gray-600"
            aria-label="Lifestyle photo of EcoZen Bamboo Water Bottle"
          >
            500 × 500
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-between p-3">
            <div className="flex space-x-4">
              <ThumbsUp className="w-6 h-6" aria-hidden="true" />
              <MessageCircle className="w-6 h-6" aria-hidden="true" />
              <Share2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-lg">⊕</span>
            </div>
          </div>
          
          {/* Caption */}
          <div className="px-3 pb-3">
            <p className="text-sm font-bold mb-1">1,245 likes</p>
            <p className="text-sm">
              <span className="font-bold">ecoliving</span> Sustainability never looked so good ✨ Introducing our EcoZen Bamboo Water Bottle - crafted with 100% sustainable materials to keep your drinks at the perfect temperature for 12+ hours.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              View all 86 comments
            </p>
            <p className="text-xs text-gray-400 mt-1">
              2 DAYS AGO
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: <Video className="w-6 h-6" aria-hidden="true" />,
      tone: 'Fun, authentic, trendy, entertaining',
      format: 'Short, engaging video (15-60 seconds)',
      content: `#GreenCheck challenge! Can your water bottle do THIS? 🌿✅ Our new EcoZen Bamboo bottle keeps ice frozen for 12+ hours (proof in video!) PLUS it's 100% biodegradable! #SustainableTok #HydrationCheck #EcoZen`,
      mediaType: 'Trending audio, challenge format, demonstration',
      cta: 'Link in bio, challenge participation',
      // Visual mockup of TikTok campaign
      mockup: (
        <div className="bg-black text-white rounded-md overflow-hidden max-w-md relative">
          {/* Video placeholder */}
          <div className="relative">
            <div
              className="w-full bg-gray-300 flex items-center justify-center text-gray-600"
              style={{ aspectRatio: '400/650', height: '650px' }}
              aria-label="TikTok video demonstration"
            >
              400 × 650
            </div>
            
            {/* Right side icons */}
            <div className="absolute right-3 bottom-20 flex flex-col items-center space-y-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs mt-1">245K</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs mt-1">1024</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <Share2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs mt-1">18.2K</span>
              </div>
            </div>
            
            {/* Bottom caption */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
              <p className="font-bold text-sm mb-1">@ecoliving</p>
              <p className="text-sm mb-2">
                #GreenCheck challenge! Can your water bottle do THIS? 🌿✅ Our new EcoZen Bamboo bottle keeps ice frozen for 12+ hours (proof in video!) PLUS it's 100% biodegradable!
              </p>
              <p className="text-xs">#SustainableTok #HydrationCheck #EcoZen</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'website',
      name: 'Website Ad',
      icon: <Globe className="w-6 h-6" aria-hidden="true" />,
      tone: 'Professional, benefit-focused, clear',
      format: 'Banner ad or product highlight section',
      content: `INTRODUCING THE ECOZEN BAMBOO WATER BOTTLE

Sustainability meets premium design

• 100% biodegradable materials
• 12+ hours temperature retention
• Leak-proof technology
• Zero plastic guarantee

LIMITED TIME: 20% OFF LAUNCH SPECIAL`,
      mediaType: 'High-quality product images, possibly animated banner',
      cta: 'Shop Now button, Learn More link',
      // Visual mockup of website campaign
      mockup: (
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="bg-white rounded-md overflow-hidden shadow-md">
            {/* Banner */}
            <div className="bg-gradient-to-r from-green-800 to-green-600 text-white p-3 text-center">
              <p className="text-xs font-bold">LIMITED TIME LAUNCH OFFER: 20% OFF</p>
            </div>
            
            {/* Content */}
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="md:w-1/2">
                <div
                  className="w-full bg-gray-300 flex items-center justify-center text-gray-600"
                  style={{ aspectRatio: '500/300', minHeight: '300px' }}
                  aria-label="EcoZen Bamboo Water Bottle"
                >
                  500 × 300
                </div>
              </div>
              
              {/* Text */}
              <div className="md:w-1/2 p-6 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-green-800 mb-2">INTRODUCING</h3>
                <h4 className="text-2xl font-bold mb-4">EcoZen Bamboo Water Bottle</h4>
                <p className="text-gray-600 mb-4">Sustainability meets premium design</p>
                
                <ul className="mb-4 space-y-2">
                  {product.keyFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 font-bold mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex items-center mb-4">
                  <span className="text-gray-500 line-through mr-2">{product.price}</span>
                  <span className="text-2xl font-bold text-green-800">{product.salePrice}</span>
                </div>
                
                <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded font-bold">
                  SHOP NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Function to render the currently selected channel content
  const renderActiveChannelContent = () => {
    const channel = channels.find(c => c.id === activeChannel);
    if (!channel) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <span className="mr-2 text-gray-600">
              {channel.icon}
            </span>
            {channel.name} Campaign
          </h2>
          <p className="text-gray-600">How our product is presented on this channel</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Channel characteristics */}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Tone & Style</h3>
              <p className="text-gray-600">{channel.tone}</p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Format</h3>
              <p className="text-gray-600">{channel.format}</p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Media Type</h3>
              <p className="text-gray-600">{channel.mediaType}</p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Call to Action</h3>
              <p className="text-gray-600">{channel.cta}</p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Content Example</h3>
              <div className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-line">
                {channel.content}
              </div>
            </div>
          </div>
          
          {/* Visual mockup */}
          <div className="flex justify-center items-start">
            {channel.mockup}
          </div>
        </div>
      </div>
    );
  };

  // Render statistics cards for campaign overview
  const renderStatCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-blue-500 mr-2" aria-hidden="true" />
            <h3 className="font-bold">Target Audience</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Environmentally conscious consumers, ages 25-45, interested in sustainability and eco-friendly products.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center mb-2">
            <BarChart className="w-5 h-5 text-green-500 mr-2" aria-hidden="true" />
            <h3 className="font-bold">Campaign Goals</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Increase product awareness, drive website traffic, generate sales, and build brand loyalty around sustainability.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-orange-500 mr-2" aria-hidden="true" />
            <h3 className="font-bold">Campaign Duration</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Two-week product launch campaign with tiered content release and promotional pricing for first 7 days.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with descriptive title */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">
            Multi-Channel Marketing Campaign
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how the same product campaign is adapted across different marketing channels,
            each with unique tone, style, and media format best suited to the platform.
          </p>
        </header>

        {/* Product Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="bg-green-100 rounded-lg p-6 flex items-center justify-center h-full">
                {/* Placeholder for product image */}
                <div className="text-center">
                  <div className="text-6xl mb-4" aria-hidden="true">🌿</div>
                  <h2 className="text-xl font-bold text-green-800">{product.name}</h2>
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">{product.name}</h2>
              <p className="text-xl text-gray-600 mb-4 italic">{product.tagline}</p>
              
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 mb-2">Key Features:</h3>
                <ul className="space-y-1">
                  {product.keyFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 font-bold mr-2" aria-hidden="true">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-500 line-through mr-2">{product.price}</span>
                <span className="text-2xl font-bold text-green-800">{product.salePrice}</span>
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                  {product.discount}
                </span>
              </div>
            </div>
          </div>
        </div>
      
        {/* Campaign overview statistics */}
        {renderStatCards()}
        
        {/* Accessible tab navigation for channels */}
        <div className="mb-6">
          <h2 className="sr-only">Marketing Channels</h2>
          <nav 
            className="flex overflow-x-auto pb-2" 
            aria-label="Marketing channels navigation"
            role="tablist"
          >
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`
                  flex items-center px-4 py-2 whitespace-nowrap mr-2 rounded-t-lg border-b-2 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600
                  ${activeChannel === channel.id 
                    ? 'bg-white border-green-600 text-green-600 font-bold shadow-sm' 
                    : 'bg-gray-100 border-transparent hover:bg-gray-200 text-gray-600'}
                `}
                aria-selected={activeChannel === channel.id}
                aria-controls={`panel-${channel.id}`}
                id={`tab-${channel.id}`}
                role="tab"
                tabIndex={activeChannel === channel.id ? 0 : -1}
              >
                <span className="mr-2" aria-hidden="true">{channel.icon}</span>
                <span>{channel.name}</span>
                {activeChannel === channel.id && (
                  <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                )}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Channel content tab panel */}
        <div 
          id={`panel-${activeChannel}`}
          role="tabpanel" 
          aria-labelledby={`tab-${activeChannel}`}
          tabIndex={0}
        >
          {renderActiveChannelContent()}
        </div>
        
        {/* Key takeaways section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Key Takeaways</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-2" aria-hidden="true">1.</span>
              <span>
                <strong>Adapt your message to each platform:</strong> Notice how the same product information is presented differently across channels to match user expectations.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-2" aria-hidden="true">2.</span>
              <span>
                <strong>Consistent branding with flexible tone:</strong> While the core message remains consistent, the tone shifts from professional (email) to fun and trendy (TikTok).
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-2" aria-hidden="true">3.</span>
              <span>
                <strong>Platform-specific media formats:</strong> Each channel has unique media requirements - from high-quality product images for Instagram to short, engaging videos for TikTok.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 font-bold mr-2" aria-hidden="true">4.</span>
              <span>
                <strong>Call-to-action variations:</strong> Different platforms require different CTAs, from direct &quot;Shop Now&quot; buttons to &quot;Link in Bio&quot; mentions.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MultiChannelMarketingApp;