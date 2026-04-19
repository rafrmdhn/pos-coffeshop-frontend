import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import NumPad from '@/components/auth/NumPad';
import { pinLogin } from '@/services/auth';
import { toast } from 'sonner';

export default function PinLoginPage() {
  const [pin, setPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { token, setAuth, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const controls = useAnimation();
  const maxPinLength = 4; // Kopi Nusantara requires 4 digit PIN

  useEffect(() => {
    if (token) {
      if (hasRole('cashier')) navigate('/pos');
      else navigate('/dashboard');
    }
  }, [token, navigate, hasRole]);

  useEffect(() => {
    if (pin.length === maxPinLength && !isLoading) {
      handleLogin(pin);
    }
  }, [pin]);

  const handleLogin = async (submittedPin: string) => {
    setIsLoading(true);
    try {
      // Hardcoded outlet_id for demo, would come from local setting
      const response = await pinLogin({ pin: submittedPin, outlet_id: '0000' });
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        toast.success(`Welcome Kasir ${response.data.user.name}`);
        navigate('/pos');
      }
    } catch (err: any) {
      // Trigger shake animation on error
      controls.start({
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      });
      setPin('');
      toast.error(err.message || 'Invalid PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyPress = (key: string) => {
    if (isLoading) return;
    
    if (key === 'clear') {
      setPin('');
    } else if (key === 'backspace') {
      setPin(p => p.slice(0, -1));
    } else {
      if (pin.length < maxPinLength) {
        setPin(p => p + key);
      }
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background px-4 py-6 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute opacity-30 top-10 left-10 w-[40vw] h-[40vw] max-w-sm bg-primary/20 rounded-full blur-3xl pointer-events-none mix-blend-overlay"></div>
      <div className="absolute opacity-30 bottom-10 right-10 w-[30vw] h-[30vw] max-w-xs bg-secondary/30 rounded-full blur-3xl pointer-events-none mix-blend-overlay"></div>

      <div className="absolute top-12 md:top-20 text-center w-full max-w-sm">
        <h3 className="font-serif text-primary text-xl md:text-2xl font-semibold opacity-90 tracking-tight">Cabang Aktif</h3>
        <p className="font-sans font-semibold mt-1 text-xs text-muted-foreground uppercase tracking-[0.2em] opacity-80">Kopi Nusantara Pusat</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm flex flex-col items-center mt-16 md:mt-24 z-10"
      >
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-medium mb-3 tracking-tighter">Masukkan PIN</h1>
          <p className="text-muted-foreground font-light text-sm tracking-wide">Akses khusus kasir terminal</p>
        </div>

        {/* PIN Dots Indicator */}
        <motion.div animate={controls} className="flex gap-4 mb-12 h-6 items-center">
          {Array.from({ length: maxPinLength }).map((_, i) => {
            const isActive = i < pin.length;
            return (
              <motion.div 
                key={i}
                initial={false}
                animate={{ 
                  scale: isActive ? 1.4 : 1,
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-muted)'
                }}
                className="w-4 h-4 rounded-full transition-colors duration-200 shadow-sm"
              />
            )
          })}
        </motion.div>

        <NumPad onKeyPress={onKeyPress} />
        
        <button 
          onClick={() => navigate('/login')}
          className="mt-12 text-sm text-foreground/60 hover:text-primary transition-colors underline underline-offset-4 tracking-wide font-medium"
        >
          Masuk dengan ID
        </button>
      </motion.div>
    </div>
  );
}
