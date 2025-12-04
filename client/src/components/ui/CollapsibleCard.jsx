import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';


const CollapsibleCard = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 border border-gray-300 rounded-md shadow-sm bg-white">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer p-4 flex justify-between items-center"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-gray-500">
              {isOpen ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
          </span>


      </div>

        {isOpen && (
            <div className="p-4 pt-0 border-t border-gray-200">
            {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleCard;
