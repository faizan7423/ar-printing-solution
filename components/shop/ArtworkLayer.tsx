"use client";

import { useEffect, useRef, type PointerEventHandler } from "react";
import type { Artwork } from "./CartState";
import { artworkHeight, fonts } from "./design";

function LocalArtwork({ file, width, height }: { file: File; width: number; height: number }) {
  const image = useRef<SVGImageElement>(null);
  useEffect(() => {
    const node = image.current;
    const url = URL.createObjectURL(file);
    node?.setAttribute("href", url);
    return () => {
      node?.removeAttribute("href");
      URL.revokeObjectURL(url);
    };
  }, [file]);
  return <image ref={image} x={-width / 2} y={-height / 2} width={width} height={height} />;
}

export function ArtworkLayer({ layer, selected, onPointerDown }: { layer: Artwork; selected?: boolean; onPointerDown?: PointerEventHandler<SVGGElement> }) {
  const { width } = layer;
  const height = artworkHeight(layer);
  return <g transform={`translate(${layer.x} ${layer.y}) rotate(${layer.angle})`} onPointerDown={onPointerDown} className={onPointerDown ? "movable-art" : undefined}>
    {onPointerDown && <rect x={-width / 2} y={-height / 2} width={width} height={height} fill="transparent" />}
    {layer.kind === "image"
      ? <LocalArtwork file={layer.file} width={width} height={height} />
      : <svg x={-width / 2} y={-height / 2} width={width} height={height} overflow="hidden">
          <text x={width / 2} y={height * .55} dominantBaseline="middle" textAnchor="middle"
            fontFamily={fonts[layer.font as keyof typeof fonts]} fontWeight="700" fill={layer.ink}
            fontSize={Math.min(height * .68, width * 1.55 / Math.max(layer.text.length, 1))}>{layer.text}</text>
        </svg>}
    {selected && <rect x={-width / 2} y={-height / 2} width={width} height={height} stroke="#00a4aa" strokeWidth="1.4" fill="none" />}
  </g>;
}