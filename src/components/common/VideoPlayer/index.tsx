interface AndroidVideoProps {
  src: string;
  className?: string;
  autoplay?: boolean;
}

const NativeVideoPlayer = ({ src, className, autoplay = false }: AndroidVideoProps) => {
  return (
    // @ts-expect-error
    <video-player
      src={src}
      autoplay={autoplay}
      className={`bg-black overflow-hidden ${className}`}
      style={{ width: '100%', height: '210px' }}
    />
  );
};

export default NativeVideoPlayer;
