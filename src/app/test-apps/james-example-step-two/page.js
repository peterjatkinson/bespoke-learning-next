"use client";
import React, { useState } from 'react';

const CafePricingExercise = () => {
  // Define the pricing data
  const pricingData = {
    '2': { quantity: 250, revenue: 500 },
    '3': { quantity: 200, revenue: 600 },
    '4': { quantity: 120, revenue: 480 },
    '6': { quantity: 60, revenue: 360 },
    '8': { quantity: 30, revenue: 240 }
  };
  
  // Price options for dropdown
  const priceOptions = ['', '2', '3', '4', '6', '8'];
  
  // State to track selected prices for each row
  const [selectedPrices, setSelectedPrices] = useState(['', '', '', '', '']);
  
  // State for screen reader announcement
  const [announcement, setAnnouncement] = useState('');
  
  // Handle price selection change
  const handlePriceChange = (index, price) => {
    const newSelectedPrices = [...selectedPrices];
    newSelectedPrices[index] = price;
    setSelectedPrices(newSelectedPrices);
  };
  
  // Get feedback based on selected price
  const getFeedback = (price) => {
    if (!price) return "";
    
    const feedbackMap = {
      '2': "You chose a low price and sold a lot of coffee—250 cups! However, your total revenue was only **£500**, which is **less than what you could have earned**. A lower price increases quantity demanded, but doesn't always maximise revenue if the price is too low.",
      '3': "Excellent choice! You priced coffee at £3, sold 200 cups, and earned **£600**—the **highest total revenue** possible. You found the sweet spot where price and quantity are optimally balanced. This is the classic **revenue-maximising point** for a monopolist.",
      '4': "You charged £4 and sold 120 cups, earning **£480**. While the price was higher, **fewer customers bought your coffee**—and total revenue dropped compared to the £3 price point. Raising prices reduces quantity demanded. Sometimes, a moderate price leads to higher total revenue.",
      '6': "At £6 per cup, you only sold 60 cups and earned £360. Many customers were unwilling to pay the higher price, causing a sharp fall in quantity demanded. Even though each sale earned more per cup, the overall revenue fell because you lost too many buyers. Demand is sensitive—raising price too much can backfire.",
      '8': "You set a very high price of £8 per cup but only sold 30 cups, earning just £240. Most customers found the price too expensive and chose not to buy. In monopolies, being the only seller doesn't mean you can charge anything you want. Customers still react to prices, and elastic demand limits how much you can profit from very high pricing."
    };
    
    return feedbackMap[price];
  };
  
  // Reset all selections
  const resetSelections = () => {
    setSelectedPrices(['', '', '', '', '', '']);
    setAnnouncement('Table has been reset. All price selections have been cleared.');
    // Clear the announcement after it's been read
    setTimeout(() => setAnnouncement(''), 100);
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h1 className="text-2xl font-bold mb-4">Imperial Business School café: Pricing exercise</h1>
        <p className="mb-4">
          Congratulations! You are now the manager of the only café inside Imperial Business School. Since you are the only seller, you can decide what price to charge for coffee. But beware: charging too much could scare away customers.
        </p>
        <p className="mb-4">
          As a monopolist, your goal is to set a price that maximises total revenue. Remember:<br />
          <strong>Total revenue = Price × Quantity sold</strong>
        </p>
        <p className="mb-4">
          Try out different prices to see how customers respond and how your total revenue changes. Customers may not respond in the way you expect!
        </p>
        <p className="mb-4">
          Feedback for each price point will be provided below the table.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <caption className="sr-only">
            Cafe Pricing Experiment Table: Select prices in each row to see the corresponding quantity demanded and total revenue. Feedback is provided after the table.
          </caption>
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-6 text-left border-b">Price per cup (£)</th>
              <th className="py-3 px-6 text-left border-b">Quantity demanded</th>
              <th className="py-3 px-6 text-left border-b">Total revenue (£)</th>
            </tr>
          </thead>
          <tbody>
            {selectedPrices.map((selectedPrice, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                
                <td className="py-3 px-6 border-b">
                  <select
                    value={selectedPrice}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    className="border rounded p-2 w-full min-w-[120px]"
                  >
                    {priceOptions.map((price) => (
                      <option key={price} value={price}>
                        {price ? `£${price}` : 'Select price'}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-6 border-b">
                  {selectedPrice ? pricingData[selectedPrice].quantity : ''}
                </td>
                <td className="py-3 px-6 border-b">
                  {selectedPrice ? `£${pricingData[selectedPrice].revenue}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Feedback</h2>
        <div className="p-4 bg-blue-50 rounded-lg">
          {selectedPrices.some(price => price) ? (
            <div>
              {selectedPrices.map((price, index) => (
                price ? (
                  <div key={index} className="mb-3">
                    <p className="font-semibold">For price £{price}:</p>
                    <p className="mt-1" dangerouslySetInnerHTML={{ __html: getFeedback(price).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                  </div>
                ) : null
              ))}
            </div>
          ) : (
            <p>Select prices from the dropdown menus to see feedback.</p>
          )}
        </div>
        
        <button 
          onClick={resetSelections} 
          className="mt-6 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-2"
        >
          Reset table
        </button>
        
        {/* Screen reader announcement */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
      </div>
    </div>
  );
};

export default CafePricingExercise;