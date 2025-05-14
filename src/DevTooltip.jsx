import React, { useState, useRef, useEffect } from 'react';
import './DevTooltip.css';

const DevTooltip = ({ note, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({ opacity: 0 }); // Start with opacity 0
  const tooltipRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && wrapperRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      let newCalculatedStyle = {
        opacity: 1,
        top: `${wrapperRect.height + 5}px`, // Default below wrapper
        // Default to align left of wrapper, potentially expanding right
        left: `0px`, 
        right: 'auto'
      };

      // Check if it would overflow right with this default left alignment
      const potentialRightEdgeIfLeftAligned = wrapperRect.left + tooltipRect.width;
      if (potentialRightEdgeIfLeftAligned > viewportWidth - 5) { // -5 for a small margin
        // It overflows right, so try to align to the right of the wrapper
        newCalculatedStyle.left = 'auto';
        newCalculatedStyle.right = `0px`;
      }
      
      // After *potentially* flipping to be right-aligned with wrapper, 
      // check if it *now* overflows the LEFT viewport edge.
      let finalComputedLeftEdge;
      if (newCalculatedStyle.left === 'auto' && newCalculatedStyle.right === '0px') {
        // It's right-aligned with the wrapper. Its left edge is wrapper.right - tooltip.width
        finalComputedLeftEdge = wrapperRect.right - tooltipRect.width;
      } else {
        // It's still left-aligned with the wrapper. Its left edge is wrapper.left
        finalComputedLeftEdge = wrapperRect.left;
      }

      if (finalComputedLeftEdge < 5) { // Check for left overflow (add 5px margin)
        // It overflows left, force it to be a few pixels from the viewport edge
        // This might override the right-alignment if the tooltip is very wide AND wrapper is near left edge
        newCalculatedStyle.left = `5px`;
        newCalculatedStyle.right = 'auto'; // Ensure right is not also set
      }

      setTooltipStyle(newCalculatedStyle);
    } else if (!isVisible) {
      setTooltipStyle({ opacity: 0 }); // Hide when not visible
    }
  // Rerun if visibility, note, children, or the measured size of tooltip changes (indirectly via tooltipRef.current)
  }, [isVisible, note, children, tooltipRef.current]); 

  if (!note) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={wrapperRef}
      className="dev-tooltip-wrapper"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {/* Always render the tooltip content div so ref can be used for measurement, visibility controlled by style */}
      <div 
        ref={tooltipRef} 
        className="dev-tooltip-content"
        style={tooltipStyle} 
      >
        <strong>Design Note:</strong> {note}
      </div>
    </div>
  );
};

export default DevTooltip; 