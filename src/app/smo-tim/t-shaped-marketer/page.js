"use client";

import React, { useState } from 'react';

const TShapedTemplate = () => {
  // Five broad skills & three deep skills
  const [broadSkills, setBroadSkills] = useState(['', '', '', '', '']);
  const [deepSkills, setDeepSkills] = useState(['', '', '']);

  const handleBroadSkillChange = (index, value, event) => {
    // Auto-resize the textarea: reset height and adjust to scrollHeight
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';

    const newSkills = [...broadSkills];
    newSkills[index] = value;
    setBroadSkills(newSkills);
  };

  const handleDeepSkillChange = (index, value, event) => {
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';

    const newSkills = [...deepSkills];
    newSkills[index] = value;
    setDeepSkills(newSkills);
  };

  return (
    <div className="bg-white min-h-full">
      <div className="max-w-[1200px] mx-auto p-12">
        <h1 className="text-2xl text-blue-600 text-center mb-12">
          What kind of T-shaped marketer will you be?
        </h1>

        {/* Desktop T-shape layout using CSS Grid (no absolute positioning) */}
        <div className="hidden md:grid grid-cols-5 gap-y-8 bg-white">
          {/* Row 1: Broad skills heading, spanning all 5 columns */}
          <div className="col-span-5">
            <h2 className="text-lg font-medium text-gray-700 text-center mb-4">
              Broad skills
            </h2>
          </div>

          {/* Row 2: 5 broad skill textareas, each in its own column */}
          {broadSkills.map((skill, index) => (
            <div key={`broad-${index}`} className="col-span-1 px-2">
              <textarea
                value={skill}
                onChange={(e) =>
                  handleBroadSkillChange(index, e.target.value, e)
                }
                placeholder={`Broad skill ${index + 1}`}
                aria-label={`Broad skill ${index + 1}`}
                className="px-4 py-3 border-2 border-gray-200 rounded focus:border-blue-500 focus:outline-none text-base leading-relaxed w-full overflow-hidden resize-none"
                style={{
                  lineHeight: '1.5',
                  minHeight: '56px'
                }}
              />
            </div>
          ))}

          {/* Row 3: Deep expertise heading in the center column (col 3) */}
          <div className="col-start-3 col-span-1 text-center">
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              Deep expertise
            </h2>
          </div>

          {/* Row 4: Deep skill textareas in the center column (col 3) */}
          <div className="col-start-3 col-span-1 space-y-6">
            {deepSkills.map((skill, index) => (
              <textarea
                key={`deep-${index}`}
                value={skill}
                onChange={(e) =>
                  handleDeepSkillChange(index, e.target.value, e)
                }
                placeholder={`Deep expertise ${index + 1}`}
                aria-label={`Deep expertise ${index + 1}`}
                className="px-4 py-3 border-2 border-gray-200 rounded focus:border-blue-500 focus:outline-none text-base leading-relaxed w-full overflow-hidden resize-none"
                style={{
                  lineHeight: '1.5',
                  minHeight: '56px'
                }}
              />
            ))}
          </div>
        </div>

        {/* Mobile stacked layout */}
        <div className="md:hidden space-y-12">
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              Broad skills
            </h2>
            <div className="space-y-4">
              {broadSkills.map((skill, index) => (
                <div key={`broad-${index}`} className="w-full">
                  <textarea
                    value={skill}
                    onChange={(e) =>
                      handleBroadSkillChange(index, e.target.value, e)
                    }
                    placeholder={`Broad skill ${index + 1}`}
                    aria-label={`Broad skill ${index + 1}`}
                    className="px-4 py-3 border-2 border-gray-200 rounded focus:border-blue-500 focus:outline-none text-base leading-relaxed w-full overflow-hidden resize-none"
                    style={{
                      lineHeight: '1.5',
                      minHeight: '56px'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              Deep expertise
            </h2>
            <div className="space-y-4">
              {deepSkills.map((skill, index) => (
                <div key={`deep-${index}`} className="w-full">
                  <textarea
                    value={skill}
                    onChange={(e) =>
                      handleDeepSkillChange(index, e.target.value, e)
                    }
                    placeholder={`Deep expertise ${index + 1}`}
                    aria-label={`Deep expertise ${index + 1}`}
                    className="px-4 py-3 border-2 border-gray-200 rounded focus:border-blue-500 focus:outline-none text-base leading-relaxed w-full overflow-hidden resize-none"
                    style={{
                      lineHeight: '1.5',
                      minHeight: '56px'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TShapedTemplate;
