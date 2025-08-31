import React from "react";

interface SvgTextProps {
  text: string;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;      
  background?: string; 
  x?: number;
  y?: number;
}

const SvgText: React.FC<SvgTextProps> = ({
  text,
  width = 600,
  height = 100,
  fontSize = 20,
  fontFamily = "Arial",
  fill = "black",
  background = "white",
  x = 10,
  y = 40,
}) => (
  <svg width={width} height={height}>
    <rect width="100%" height="100%" fill={background} />
    <text
      x={x}
      y={y}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fill={fill}
      dominantBaseline="hanging"
    >
      {text}
    </text>
  </svg>
);

export default SvgText;
