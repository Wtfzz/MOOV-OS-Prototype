import { createFileRoute, useNavigate } from '@tanstack/react-router';
import ResetPasswordPage from '@/components/ResetPasswordPage';

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate({ to: '/' });
  };

  return <ResetPasswordPage onBackToLogin={handleBackToLogin} />;
}
