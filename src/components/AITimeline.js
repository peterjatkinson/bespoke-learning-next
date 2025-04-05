import React, { useState, useRef, useEffect } from "react";

const TimelineEvent = ({ event, index, isSelected, onClick, onKeyDown }) => {
  const isEven = index % 2 === 0;
  const buttonRef = useRef(null);

  const buttonId = `accordion-header-${event.year}`;
  const regionId = `content-${event.year}`;

  useEffect(() => {
    if (isSelected && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [isSelected]);

  return (
    <div
      className={`md:flex md:items-center ${
        isEven ? "" : "md:flex-row-reverse"
      }`}
      role="listitem"
    >
      <div
        className={`w-full md:w-5/12 mb-4 md:mb-0 ${
          isEven ? "md:text-right md:pr-4" : "md:text-left md:pl-4"
        }`}
      >
        {/* Heading and button */}
        <div role="heading" aria-level="3">
          <button
            id={buttonId}
            ref={buttonRef}
            onClick={onClick}
            onKeyDown={onKeyDown}
            aria-expanded={isSelected}
            aria-controls={regionId}
            className={`w-full p-4 rounded-none transition-all duration-300 text-left relative overflow-hidden transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 ${
              isSelected
                ? "bg-red-800 text-white border border-red-800"
                : "bg-white hover:bg-sky-50 shadow border border-red-800"
            }`}
          >
        

            <div className="relative z-10">
              {/* MOBILE: Year above Title */}
              <div
                className={`block md:hidden text-xl font-bold ${
                  isSelected ? "text-white" : "text-red-800"
                } mb-1`}
                aria-label={`Year ${event.year}`}
              >
                {event.year}
              </div>

              {/* Title */}
              <span className="font-bold text-lg tracking-wider block">
                {event.title}
              </span>

              {/* DESKTOP: Year to the right */}
              <div
                className={`hidden md:block text-xl font-bold ${
                  isSelected ? "text-white" : "text-red-800"
                }`}
                aria-label={`Year ${event.year}`}
              >
                {event.year}
              </div>
            </div>
          </button>
        </div>

        {/* Panel content (separate from button) */}
        <div
          id={regionId}
          role="region"
          aria-labelledby={buttonId}
          className={`transition-all duration-300 ${
            isSelected ? "block bg-red-800 text-white p-4" : "hidden"
          }`}
        >
          <p className="text-sm font-medium leading-relaxed">{event.summary}</p>
        </div>
      </div>

      {/* Timeline node and vertical line (unchanged) */}
      <div
        className="hidden md:block md:w-2/12 md:flex md:justify-center relative"
        aria-hidden="true"
      >
        <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-red-800 via-sky-300 to-red-800"></div>
        <div
          className={`w-6 h-6 transform rotate-45 transition-all duration-300 ${
            isSelected
              ? "bg-red-800 scale-125 shadow-lg"
              : "bg-white border-2 border-red-800"
          }`}
        />
      </div>

      <div className="hidden md:block md:w-5/12" aria-hidden="true" />
    </div>
  );
};

const Timeline = () => {
  const [selectedEventIndex, setSelectedEventIndex] = useState(null);
  const timelineRef = useRef(null);

  const events = [
    {
      year: 1943,
      title: "Foundations of neural networks",
      summary:
        "Warren McCulloch and Walter Pitts published 'A Logical Calculus of Ideas Immanent in Nervous Activity', laying the theoretical groundwork for neural networks by modelling how the brain processes information.",
    },
    {
      year: 1950,
      title: "Turing's paper",
      summary:
        "Alan Turing introduced the concept of the Turing test in his paper 'Computing Machinery and Intelligence', proposing a practical way to evaluate a machine's ability to exhibit human-like intelligence.",
    },
    {
      year: 1956,
      title: "Dartmouth workshop",
      summary:
        "The Dartmouth Summer Research Project on Artificial Intelligence brought together leading thinkers such as John McCarthy and Marvin Minsky to formalise artificial intelligence as a field of academic study.",
    },
    {
      year: 1967,
      title: "ELIZA",
      summary:
        "Joseph Weizenbaum developed ELIZA, a natural language processing program capable of simulating conversation, marking an early step in human-computer interaction.",
    },
    {
      year: 1980,
      title: "Expert systems",
      summary:
        "Expert systems gained prominence as AI programs designed to simulate the decision-making abilities of human experts, with applications in industries such as finance and medicine.",
    },
    {
      year: 1986,
      title: "Backpropagation in neural networks",
      summary:
        "Geoffrey Hinton, David Rumelhart and Ronald Williams introduced the backpropagation algorithm, allowing for the training of deeper neural networks and advancing machine learning techniques.",
    },
    {
      year: 1997,
      title: "Deep Blue",
      summary:
        "IBM's Deep Blue defeated chess world champion Garry Kasparov, demonstrating AI's ability to excel in strategic and highly complex tasks.",
    },
    {
      year: 2006,
      title: "Deep learning",
      summary:
        "Geoffrey Hinton's work popularised deep learning techniques, enabling breakthroughs in image and speech recognition and reinvigorating interest in AI research.",
    },
    {
      year: 2011,
      title: "IBM Watson",
      summary:
        "IBM's Watson competed on the television quiz show 'Jeopardy!' and defeated two former champions, showcasing AI's ability to process and analyse natural language at an advanced level.",
    },
    {
      year: 2012,
      title: "Advances in neural networks",
      summary:
        "Deep neural networks achieved significant success in image recognition tasks, setting the stage for modern AI applications in computer vision.",
    },
    {
      year: 2017,
      title: "Transformers",
      summary:
        "The introduction of Transformer models revolutionised natural language processing by enabling more efficient and accurate handling of text data, forming the basis for contemporary language models.",
    },
    {
      year: 2022,
      title: "ChatGPT",
      summary:
        "OpenAI launched ChatGPT, an AI conversational model that brought advanced natural language capabilities to a broad audience, transforming how people interact with AI.",
    },
    {
      year: 2023,
      title: "AI copyright lawsuit",
      summary:
        "Artists filed a class-action lawsuit against Stability AI, DeviantArt and Midjourney, raising legal questions about the use of copyrighted works in training AI models.",
    },
    {
      year: 2025,
      title: "DeepSeek",
      summary:
        "In January 2025, Chinese start-up DeepSeek released an open-source AI model developed with significantly lower resources than its Western counterparts. It led to a substantial decline in US tech stock values.",
    },
  ];

  const handleEventClick = (index) => {
    setSelectedEventIndex(selectedEventIndex === index ? null : index);
  };

  // (Optional) Arrow key navigation can remain if you want the additional functionality.
  const handleKeyDown = (event, index) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (index < events.length - 1) {
          setSelectedEventIndex(index + 1);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (index > 0) {
          setSelectedEventIndex(index - 1);
        }
        break;
      case "Home":
        event.preventDefault();
        setSelectedEventIndex(0);
        break;
      case "End":
        event.preventDefault();
        setSelectedEventIndex(events.length - 1);
        break;
      default:
        break;
    }
  };

  // Instructions for screen readers
  const instructions =
    "Use arrow keys (on desktop) or swipe gestures (on mobile) to navigate between events. Press Enter, Space, or double-tap to expand event details.";

  return (
    <div className="min-h-full bg-sky-50">
      {/* Art deco header section */}
      <div className="bg-red-800 p-8 ">
        <h1 className="text-5xl font-bold text-white mb-2 text-center tracking-widest">
          HISTORY OF AI
        </h1>
        <div className="max-w-xl mx-auto">
          <div className="h-px bg-sky-200 opacity-50"></div>
        </div>
      </div>

      {/* Timeline section */}
      <div
        className="max-w-6xl mx-auto p-8"
        ref={timelineRef}
        role="region"
        aria-label="AI History Timeline"
      >
        {/* Screen reader instructions */}
        <div className="sr-only">{instructions}</div>

        <div className="relative bg-white shadow-2xl">
          {/* Art deco background pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 40px,
                #000 40px,
                #000 41px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 40px,
                #000 40px,
                #000 41px
              )`,
            }}
            aria-hidden="true"
          ></div>

          <div className="relative p-8">
            <div className="space-y-8" role="list" aria-label="Timeline events">
              {events.map((event, index) => (
                <TimelineEvent
                  key={event.year}
                  event={event}
                  index={index}
                  isSelected={selectedEventIndex === index}
                  onClick={() => handleEventClick(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
