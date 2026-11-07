import React, { useState } from "react";
import { motion, Transition } from "framer-motion";

export interface RandomLetterSwapProps {
  label: string;
  className?: string;
  staggerDuration?: number;
  transition?: Transition;
  onClick?: () => void;
}

export const RandomLetterSwap: React.FC<RandomLetterSwapProps> = ({
  label,
  className = "",
  staggerDuration = 0.025,
  transition = { duration: 0.6, type: "spring" },
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.span
      className={`inline-flex overflow-hidden relative cursor-pointer select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {label.split("").map((char, index) => {
        if (char === " ") {
          return <span key={index}>&nbsp;</span>;
        }
        return (
          <span key={index} className="relative inline-block overflow-hidden">
            <motion.span
              className="inline-block"
              initial={{ y: 0 }}
              animate={{ y: isHovered ? "-100%" : 0 }}
              transition={{
                ...transition,
                delay: index * staggerDuration,
              }}
            >
              {char}
            </motion.span>
            <motion.span
              className="absolute left-0 top-0 inline-block text-foreground"
              initial={{ y: "100%" }}
              animate={{ y: isHovered ? 0 : "100%" }}
              transition={{
                ...transition,
                delay: index * staggerDuration,
              }}
            >
              {char}
            </motion.span>
          </span>
        );
      })}
    </motion.span>
  );
};

export default RandomLetterSwap;
