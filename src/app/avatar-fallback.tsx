interface AvatarFallbackProps {
  name: string;
  background?: string;
  size?: number;
  className?: string;
}

export function AvatarFallback({
  name,
  background = 'random',
  size = 40,
  className = '',
}: AvatarFallbackProps) {
  // Generate a random background color if 'random' is specified
  const bgColor =
    background === 'random' ? `#${Math.floor(Math.random() * 16777215).toString(16)}` : background;

  // Get initials from name (first letter of first and last name)
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div
      className={`flex items-center justify-center rounded-full ${className}`}
      style={{
        backgroundColor: bgColor,
        width: `${size}px`,
        height: `${size}px`,
        color: '#ffffff',
        fontSize: `${size / 2.5}px`,
        fontWeight: 'bold',
      }}
    >
      {initials}
    </div>
  );
}
