import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const { token, hasRole } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      if (hasRole('cashier')) navigate('/pos');
      else navigate('/dashboard');
    }
  }, [token, navigate, hasRole]);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Left Hemisphere: Artistic / Maximalist Typo */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full md:w-1/2 lg:w-3/5 bg-primary relative flex flex-col justify-end p-12 overflow-hidden min-h-[40vh] md:min-h-screen"
      >
        {/* Abstract shapes / gradients for texture */}
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] md:w-[30vw] md:h-[30vw] bg-secondary/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 mix-blend-overlay"></div>
        
        <div className="relative z-10 text-primary-foreground max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl font-semibold leading-[0.9] tracking-tighter mb-6">
              Kopi<br/>Nusantara.
            </h1>
            <p className="font-sans text-lg md:text-xl font-light opacity-80 max-w-md">
              Point of Sale & Management System. Elegance in every cup, precision in every transaction.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Hemisphere: Minimalist Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 md:p-12 lg:p-24 relative z-10 bg-background/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="mb-10 text-center md:text-left">
            <h2 className="font-serif text-3xl font-medium mb-2 text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground font-sans font-light tracking-wide">Sign in to your console</p>
          </div>
          
          <LoginForm />
        </motion.div>
      </div>
    </div>
  );
}
