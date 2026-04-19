import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await login(data);
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
        toast.success("Welcome back, " + response.data.user.name);
        
        if (response.data.user.roles.includes('cashier')) {
          navigate('/pos');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2 group">
        <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Email Directory</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="owner@test.com"
          className="border-b-2 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary transition-colors text-lg shadow-none"
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2 group">
        <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Security Credential</Label>
        <Input 
          id="password" 
          type="password" 
          placeholder="••••••••"
          className="border-b-2 border-t-0 border-l-0 border-r-0 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary transition-colors text-lg shadow-none"
          disabled={isLoading}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full h-14 rounded-full text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Authenticating...
          </>
        ) : (
          "Access Console"
        )}
      </Button>
    </form>
  );
}
