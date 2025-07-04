
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Users, TrendingDown, DollarSign, Clock, Tv, Youtube, Zap, Eye, Target, Globe, Timer, Percent } from 'lucide-react';

const AnimatedCounter = ({ end, duration = 2000, suffix = '', prefix = '', decimal = false }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      if (decimal) {
        setCount((progress * end).toFixed(1));
      } else {
        setCount(Math.floor(progress * end));
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, decimal]);

  return (
    <span className="font-bold text-lg md:text-xl text-white">
      {prefix}{decimal ? count : parseInt(count).toLocaleString()}{suffix}
    </span>
  );
};

const StatCard = ({ icon: Icon, title, stat, description, index, color = 'blue' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const colorClasses = {
    blue: 'from-blue-700 to-blue-800 border-blue-300',
    green: 'from-green-700 to-green-800 border-green-300',
    purple: 'from-purple-700 to-purple-800 border-purple-300',
    orange: 'from-orange-700 to-orange-800 border-orange-300',
    red: 'from-red-700 to-red-800 border-red-300',
    indigo: 'from-indigo-700 to-indigo-800 border-indigo-300'
  };

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
      className={`w-full text-left bg-gradient-to-br ${colorClasses[color]} text-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 p-3 border-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer`}
      aria-expanded={isExpanded}
      aria-label={`${title}. ${isExpanded ? 'Click to hide' : 'Click to show'} description.`}
    >
      {/* Icon */}
      <div className="flex items-center justify-center mb-2">
        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <Icon className="w-4 h-4 text-black" aria-hidden="true" />
        </div>
      </div>
      
      {/* Stat and Title */}
      <div className="text-center mb-2">
        <div className="mb-1">{stat}</div>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>

      {/* Expand/Collapse Indicator */}
      <div className="flex justify-center mb-1">
        <div className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Expandable Description */}
      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="pt-1 border-t border-white border-opacity-30">
          <p className="text-xs text-white text-opacity-90 text-center leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

const AudioSection = ({ title, children, icon: Icon }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const handlePlayClick = () => {
    setIsPlaying(!isPlaying);
    // Audio functionality would be implemented here
    console.log(`${isPlaying ? 'Pausing' : 'Playing'} audio for: ${title}`);
  };

  const handleTranscriptToggle = () => {
    setShowTranscript(!showTranscript);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      
      {/* Audio Controls */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handlePlayClick}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isPlaying 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
          }`}
          aria-label={`${isPlaying ? 'Pause' : 'Play'} audio for ${title}`}
        >
          <Play className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} aria-hidden="true" />
          {isPlaying ? 'Playing...' : 'Play audio'}
        </button>
        
        <button
          onClick={handleTranscriptToggle}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          aria-expanded={showTranscript}
          aria-controls={`transcript-${title.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <span className="text-sm font-medium">
            {showTranscript ? 'Hide transcript' : 'Show transcript'}
          </span>
          <div className={`w-4 h-4 transition-transform duration-200 ${showTranscript ? 'rotate-180' : ''}`}>
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Transcript Content */}
      <div
        id={`transcript-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className={`overflow-hidden transition-all duration-300 ${
          showTranscript ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-4 border-t border-gray-200">
          <div className="prose prose-gray max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const TVFactsInteractive = () => {
  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Tv className="w-8 h-8 text-blue-600" aria-hidden="true" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Television in the digital age
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Key statistics and insights about TV consumption and advertising
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <StatCard
            icon={Globe}
            title="Global TV users"
            stat={<AnimatedCounter end={5.4} suffix=" billion" decimal={true} />}
            description="TV users worldwide in 2021, expected to grow to 5.7 billion by 2026"
            index={0}
            color="blue"
          />
          
          <StatCard
            icon={Clock}
            title="Prime time reach"
            stat={<AnimatedCounter end={33} suffix="%" />}
            description="More than one-third of entire country populations watch TV during prime time hours (8-11pm)"
            index={1}
            color="purple"
          />
          
          <StatCard
            icon={TrendingDown}
            title="Viewing time change"
            stat={<AnimatedCounter end={15} suffix=" minutes" />}
            description="People are watching 15 minutes less television than the original three hours per day"
            index={2}
            color="orange"
          />
          
          <StatCard
            icon={Play}
            title="Streaming adoption"
            stat={<AnimatedCounter end={28} suffix="%" />}
            description="Of global consumers are now streaming their television content instead of traditional viewing"
            index={3}
            color="green"
          />
          
          <StatCard
            icon={Youtube}
            title="YouTube as TV"
            stat={<AnimatedCounter end={20} suffix="%" />}
            description="In growing markets, more than 20% of the population consider YouTube as 'watching TV'"
            index={4}
            color="red"
          />
          
          <StatCard
            icon={DollarSign}
            title="Global ad spend"
            stat={<><AnimatedCounter end={170} prefix="$" /> - <AnimatedCounter end={280} prefix="$" suffix="B" /></>}
            description="Annual global spending on TV advertising in US dollars, expected to remain stable"
            index={5}
            color="indigo"
          />
          
          <StatCard
            icon={TrendingDown}
            title="Ad spend share decline"
            stat={<><AnimatedCounter end={40} suffix="%" /> → <AnimatedCounter end={28} suffix="%" /></>}
            description="TV's proportion of total advertising spend is declining rapidly from 40% to 28%"
            index={6}
            color="orange"
          />
          
          <StatCard
            icon={Target}
            title="Cost efficiency"
            stat={<><AnimatedCounter end={5} prefix="$" /> - <AnimatedCounter end={25} prefix="$" /></>}
            description="Cost to reach 1,000 households in the US, making TV very cost-efficient for mass reach"
            index={7}
            color="green"
          />
          
          <StatCard
            icon={Timer}
            title="Ad duration"
            stat={<><AnimatedCounter end={15} /> - <AnimatedCounter end={30} suffix=" sec" /></>}
            description="Typical TV commercial length, with many ads being reduced from 30 seconds to 15-20 seconds"
            index={8}
            color="blue"
          />
        </div>

        {/* Audio Content Sections */}
        <div className="space-y-8">
          <AudioSection title="Advantages of TV advertising" icon={Zap}>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                It is important to take note of some of the main characteristics of TV as an advertising medium. The advantages are, first and foremost, that it provides the opportunity to present your product with a combination of sight and sound, offering tremendous creative flexibility. The richness of TV media makes it possible to tell a more dramatic and more realistic story about your brand, products and services. TV adverts can convey different moods and elicit emotions very effectively.
              </p>
              
              <p>
                The second advantage is that TV reaches large audiences, regardless of age, sex, income or educational level. TV's large coverage also makes it very cost efficient to reach a person. 
              </p>
              
              <p>
                The third advantage of TV is its attention-grabbing capacity because TV commercials intrusively impose themselves on viewers as they watch their favourite TV shows. It can reach many viewers, even if some of them will try to step away or avoid the commercials.
              </p>
            </div>
          </AudioSection>

          <AudioSection title="Limitations of TV advertising" icon={Target}>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                Finally, there are a couple of limitations to TV adverts, which are mainly the high costs – producing a TV commercial is very expensive and buying airtime nationally can also be quite costly. In addition, its low selectivity means TV reaches masses but cannot seek out specific target audiences.
              </p>
              
              <p>
                And then there are challenges related to fleeting messages – 30-second messages are short and many commercials are even further reduced to 15 to 20 seconds.
              </p>
              
              <p>
                Clutter is also a challenge. As commercials get shorter, the perception of clutter grows as more adverts get presented, which makes it harder to keep the attention of the viewer.
              </p>
            </div>
          </AudioSection>
        </div>


      </div>
    </div>
  );
};

export default TVFactsInteractive;
