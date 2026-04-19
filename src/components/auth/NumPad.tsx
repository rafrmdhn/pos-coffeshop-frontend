import { Delete } from 'lucide-react';

interface NumPadProps {
  onKeyPress: (key: string) => void;
}

export default function NumPad({ onKeyPress }: NumPadProps) {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20); // Subtle 20ms vibration if supported
    }
  };

  const handlePress = (key: string) => {
    triggerHaptic();
    onKeyPress(key);
  };

  const keys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'clear', '0', 'backspace'
  ];

  return (
    <div className="grid grid-cols-3 gap-5 md:gap-7 w-full max-w-xs mx-auto">
      {keys.map((key) => {
        const isAction = key === 'clear' || key === 'backspace';
        return (
          <button
            key={key}
            onClick={() => handlePress(key)}
            className={`
              flex items-center justify-center 
              h-16 md:h-20 w-16 md:w-20 mx-auto
              rounded-full transition-all duration-100 ease-in-out active:scale-[0.85] select-none
              ${
                isAction 
                  ? 'text-muted-foreground hover:bg-muted/50 text-sm font-semibold tracking-wide shadow-none border border-transparent hover:border-border/30' 
                  : 'bg-muted/10 hover:bg-muted/30 text-foreground font-sans font-medium text-2xl md:text-3xl border border-border/20 shadow-sm hover:shadow-md'
              }
            `}
          >
            {key === 'backspace' ? (
              <Delete size={26} strokeWidth={2.5} />
            ) : key === 'clear' ? (
              'CLR'
            ) : (
              key
            )}
          </button>
        );
      })}
    </div>
  );
}
